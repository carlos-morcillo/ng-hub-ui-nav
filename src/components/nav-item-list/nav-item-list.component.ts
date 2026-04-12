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
	TemplateRef,
	ViewContainerRef,
	effect,
	viewChildren
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { HubNavItem } from '../../models/nav-item.model';
import { HubNavDropdownRenderMode, HubNavVerticalExpandMode } from '../../models/nav-config.model';
import { HubNavItemComponent } from '../nav-item/nav-item.component';
import { HubNavSeparatorComponent } from '../nav-separator/nav-separator.component';
import { HubNavStateService } from '../../services/nav-state.service';
import { OverlayRef, OverlayService } from 'ng-hub-ui-utils';

type HubNavOverlayPlacement = 'root-dropdown' | 'flyout';

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

	/** Dropdown rendering mode used by non-panel submenus. */
	readonly dropdownRenderMode = input<HubNavDropdownRenderMode>('inline');

	/** Unique owner class used to mark overlay dropdowns for outside-click handling. */
	readonly overlayOwnerClass = input<string>('');

	/** Orientation class forwarded to overlay dropdowns so host-context styles still apply. */
	readonly overlayOrientationClass = input<'hub-nav--horizontal' | 'hub-nav--vertical'>('hub-nav--horizontal');

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

	/** Overlay service used to render flyout dropdowns outside clipping containers. */
	private readonly overlayService = inject(OverlayService);

	/** View container required to attach dropdown templates into overlays. */
	private readonly viewContainerRef = inject(ViewContainerRef);

	/** Wrapper elements that act as overlay origins for each rendered item. */
	private readonly itemWrappers = viewChildren<ElementRef<HTMLElement>>('itemWrapper');

	/** Dropdown templates available for overlay rendering. */
	private readonly overlayTemplates = viewChildren<TemplateRef<unknown>>('overlayDropdownTemplate');

	/** Active overlay instances keyed by nav item id. */
	private readonly overlayRefs = new Map<string, OverlayRef>();

	/** Keeps track of the latest overlay origin per item. */
	private readonly overlayOrigins = new Map<string, HTMLElement>();

	/** Keeps track of the latest overlay template per item. */
	private readonly overlayTemplateRefs = new Map<string, TemplateRef<unknown>>();

	/** Keeps track of the latest placement used per item. */
	private readonly overlayPlacements = new Map<string, HubNavOverlayPlacement>();

	/** Repositions every open overlay when the viewport changes. */
	private readonly overlayViewportListener = () => this.updateOverlayPositions();

	/** Whether global overlay viewport listeners are currently bound. */
	private overlayViewportListenersBound = false;

	/**
	 * Whether children should render in accordion mode (inline with indentation).
	 * True when orientation is vertical and expand mode is 'accordion'.
	 */
	readonly isAccordionMode = computed(
		() =>
			this.forceAccordionMode() ||
			(this.state.orientation() === 'vertical' && this.state.verticalExpandMode() === 'accordion')
	);

	/** Keeps overlay dropdowns synchronized with the nav open state and rendered item tree. */
	private readonly overlaySyncEffect = effect(() => {
		const renderableItems = this.items().filter((item) => item.type !== 'separator');
		const itemWrappers = this.itemWrappers();
		const overlayTemplates = this.overlayTemplates();
		const openOverlayIds = new Set<string>();

		renderableItems.forEach((item, index) => {
			if (!this.hasChildren(item) || !this.isExpanded(item) || !this.shouldRenderDropdownInOverlay(item)) {
				return;
			}

			const origin = itemWrappers[index]?.nativeElement;
			const template = overlayTemplates[index];
			if (!origin || !template) {
				return;
			}

			const placement = this.getOverlayPlacement();
			openOverlayIds.add(item.id);
			this.attachOrUpdateOverlay(item.id, origin, template, placement);
		});

		this.disposeInactiveOverlays(openOverlayIds);
		this.syncOverlayViewportListeners();
	});

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
		this.disposeAllOverlays();
		this.removeOverlayViewportListeners();
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

	/**
	 * Whether the item's non-panel submenu should render through the overlay system.
	 *
	 * Overlay rendering is intentionally limited to click-triggered menus because
	 * hover-triggered overlays require pointer hand-off between separate DOM trees.
	 *
	 * @param item - The nav item being rendered.
	 * @returns `true` when the submenu should render in an overlay container.
	 */
	shouldRenderDropdownInOverlay(item: HubNavItem): boolean {
		if (this.forceAccordionMode()) {
			return false;
		}

		if (this.dropdownRenderMode() !== 'overlay') {
			return false;
		}

		if (this.state.dropdownTrigger() !== 'click') {
			return false;
		}

		const mode = this.getItemExpandMode(item);
		return mode === 'flyout';
	}

	/**
	 * Resolves the overlay placement to use for a submenu.
	 *
	 * @returns Placement variant for the overlay dropdown.
	 */
	getOverlayPlacement(): HubNavOverlayPlacement {
		return this.state.orientation() === 'horizontal' && this.depth() === 0 ? 'root-dropdown' : 'flyout';
	}

	/**
	 * Creates or updates the overlay used to render a dropdown submenu.
	 *
	 * @param itemId - Owner item id.
	 * @param origin - Trigger element used for connected positioning.
	 * @param template - Dropdown content template.
	 * @param placement - Preferred overlay placement.
	 */
	private attachOrUpdateOverlay(
		itemId: string,
		origin: HTMLElement,
		template: TemplateRef<unknown>,
		placement: HubNavOverlayPlacement
	): void {
		const existingOverlay = this.overlayRefs.get(itemId);
		const existingOrigin = this.overlayOrigins.get(itemId);
		const existingTemplate = this.overlayTemplateRefs.get(itemId);
		const existingPlacement = this.overlayPlacements.get(itemId);

		if (
			existingOverlay &&
			existingOrigin === origin &&
			existingTemplate === template &&
			existingPlacement === placement
		) {
			existingOverlay.updatePosition();
			return;
		}

		this.disposeOverlay(itemId);

		const overlayRef = this.overlayService.create({
			hasBackdrop: false,
			panelClass: this.getOverlayClasses(),
			positionStrategy: this.buildOverlayPositionStrategy(origin, placement)
		});

		const overlayContent = overlayRef.attach(template, this.viewContainerRef);
		overlayContent.dataset['hubNavOverlayParentId'] = itemId;

		this.overlayRefs.set(itemId, overlayRef);
		this.overlayOrigins.set(itemId, origin);
		this.overlayTemplateRefs.set(itemId, template);
		this.overlayPlacements.set(itemId, placement);
	}

	/**
	 * Rebuilds the position strategy for a connected dropdown overlay.
	 *
	 * @param origin - Trigger element used as anchor.
	 * @param placement - Preferred overlay placement.
	 * @returns Configured connected position strategy.
	 */
	private buildOverlayPositionStrategy(origin: HTMLElement, placement: HubNavOverlayPlacement) {
		const positionBuilder = this.overlayService.position().flexibleConnectedTo(origin);

		if (placement === 'root-dropdown') {
			return positionBuilder.withPositions([
				{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
				{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
				{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 }
			]);
		}

		return positionBuilder.withPositions([
			{ originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 4 },
			{ originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -4 },
			{ originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 4 }
		]);
	}

	/**
	 * Resolves the CSS classes applied to overlay dropdown containers.
	 *
	 * @returns Panel class list for overlay containers.
	 */
	private getOverlayClasses(): string[] {
		return ['hub-nav-overlay-container', this.overlayOwnerClass(), this.overlayOrientationClass()];
	}

	/**
	 * Disposes overlays that are no longer represented in the open dropdown state.
	 *
	 * @param activeOverlayIds - Set of overlay owner ids that should remain mounted.
	 */
	private disposeInactiveOverlays(activeOverlayIds: Set<string>): void {
		for (const itemId of this.overlayRefs.keys()) {
			if (!activeOverlayIds.has(itemId)) {
				this.disposeOverlay(itemId);
			}
		}
	}

	/**
	 * Disposes a single overlay and clears its bookkeeping entries.
	 *
	 * @param itemId - Owner item id.
	 */
	private disposeOverlay(itemId: string): void {
		this.overlayRefs.get(itemId)?.dispose();
		this.overlayRefs.delete(itemId);
		this.overlayOrigins.delete(itemId);
		this.overlayTemplateRefs.delete(itemId);
		this.overlayPlacements.delete(itemId);
	}

	/**
	 * Disposes every active overlay owned by this item list instance.
	 */
	private disposeAllOverlays(): void {
		for (const itemId of [...this.overlayRefs.keys()]) {
			this.disposeOverlay(itemId);
		}
	}

	/**
	 * Updates the connected position of all mounted overlays.
	 */
	private updateOverlayPositions(): void {
		for (const overlayRef of this.overlayRefs.values()) {
			overlayRef.updatePosition();
		}
	}

	/**
	 * Binds or unbinds global viewport listeners depending on overlay activity.
	 */
	private syncOverlayViewportListeners(): void {
		if (this.overlayRefs.size > 0) {
			this.ensureOverlayViewportListeners();
			return;
		}

		this.removeOverlayViewportListeners();
	}

	/**
	 * Attaches viewport listeners used to keep overlays positioned.
	 */
	private ensureOverlayViewportListeners(): void {
		if (this.overlayViewportListenersBound) {
			return;
		}

		window.addEventListener('resize', this.overlayViewportListener, { passive: true });
		window.addEventListener('scroll', this.overlayViewportListener, true);
		this.overlayViewportListenersBound = true;
	}

	/**
	 * Removes viewport listeners attached for overlay positioning.
	 */
	private removeOverlayViewportListeners(): void {
		if (!this.overlayViewportListenersBound) {
			return;
		}

		window.removeEventListener('resize', this.overlayViewportListener);
		window.removeEventListener('scroll', this.overlayViewportListener, true);
		this.overlayViewportListenersBound = false;
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
					const trigger = this.findParentTrigger();
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
				const submenu = this.findSubmenuElement(itemId, wrapper);
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

	/**
	 * Finds the rendered submenu element for the given item.
	 *
	 * Inline dropdowns live inside the current wrapper while overlay dropdowns
	 * are rendered into `document.body` and must be found by owner item id.
	 *
	 * @param itemId - Parent item id that owns the submenu.
	 * @param wrapper - Optional inline wrapper element that may contain the submenu.
	 * @returns The submenu container when it exists.
	 */
	private findSubmenuElement(itemId: string, wrapper: Element | null): HTMLElement | null {
		const inlineSubmenu = wrapper?.querySelector('.hub-nav-dropdown, .hub-nav-accordion') as HTMLElement | null;
		if (inlineSubmenu) {
			return inlineSubmenu;
		}

		const escapedId = CSS.escape(itemId);
		return document.querySelector(
			`.hub-nav-overlay-container [data-hub-nav-overlay-parent-id="${escapedId}"]`
		) as HTMLElement | null;
	}

	/**
	 * Resolves the trigger element that opened the current submenu.
	 *
	 * For inline submenus, the parent wrapper is still available through DOM
	 * ancestry. Overlay-rendered submenus need to recover the owner item id from
	 * the overlay content element instead.
	 *
	 * @returns The trigger element that should receive focus on Escape.
	 */
	private findParentTrigger(): HTMLElement | null {
		const host = this.el.nativeElement as HTMLElement;
		const parentWrapper = host.closest('.hub-nav-item-wrapper');
		if (parentWrapper) {
			return parentWrapper.querySelector(
				':scope > hub-nav-item .hub-nav-item__dropdown-toggle, :scope > hub-nav-item .hub-nav-item__link'
			) as HTMLElement | null;
		}

		const overlayDropdown = host.closest('[data-hub-nav-overlay-parent-id]') as HTMLElement | null;
		const parentItemId = overlayDropdown?.dataset['hubNavOverlayParentId'];
		if (!parentItemId) {
			return null;
		}

		const escapedId = CSS.escape(parentItemId);
		return document.querySelector(
			`hub-nav-item[data-item-id="${escapedId}"] .hub-nav-item__dropdown-toggle, hub-nav-item[data-item-id="${escapedId}"] .hub-nav-item__link`
		) as HTMLElement | null;
	}
}
