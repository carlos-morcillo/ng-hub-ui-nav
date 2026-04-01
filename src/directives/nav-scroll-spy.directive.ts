import {
	AfterViewInit,
	Directive,
	ElementRef,
	NgZone,
	OnDestroy,
	computed,
	effect,
	inject,
	input,
	output,
	signal
} from '@angular/core';

/**
 * Scroll spy container directive that tracks the currently visible section and
 * emits section changes using `IntersectionObserver`.
 */
@Directive({
	selector: '[hubNavScrollSpy]',
	standalone: true,
	exportAs: 'hubNavScrollSpy'
})
export class HubNavScrollSpyDirective implements AfterViewInit, OnDestroy {
	/** Enables or disables section tracking. */
	readonly enabled = input<boolean>(true, { alias: 'hubNavScrollSpy' });

	/** Top offset in pixels to compensate sticky headers. */
	readonly offset = input<number>(120);

	/** CSS selector used to locate section elements inside the host container. */
	readonly sectionSelector = input<string>('[data-hub-nav-scroll-spy-section]');

	/** Emits the active section id whenever it changes. */
	readonly activeSectionChange = output<string>();

	private readonly el = inject(ElementRef<HTMLElement>);
	private readonly zone = inject(NgZone);

	private observer: IntersectionObserver | null = null;
	private activeId = signal<string | null>(null);
	private initialized = signal<boolean>(false);

	/** Current active section id (readonly signal). */
	readonly activeSectionId = computed(() => this.activeId());

	private readonly configEffect = effect(() => {
		if (!this.initialized()) {
			return;
		}

		const isEnabled = this.enabled();
		const topOffset = this.offset();
		const selector = this.sectionSelector();
		void topOffset;
		void selector;

		if (!isEnabled) {
			this.destroyObserver();
			return;
		}

		this.scheduleInit();
	});

	/** @inheritDoc */
	ngAfterViewInit(): void {
		this.initialized.set(true);
		if (this.enabled()) {
			this.scheduleInit();
		}
	}

	/** @inheritDoc */
	ngOnDestroy(): void {
		this.destroyObserver();
	}

	/**
	 * Scrolls to a tracked section by id.
	 *
	 * @param sectionId - Target section id.
	 * @param behavior - Native scroll behavior.
	 * @returns `true` when the target exists and scroll was requested.
	 */
	scrollTo(sectionId: string, behavior: ScrollBehavior = 'smooth'): boolean {
		const target = this.getSectionElements().find((element) => this.getSectionId(element) === sectionId);
		if (!target) {
			return false;
		}

		target.scrollIntoView({
			behavior,
			block: 'start',
			inline: 'nearest'
		});
		return true;
	}

	private scheduleInit(): void {
		this.zone.runOutsideAngular(() => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					this.zone.run(() => this.initializeObserver());
				});
			});
		});
	}

	private initializeObserver(): void {
		this.destroyObserver();

		const sections = this.getSectionElements();
		if (sections.length === 0) {
			return;
		}

		const topOffset = this.offset();
		this.observer = new IntersectionObserver(
			(entries) => this.handleObserverEntries(entries),
			{
				root: null,
				rootMargin: `-${topOffset}px 0px -55% 0px`,
				threshold: [0.05, 0.2, 0.4, 0.6, 0.8]
			}
		);

		sections.forEach((section) => this.observer?.observe(section));
	}

	private destroyObserver(): void {
		this.observer?.disconnect();
		this.observer = null;
	}

	private getSectionElements(): HTMLElement[] {
		return Array.from(
			this.el.nativeElement.querySelectorAll(this.sectionSelector())
		).filter((node): node is HTMLElement => node instanceof HTMLElement);
	}

	private getSectionId(element: HTMLElement): string | null {
		return element.getAttribute('data-hub-nav-scroll-spy-section') ?? element.id ?? null;
	}

	private handleObserverEntries(entries: IntersectionObserverEntry[]): void {
		const visible = entries
			.filter((entry) => entry.isIntersecting)
			.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

		if (visible.length === 0) {
			return;
		}

		const top = visible[0];
		const id = this.getSectionId(top.target as HTMLElement);
		if (!id || id === this.activeId()) {
			return;
		}

		this.activeId.set(id);
		this.activeSectionChange.emit(id);
	}
}

