import { HubNavItem } from './nav-item.model';

/**
 * Event emitted when a navigation item is clicked.
 */
export interface HubNavItemClickEvent {
	/** The item that was clicked. */
	item: HubNavItem;

	/** The original DOM event. */
	originalEvent: Event;
}

/**
 * Event emitted when a dropdown opens or closes.
 */
export interface HubNavDropdownEvent {
	/** The dropdown parent item. */
	item: HubNavItem;

	/** Whether the dropdown is now open. */
	open: boolean;
}

/** Action type for panel events. */
export type HubNavPanelAction = 'open' | 'close' | 'drill-down' | 'drill-back';

/**
 * Event emitted when a panel opens, closes, or performs drill-down navigation.
 */
export interface HubNavPanelEvent {
	/** The parent item whose children are displayed in the panel. */
	item: HubNavItem;

	/** Zero-based index of the panel in the stack. */
	panelIndex: number;

	/** The action that triggered this event. */
	action: HubNavPanelAction;
}
