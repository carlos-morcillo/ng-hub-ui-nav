import {
	Component,
	ChangeDetectionStrategy,
	input,
	output,
	inject,
	computed,
	ElementRef,
	HostListener,
	OnDestroy,
	OnInit,
	signal,
	TemplateRef
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { HubNavItem } from '../../models/nav-item.model';
import { HubNavVerticalExpandMode } from '../../models/nav-config.model';
import { HubNavItemComponent } from '../nav-item/nav-item.component';
import { HubNavSeparatorComponent } from '../nav-separator/nav-separator.component';
import { HubNavStateService } from '../../services/nav-state.service';

/**
 * Renders a list of navigation items at a given depth level.
 * Self-recursive: when an item has children and its dropdown is open,
 * this component renders another `hub-nav-item-list` for the children.
 *
 * Includes keyboard navigation following WAI-ARIA menubar/menu patterns.
 *
 * @internal Used internally by `HubNavComponent`.
 */
@Component({
	selector: 'hub-nav-item-list',
	standalone: true,
	imports: [HubNavItemComponent, HubNavSeparatorComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'hub-nav-item-list',
		'[class.hub-nav-item-list--force-accordion]': 'forceAccordionMode()',
		'[attr.role]': 'depth() === 0 ? "menubar" : "menu"'
	},
	templateUrl: './nav-item-list.component.html',
	styleUrl: './nav-item-list.component.scss'
})
export class HubNavItemListComponent implements OnInit, OnDestroy {
	/** The list of items to render. */
	readonly items = input.required<HubNavItem[]>();

	/** Nesting depth (0 = root level). */
	readonly depth = input<number>(0);

	/** Optional custom template for rendering item content. */
	readonly itemTemplate = input<TemplateRef<unknown> | null>(null);

	/**
	 * Forces all nested items in this list to use accordion expansion.
	 * Primarily used by the collapsed/mobile panel to avoid flyout/panel
	 * behaviors that are not suitable for small viewports.
	 */
	readonly forceAccordionMode = input<boolean>(false);

	/** Emitted when any item in the list is clicked. */
	readonly itemClick = output<{ item: HubNavItem; event: Event }>();

	/** Emitted when a dropdown toggle is requested. */
	readonly dropdownToggle = output<HubNavItem>();

	/** Emitted when an item with panel expand mode is clicked and needs a new panel. */
	readonly panelOpen = output<HubNavItem>();

	/** Reference to the nav state service. */
	readonly state = inject(HubNavStateService);

	/** Reference to the Angular router for active state detection. */
	private readonly router = inject(Router);

	/** Reactive URL value used to recompute active states on navigation changes. */
	private readonly currentUrl = signal<string>(this.router.url);

	/** Router events subscription lifecycle handle. */
	private routerSub?: Subscription;

	/** Host element reference. */
	private readonly el = inject(ElementRef<HTMLElement>);

	/**
	 * Whether children should render in accordion mode (inline with indentation).
	 * True when orientation is vertical and expand mode is 'accordion'.
	 */
	readonly isAccordionMode = computed(
		() =>
			this.forceAccordionMode() ||
			(this.state.orientation() === 'vertical' && this.state.verticalExpandMode() === 'accordion')
	);

	/** Whether this is a horizontal root-level nav (affects arrow key mapping). */
	private get isHorizontalRoot(): boolean {
		if (this.forceAccordionMode()) {
			return false;
		}

		return this.state.orientation() === 'horizontal' && this.depth() === 0;
	}

	// ──────────────────────────────────────────────
	// Data methods
	// ──────────────────────────────────────────────

	/**
	 * Checks if the given item or any of its descendants is currently active.
	 *
	 * @param item - The item to check.
	 * @returns `true` if the item or a descendant matches the current route.
	 */
	isItemActive(item: HubNavItem): boolean {
		return this.state.isItemOrDescendantActive(item, this.currentUrl());
	}

	/** @inheritDoc */
	ngOnInit(): void {
		this.routerSub = this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe(() => {
				this.currentUrl.set(this.router.url);
			});
	}

	/** @inheritDoc */
	ngOnDestroy(): void {
		this.routerSub?.unsubscribe();
	}

	/**
	 * Checks if a dropdown is currently expanded.
	 *
	 * @param item - The dropdown item to check.
	 * @returns `true` if the dropdown is open.
	 */
	isExpanded(item: HubNavItem): boolean {
		// In panel mode, "expanded" means "there is an open panel for this item".
		if (this.getItemExpandMode(item) === 'panel') {
			return this.state.isPanelOpenForItem(item.id);
		}

		return this.state.isDropdownOpen(item.id);
	}

	/**
	 * Whether the given item has child items.
	 *
	 * @param item - The item to check.
	 * @returns `true` if the item has children.
	 */
	hasChildren(item: HubNavItem): boolean {
		return !!item.children && item.children.length > 0;
	}

	/**
	 * Resolves the effective expand mode for an item.
	 * Considers per-item override, global config, and mobile fallback.
	 *
	 * @param item - The item to resolve the expand mode for.
	 * @returns The effective expand mode.
	 */
	getItemExpandMode(item: HubNavItem): HubNavVerticalExpandMode {
		if (this.forceAccordionMode()) {
			return 'accordion';
		}

		return this.state.getEffectiveExpandMode(item);
	}

	// ──────────────────────────────────────────────
	// Event handlers
	// ──────────────────────────────────────────────

	/**
	 * Handles click events from a child item component.
	 *
	 * @param payload - The item and original event.
	 */
	onItemClick(payload: { item: HubNavItem; event: Event }): void {
		this.itemClick.emit(payload);
	}

	/**
	 * Handles dropdown toggle events from a child item component.
	 * In panel mode, emits `panelOpen` instead of toggling the dropdown.
	 *
	 * @param item - The dropdown item to toggle.
	 */
	onDropdownToggle(item: HubNavItem): void {
		const mode = this.getItemExpandMode(item);
		if (mode === 'panel') {
			this.panelOpen.emit(item);
			return;
		}

		// Get sibling IDs for accordion auto-close behavior
		const siblingIds = this.items()
			.filter((i) => i.type === 'dropdown' || this.hasChildren(i))
			.map((i) => i.id);

		if (this.state.isDropdownOpen(item.id)) {
			this.state.closeDropdown(item.id);
		} else {
			this.state.openDropdown(item.id, siblingIds);
		}

		this.dropdownToggle.emit(item);
	}

	/**
	 * Handles hover enter events on items with children.
	 * Opens the dropdown if the trigger mode includes hover.
	 *
	 * @param item - The hovered item.
	 */
	onItemMouseEnter(item: HubNavItem): void {
		if (this.forceAccordionMode()) {
			return;
		}

		const trigger = this.state.dropdownTrigger();
		if ((trigger === 'hover' || trigger === 'both') && this.hasChildren(item)) {
			// Get sibling IDs for accordion auto-close behavior
			const siblingIds = this.items()
				.filter((i) => i.type === 'dropdown' || this.hasChildren(i))
				.map((i) => i.id);
			this.state.openDropdown(item.id, siblingIds);
		}
	}

	/**
	 * Handles hover leave events on items with children.
	 * Closes the dropdown if the trigger mode includes hover.
	 *
	 * @param item - The item that lost hover.
	 */
	onItemMouseLeave(item: HubNavItem): void {
		if (this.forceAccordionMode()) {
			return;
		}

		const trigger = this.state.dropdownTrigger();
		if ((trigger === 'hover' || trigger === 'both') && this.hasChildren(item)) {
			this.state.closeDropdown(item.id);
		}
	}

	// ──────────────────────────────────────────────
	// Keyboard navigation (WAI-ARIA menubar/menu)
	// ──────────────────────────────────────────────

	/**
	 * Handles keyboard events for accessible navigation.
	 *
	 * @param event - The keyboard event.
	 */
	@HostListener('keydown', ['$event'])
	onKeyDown(event: KeyboardEvent): void {
		const items = this.getFocusableItems();
		const currentIndex = this.getCurrentFocusIndex(items);

		switch (event.key) {
			case 'ArrowRight':
				event.preventDefault();
				event.stopPropagation();
				if (this.isHorizontalRoot) {
					this.focusItem(items, currentIndex + 1);
				} else {
					this.openFocusedDropdown(items, currentIndex);
				}
				break;

			case 'ArrowLeft':
				event.preventDefault();
				event.stopPropagation();
				if (this.isHorizontalRoot) {
					this.focusItem(items, currentIndex - 1);
				} else {
					this.closeFocusedDropdown(items, currentIndex);
				}
				break;

			case 'ArrowDown':
				event.preventDefault();
				event.stopPropagation();
				if (this.isHorizontalRoot) {
					this.openFocusedDropdown(items, currentIndex);
				} else {
					this.focusItem(items, currentIndex + 1);
				}
				break;

			case 'ArrowUp':
				event.preventDefault();
				event.stopPropagation();
				if (this.isHorizontalRoot) {
					this.closeFocusedDropdown(items, currentIndex);
				} else {
					this.focusItem(items, currentIndex - 1);
				}
				break;

			case 'Home':
				event.preventDefault();
				event.stopPropagation();
				this.focusItem(items, 0);
				break;

			case 'End':
				event.preventDefault();
				event.stopPropagation();
				this.focusItem(items, items.length - 1);
				break;

			case 'Escape':
				event.preventDefault();
				event.stopPropagation();
				this.state.closeAllDropdowns();
				// Return focus to parent trigger if in a submenu
				if (this.depth() > 0) {
					const parentWrapper = (this.el.nativeElement as HTMLElement).closest('.hub-nav-item-wrapper');
					const trigger = parentWrapper?.querySelector(
						':scope > hub-nav-item .hub-nav-item__dropdown-toggle'
					) as HTMLElement | null;
					trigger?.focus();
				}
				break;

			default:
				return;
		}
	}

	/** Returns all focusable item elements (direct children only). */
	private getFocusableItems(): HTMLElement[] {
		const host = this.el.nativeElement as HTMLElement;
		const selectors =
			':scope > .hub-nav-item-wrapper > hub-nav-item .hub-nav-item__link,' +
			':scope > .hub-nav-item-wrapper > hub-nav-item .hub-nav-item__dropdown-toggle';
		const elements = host.querySelectorAll(selectors);
		return (Array.from(elements) as HTMLElement[]).filter(
			(el) => el.getAttribute('aria-disabled') !== 'true' && el.tabIndex !== -1
		);
	}

	/** Returns the index of the currently focused item. */
	private getCurrentFocusIndex(items: HTMLElement[]): number {
		return items.indexOf(document.activeElement as HTMLElement);
	}

	/** Moves focus to the item at the given index (wraps around). */
	private focusItem(items: HTMLElement[], index: number): void {
		if (items.length === 0) {
			return;
		}
		const wrapped = ((index % items.length) + items.length) % items.length;
		items[wrapped]?.focus();
	}

	/** Opens the dropdown of the focused item and focuses its first child. */
	private openFocusedDropdown(items: HTMLElement[], currentIndex: number): void {
		if (currentIndex < 0) {
			return;
		}
		const wrapper = items[currentIndex].closest('.hub-nav-item-wrapper');
		const itemId = wrapper?.querySelector('hub-nav-item')?.getAttribute('data-item-id');
		if (itemId) {
			// Get sibling IDs for accordion auto-close behavior
			const siblingIds = this.items()
				.filter((i) => i.type === 'dropdown' || this.hasChildren(i))
				.map((i) => i.id);
			this.state.openDropdown(itemId, siblingIds);
			requestAnimationFrame(() => {
				const submenu = wrapper?.querySelector('.hub-nav-dropdown, .hub-nav-accordion');
				const firstChild = submenu?.querySelector(
					'.hub-nav-item__link, .hub-nav-item__dropdown-toggle'
				) as HTMLElement | null;
				firstChild?.focus();
			});
		}
	}

	/** Closes the dropdown of the focused item. */
	private closeFocusedDropdown(items: HTMLElement[], currentIndex: number): void {
		if (currentIndex < 0) {
			return;
		}
		const wrapper = items[currentIndex].closest('.hub-nav-item-wrapper');
		const itemId = wrapper?.querySelector('hub-nav-item')?.getAttribute('data-item-id');
		if (itemId && this.state.isDropdownOpen(itemId)) {
			this.state.closeDropdown(itemId);
		}
	}
}
