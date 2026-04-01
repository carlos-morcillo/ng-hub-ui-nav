/**
 * Configuration for the `hub-nav` component.
 * All properties are optional — defaults are applied via `HubNavConfigService`.
 */
export interface HubNavConfig {
	/**
	 * Orientation of the navigation menu.
	 * - `horizontal`: Top navigation bar.
	 * - `vertical`: Side navigation bar.
	 * @default 'horizontal'
	 */
	orientation: HubNavOrientation;

	/**
	 * Expansion mode for child items in vertical orientation.
	 * - `accordion`: Children expand/collapse inline with animation.
	 * - `flyout`: Children appear as a positioned side panel.
	 * @default 'accordion'
	 */
	verticalExpandMode: HubNavVerticalExpandMode;

	/**
	 * Trigger mechanism for opening dropdowns.
	 * - `hover`: Open on mouse hover.
	 * - `click`: Open on click.
	 * - `both`: Open on hover or click.
	 * @default 'click'
	 */
	dropdownTrigger: HubNavDropdownTrigger;

	/**
	 * CSS positioning strategy for the nav container.
	 * Sticky positioning is only activated for vertical, non-collapsed navs.
	 * @default 'static'
	 */
	position: HubNavPosition;

	/**
	 * Top offset used when sticky positioning is enabled.
	 * Accepts any valid CSS length value.
	 * @default '0px'
	 */
	stickyTop: string;

	/**
	 * Display mode when the menu collapses on smaller viewports.
	 * - `offcanvas`: Slide-in drawer panel.
	 * - `dropdown`: Panel drops below the toggler.
	 * - `fullscreen`: Full-screen overlay.
	 * @default 'offcanvas'
	 */
	collapseMode: HubNavCollapseMode;

	/**
	 * Viewport width in pixels below which the menu collapses.
	 * Set to `0` to disable responsive collapsing.
	 * @default 992
	 */
	collapseBreakpoint: number;

	/**
	 * Position from which the offcanvas panel slides in.
	 * Only applicable when `collapseMode` is `'offcanvas'`.
	 * @default 'start'
	 */
	offcanvasPosition: HubNavOffcanvasPosition;

	/**
	 * Accessible label for the `<nav>` element.
	 * @default 'Navigation'
	 */
	ariaLabel: string;

	/**
	 * Maximum number of simultaneously visible panels in panel expand mode.
	 * When exceeded, the last panel uses drill-down (replaces its content with back navigation).
	 * Only applies when `verticalExpandMode` is `'panel'` or individual items have `expandMode: 'panel'`.
	 * @default 3
	 */
	panelMaxVisible: number;

	/**
	 * Physical side where the sidebar is placed.
	 * - `left`: Sidebar on the left, panels extend to the right.
	 * - `right`: Sidebar on the right, panels extend to the left.
	 * @default 'left'
	 */
	sidebarSide: HubNavSidebarSide;

	/**
	 * Width of each panel in panel expand mode.
	 * Accepts any valid CSS width value.
	 * @default '16rem'
	 */
	panelWidth: string;
}

/** Orientation of the navigation layout. */
export type HubNavOrientation = 'horizontal' | 'vertical';

/** Expansion mode for vertical child items. */
export type HubNavVerticalExpandMode = 'accordion' | 'flyout' | 'panel';

/** Physical placement side of the sidebar navigation. */
export type HubNavSidebarSide = 'left' | 'right';

/** Trigger mechanism for dropdown menus. */
export type HubNavDropdownTrigger = 'hover' | 'click' | 'both';

/** CSS positioning strategy. */
export type HubNavPosition = 'static' | 'sticky' | 'fixed';

/** Collapse display mode for responsive viewports. */
export type HubNavCollapseMode = 'offcanvas' | 'dropdown' | 'fullscreen';

/** Offcanvas slide-in direction. */
export type HubNavOffcanvasPosition = 'start' | 'end' | 'top' | 'bottom';
