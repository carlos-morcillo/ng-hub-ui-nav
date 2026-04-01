import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { HubNavItem } from '../../models/nav-item.model';
import { HubNavCollapseMode, HubNavOffcanvasPosition } from '../../models/nav-config.model';
import { HubNavItemListComponent } from '../nav-item-list/nav-item-list.component';

/**
 * Mobile navigation panel that renders when the viewport is below the collapse breakpoint.
 * Supports three display modes: offcanvas (slide-in drawer), dropdown (panel below toggler),
 * and fullscreen (overlay).
 *
 * @internal Used internally by `HubNavComponent`.
 */
@Component({
	selector: 'hub-nav-mobile-panel',
	standalone: true,
	imports: [HubNavItemListComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'hub-nav-mobile-panel',
		'[class.hub-nav-mobile-panel--open]': 'isOpen()',
		'[class.hub-nav-mobile-panel--offcanvas]': 'mode() === "offcanvas"',
		'[class.hub-nav-mobile-panel--dropdown]': 'mode() === "dropdown"',
		'[class.hub-nav-mobile-panel--fullscreen]': 'mode() === "fullscreen"',
		'[class.hub-nav-mobile-panel--start]': 'offcanvasPosition() === "start"',
		'[class.hub-nav-mobile-panel--end]': 'offcanvasPosition() === "end"',
		'[class.hub-nav-mobile-panel--top]': 'offcanvasPosition() === "top"',
		'[class.hub-nav-mobile-panel--bottom]': 'offcanvasPosition() === "bottom"'
	},
	templateUrl: './nav-mobile-panel.component.html',
	styleUrl: './nav-mobile-panel.component.scss'
})
export class HubNavMobilePanelComponent {
	/** Navigation items to render in the panel. */
	readonly items = input.required<HubNavItem[]>();

	/** Whether the panel is currently open. */
	readonly isOpen = input<boolean>(false);

	/** Collapse display mode. */
	readonly mode = input<HubNavCollapseMode>('offcanvas');

	/** Offcanvas slide-in direction. */
	readonly offcanvasPosition = input<HubNavOffcanvasPosition>('start');

	/** Emitted when the close button or backdrop is clicked. */
	readonly closePanel = output<void>();

	/** Emitted when an item is clicked. */
	readonly itemClick = output<{ item: HubNavItem; event: Event }>();

	/** Emitted when a dropdown toggle is requested. */
	readonly dropdownToggle = output<HubNavItem>();

	/**
	 * Handles backdrop click to close the panel.
	 */
	onBackdropClick(): void {
		this.closePanel.emit();
	}

	/**
	 * Handles close button click.
	 */
	onCloseClick(): void {
		this.closePanel.emit();
	}

	/**
	 * Handles item click events from the inner list.
	 *
	 * @param payload - The clicked item and original event.
	 */
	onItemClick(payload: { item: HubNavItem; event: Event }): void {
		this.itemClick.emit(payload);
		// Close panel whenever the click performed a route navigation.
		// Dropdown caret toggles do not reach this handler.
		if (payload.item.route) {
			this.closePanel.emit();
		}
	}

	/**
	 * Handles dropdown toggle events from the inner list.
	 *
	 * @param item - The dropdown item.
	 */
	onDropdownToggle(item: HubNavItem): void {
		this.dropdownToggle.emit(item);
	}
}
