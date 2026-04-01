import { HubNavVerticalExpandMode } from './nav-config.model';

/**
 * Represents a single navigation item in the menu hierarchy.
 * Supports unlimited nesting through the `children` property.
 */
export interface HubNavItem {
	/** Unique identifier for the item. */
	id: string;

	/** Visible text label. */
	label: string;

	/**
	 * Type of navigation item.
	 * - `link`: Navigable item with routerLink.
	 * - `dropdown`: Parent item that opens a submenu with children.
	 * - `header`: Non-clickable section header text.
	 * - `separator`: Visual divider between groups.
	 * - `custom`: Custom content rendered via template directive.
	 */
	type: HubNavItemType;

	/** Icon CSS class or identifier (e.g., `'bi bi-house'`). */
	icon?: string;

	/** Route path for `routerLink`. Can be a string or an array of segments. */
	route?: string | string[];

	/** Query parameters for `routerLink`. */
	queryParams?: Record<string, string>;

	/** URL fragment for `routerLink`. */
	fragment?: string;

	/** Options for `routerLinkActive` matching. */
	routerLinkActiveOptions?: { exact: boolean };

	/** Child items for dropdown/nested menus. Supports unlimited depth. */
	children?: HubNavItem[];

	/** Badge text displayed alongside the label (e.g., notification count). */
	badge?: string;

	/** CSS class applied to the badge element. */
	badgeClass?: string;

	/** Whether the item is disabled (visually muted, non-interactive). */
	disabled?: boolean;

	/** Additional CSS class applied to the item element. */
	cssClass?: string;

	/** Arbitrary consumer data attached to the item. */
	data?: unknown;

	/**
	 * Per-item override for how children are expanded.
	 * If set, overrides the global `verticalExpandMode` for this specific item.
	 * - `accordion`: Children expand inline.
	 * - `flyout`: Children appear as a positioned dropdown.
	 * - `panel`: Children open in a new stacked side panel.
	 */
	expandMode?: HubNavVerticalExpandMode;
}

/** Allowed types for navigation items. */
export type HubNavItemType = 'link' | 'dropdown' | 'header' | 'separator' | 'custom';
