import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { HubNavItemListComponent } from './nav-item-list.component';
import { HubNavStateService } from '../../services/nav-state.service';
import { HubNavItem } from '../../models/nav-item.model';

/**
 * The travelling active mark.
 *
 * Normally each item paints its own; with `config.activeIndicator` the list paints one
 * that moves between them, because nothing can animate between two separate elements.
 *
 * Geometry is measured from the DOM, which jsdom lays out as zeroes — so what is
 * asserted here is everything except the pixels: whether the mark exists, which wrapper
 * it was measured from, and that it is off unless asked for. The travel itself was
 * verified in a browser.
 */
describe('HubNavItemListComponent travelling indicator', () => {
	let fixture: ComponentFixture<HubNavItemListComponent>;
	let componentRef: ComponentRef<HubNavItemListComponent>;
	let state: HubNavStateService;

	const items: HubNavItem[] = [
		{ id: 'home', label: 'Home', type: 'link', route: '/home' },
		{ id: 'sep', label: '', type: 'separator' },
		{ id: 'about', label: 'About', type: 'link', route: '/about' }
	];

	/** Lets the two scheduled animation frames run, which is when measuring happens. */
	async function settle(): Promise<void> {
		fixture.detectChanges();
		await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
		fixture.detectChanges();
	}

	function indicator(): HTMLElement | null {
		return fixture.nativeElement.querySelector('.hub-nav-item-list__indicator');
	}

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubNavItemListComponent],
			providers: [
				HubNavStateService,
				// Declared so `navigateByUrl` actually lands: the component reads `router.url`,
				// and an unmatched navigation leaves it on the previous route.
				provideRouter([
					{ path: 'home', children: [] },
					{ path: 'about', children: [] },
					{ path: 'somewhere-else', children: [] }
				])
			]
		}).compileComponents();

		state = TestBed.inject(HubNavStateService);
		fixture = TestBed.createComponent(HubNavItemListComponent);
		componentRef = fixture.componentRef;
		componentRef.setInput('items', items);
		// First render before navigating: the component subscribes to router events in
		// `ngOnInit`, so a navigation fired earlier would never reach it.
		fixture.detectChanges();
	});

	/** The mark belongs to each item until an application says otherwise. */
	it('paints nothing extra by default', async () => {
		await settle();

		expect(indicator()).toBeNull();
		expect((fixture.nativeElement as HTMLElement).classList).not.toContain('hub-nav-item-list--animated-indicator');
	});

	it('marks the list when the indicator is enabled', async () => {
		state.setConfig({ ...state.config(), activeIndicator: true });
		await settle();

		expect((fixture.nativeElement as HTMLElement).classList).toContain('hub-nav-item-list--animated-indicator');
	});

	it('renders no mark while nothing in the list is active', async () => {
		state.setConfig({ ...state.config(), activeIndicator: true });
		await TestBed.inject(Router).navigateByUrl('/somewhere-else');
		await settle();

		expect(indicator()).toBeNull();
	});

	it('renders the mark once an item is active', async () => {
		state.setConfig({ ...state.config(), activeIndicator: true });
		await TestBed.inject(Router).navigateByUrl('/about');
		await settle();

		expect(indicator()).toBeTruthy();
		expect(indicator()!.getAttribute('aria-hidden')).toBe('true');
	});

	/**
	 * The trap this mapping exists for: separators render no wrapper, so the wrapper
	 * list is shorter than the item list and their indices stop agreeing after the
	 * first one. Reading the wrapper at the ITEM's index parks the mark one item early.
	 */
	it('measures the wrapper of the active item, not the one at its item index', async () => {
		state.setConfig({ ...state.config(), activeIndicator: true });
		await TestBed.inject(Router).navigateByUrl('/about');
		fixture.detectChanges();

		// `about` is item 2 and wrapper 1, because the separator between them has none.
		const wrappers = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.hub-nav-item-wrapper')];
		expect(wrappers.length).toBe(2);

		wrappers.forEach((wrapper, index) =>
			Object.defineProperty(wrapper, 'offsetTop', { value: (index + 1) * 100, configurable: true })
		);

		await settle();

		// 200 is the second wrapper; 300 would be the third, which does not exist.
		expect(indicator()!.style.transform).toContain('200px');
	});

	/**
	 * The distinction the mark rests on: a scroll spy REPLACES the URL to say where the
	 * reader already is, while a nav link PUSHES one because they chose to go there.
	 * Only the second is narrated.
	 */
	it('travels for a pushed navigation and arrives for a replaced one', async () => {
		state.setConfig({ ...state.config(), activeIndicator: true });
		const router = TestBed.inject(Router);

		// Distinct boxes, or jsdom's uniform zeroes make every move look like no move.
		const wrappers = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.hub-nav-item-wrapper')];
		wrappers.forEach((wrapper, index) =>
			Object.defineProperty(wrapper, 'offsetTop', { value: (index + 1) * 100, configurable: true })
		);

		await router.navigateByUrl('/about');
		await settle();
		expect(fixture.componentInstance.indicatorSnap()).toBe(false);

		await router.navigate(['/home'], { replaceUrl: true });
		await settle();
		expect(fixture.componentInstance.indicatorSnap()).toBe(true);
	});

	/**
	 * The escape hatch for a menu that should not narrate a scroll at all. Measured on
	 * this project's own sidebar, following the spy restyled a thirty-item panel twenty
	 * times in six seconds of ordinary reading.
	 */
	it('ignores a replaced URL entirely when told not to follow one', async () => {
		state.setConfig({ ...state.config(), activeIndicator: true, followReplacedUrls: false });
		const router = TestBed.inject(Router);

		await router.navigateByUrl('/about');
		await settle();
		const chosen = indicator()!.style.transform;

		// A scroll spy writes this on every scroll; the mark must not react at all.
		await router.navigate(['/home'], { replaceUrl: true });
		await settle();

		expect(indicator()!.style.transform).toBe(chosen);
		expect(fixture.componentInstance.indicatorSnap()).toBe(false);
	});

	/**
	 * The middle setting, and the one worth having: the mark still follows the reader,
	 * it just waits for them to stop rather than walking down the menu behind them.
	 */
	it('follows a stream of reports only once it goes quiet', async () => {
		state.setConfig({ ...state.config(), activeIndicator: true, followReplacedUrls: 150 });
		const router = TestBed.inject(Router);

		// Distinct boxes, or jsdom's uniform zeroes make every move look like no move.
		const wrappers = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.hub-nav-item-wrapper')];
		wrappers.forEach((wrapper, index) =>
			Object.defineProperty(wrapper, 'offsetTop', { value: (index + 1) * 100, configurable: true })
		);

		await router.navigateByUrl('/about');
		await settle();
		const before = indicator()!.style.transform;

		// Mid-stream: the reader is still scrolling, so the mark has not moved yet.
		await router.navigate(['/home'], { replaceUrl: true });
		await settle();
		expect(indicator()!.style.transform).toBe(before);

		// They stop, and it lands once.
		fixture.detectChanges();
		await new Promise((resolve) => setTimeout(resolve, 220));
		await settle();
		expect(fixture.componentInstance.indicatorSnap()).toBe(true);
	});

	/** Turning it off has to put the mark back on the items, not leave an orphan. */
	it('drops the mark when the indicator is turned off again', async () => {
		state.setConfig({ ...state.config(), activeIndicator: true });
		await TestBed.inject(Router).navigateByUrl('/about');
		await settle();
		expect(indicator()).toBeTruthy();

		state.setConfig({ ...state.config(), activeIndicator: false });
		await settle();

		expect(indicator()).toBeNull();
	});
});
