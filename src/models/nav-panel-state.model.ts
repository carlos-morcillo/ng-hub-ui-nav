import { HubNavItem } from './nav-item.model';

/**
 * Represents a single entry in the drill-down history stack of a panel.
 */
export interface HubNavPanelHistoryEntry {
	/** The items that were displayed before the drill-down. */
	items: HubNavItem[];

	/** The parent label of the previous level (shown in the header on back). */
	parentLabel: string;
}

/**
 * Represents the state of a single panel in the stacked panel navigation.
 */
export interface HubNavPanelState {
	/** Unique identifier for this panel instance. */
	id: string;

	/** The parent item that triggered opening this panel. */
	parentItem: HubNavItem;

	/** The items currently displayed in this panel. */
	items: HubNavItem[];

	/** History stack for drill-down navigation within this panel. */
	history: HubNavPanelHistoryEntry[];

	/** Whether this panel is currently in drill-down mode (has history entries). */
	isDrillDown: boolean;
}
