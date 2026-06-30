import { Component, ChangeDetectionStrategy, input, output, inject, computed, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HubOverflowTooltipDirective } from 'ng-hub-ui-utils';
import { HubNavItem } from '../../models/nav-item.model';
import { HubNavStateService } from '../../services/nav-state.service';

/**
 * Renders a single navigation item (link, dropdown trigger, header, or custom content).
 * Handles routing integration, active state, badges, icons, and disabled state.
 *
 * @internal Used internally by `HubNavItemListComponent`.
 */
@Component({
	selector: 'hub-nav-item',
	standalone: true,
	imports: [NgTemplateOutlet, RouterLink, HubOverflowTooltipDirective],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'hub-nav-item',
		'[class.hub-nav-item--active]': 'isActive()',
		'[class.hub-nav-item--disabled]': 'item().disabled',
		'[class.hub-nav-item--has-children]': 'hasChildren()',
		'[class.hub-nav-item--expanded]': 'isExpanded()',
		'[class.hub-nav-item--header]': 'isHeader()',
		'[attr.data-item-id]': 'item().id',
		role: 'none'
	},
	templateUrl: './nav-item.component.html',
	styleUrl: './nav-item.component.scss'
})
export class HubNavItemComponent {
	/** The navigation item data to render. */
	readonly item = input.required<HubNavItem>();

	/** Nesting depth (0 = root). */
	readonly depth = input<number>(0);

	/** Whether this item is currently active (set by parent list). */
	readonly isActive = input<boolean>(false);

	/** Whether the dropdown is currently expanded (only for dropdown items). */
	readonly isExpanded = input<boolean>(false);

	/** Optional custom template for rendering the item content. */
	readonly itemTemplate = input<TemplateRef<unknown> | null>(null);

	/**
	 * Forces the item to behave as part of a mobile accordion list.
	 * This keeps indicators and layout aligned with the collapsed nav panel.
	 */
	readonly forceAccordionMode = input<boolean>(false);

	/** Emitted when the item is clicked. */
	readonly clicked = output<{ item: HubNavItem; event: Event }>();

	/** Emitted when the dropdown toggle is activated. */
	readonly toggleDropdown = output<HubNavItem>();

	/** Reference to the nav state service. */
	private readonly state = inject(HubNavStateService);

	/** Whether this item has child items. */
	readonly hasChildren = computed(() => {
		const children = this.item().children;
		return !!children && children.length > 0;
	});

	/** Whether this item is a header type. */
	readonly isHeader = computed(() => this.item().type === 'header');

	/** Whether this item is a link type. */
	readonly isLink = computed(() => this.item().type === 'link');

	/** Whether this item is a dropdown type. */
	readonly isDropdown = computed(() => this.item().type === 'dropdown');

	/** Whether this item is a custom type. */
	readonly isCustom = computed(() => this.item().type === 'custom');

	/** Resolved route for routerLink binding. */
	readonly resolvedRoute = computed(() => {
		const item = this.item();
		if (!item.route) {
			return null;
		}
		return Array.isArray(item.route) ? item.route : [item.route];
	});

	/** Template context for custom item templates. */
	readonly templateContext = computed(() => ({
		$implicit: this.item(),
		active: this.isActive(),
		expanded: this.isExpanded(),
		depth: this.depth()
	}));

	/**
	 * Whether the dropdown caret should be visible for this item.
	 * In panel mode, caret is hidden because expansion happens in side panels.
	 */
	readonly showCaret = computed(() => {
		if (!(this.isDropdown() || this.hasChildren())) {
			return false;
		}

		if (this.forceAccordionMode()) {
			return true;
		}

		return this.state.getEffectiveExpandMode(this.item()) !== 'panel';
	});

	/**
	 * Handles click events on the item.
	 * Delegates to dropdown toggle or emits a click event depending on item type.
	 *
	 * @param event - The original DOM event.
	 */
	onItemClick(event: Event): void {
		const item = this.item();

		if (item.disabled) {
			event.preventDefault();
			return;
		}

		if (item.type === 'header' || item.type === 'separator') {
			event.preventDefault();
			return;
		}

		if (this.hasChildren()) {
			this.toggleDropdown.emit(item);
		}

		this.clicked.emit({ item, event });
	}

	/**
	 * Handles clicks on the label/link area of a routable dropdown item.
	 * In this case the click only performs navigation and does not toggle
	 * the submenu; submenu expansion is delegated to the dedicated caret.
	 *
	 * @param event - The original DOM event.
	 */
	onRouteItemClick(event: Event): void {
		const item = this.item();

		if (item.disabled) {
			event.preventDefault();
			return;
		}

		// In panel mode there is no dedicated caret, so the label click must
		// also request the child panel opening while preserving the route click.
		if (this.hasChildren() && !this.showCaret()) {
			this.toggleDropdown.emit(item);
		}

		this.clicked.emit({ item, event });
	}

	/**
	 * Handles clicks on the dedicated caret button for routable dropdown items.
	 * The caret only toggles submenu visibility and must never trigger routing.
	 *
	 * @param event - The original DOM event.
	 */
	onCaretClick(event: Event): void {
		const item = this.item();

		event.preventDefault();
		event.stopPropagation();

		if (item.disabled || !this.hasChildren()) {
			return;
		}

		this.toggleDropdown.emit(item);
	}
}
