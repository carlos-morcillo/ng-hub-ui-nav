import { Component, ChangeDetectionStrategy, input, output, TemplateRef } from '@angular/core';
import { HubNavItem } from '../../models/nav-item.model';
import { HubNavSidebarSide } from '../../models/nav-config.model';
import { HubNavPanelState } from '../../models/nav-panel-state.model';
import { HubNavPanelComponent } from '../nav-panel/nav-panel.component';

/**
 * Container that renders the stack of side panels in a horizontal flex layout.
 * Panels are stacked left-to-right or right-to-left depending on `sidebarSide`.
 *
 * @internal Used internally by `HubNavComponent`.
 */
@Component({
	selector: 'hub-nav-panel-container',
	standalone: true,
	imports: [HubNavPanelComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'hub-nav-panel-container',
		'[class.hub-nav-panel-container--left]': 'sidebarSide() === "left"',
		'[class.hub-nav-panel-container--right]': 'sidebarSide() === "right"'
	},
	templateUrl: './nav-panel-container.component.html',
	styleUrl: './nav-panel-container.component.scss'
})
export class HubNavPanelContainerComponent {
	/** Array of panel states to render. */
	readonly panels = input.required<HubNavPanelState[]>();

	/** Physical side where the sidebar is placed. */
	readonly sidebarSide = input<HubNavSidebarSide>('left');

	/** Width for each panel. */
	readonly panelWidth = input<string>('16rem');

	/** Optional custom template for rendering item content. */
	readonly itemTemplate = input<TemplateRef<unknown> | null>(null);

	/**
	 * When true, the first panel hides its header while it is not in drill-down
	 * mode. This is primarily used by horizontal nav where the selected root
	 * item is already visible in the top row.
	 */
	readonly hideFirstPanelHeader = input<boolean>(false);

	/** Emitted when a panel close button is clicked. Carries the panel ID. */
	readonly panelClose = output<string>();

	/** Emitted when a panel back button is clicked. Carries the panel ID. */
	readonly panelBack = output<string>();

	/** Emitted when an item inside a panel is clicked. */
	readonly itemClick = output<{ item: HubNavItem; event: Event }>();

	/** Emitted when a dropdown toggle is requested inside a panel. */
	readonly dropdownToggle = output<HubNavItem>();

	/** Emitted when an item inside a panel requests a new panel. */
	readonly panelOpen = output<HubNavItem>();

	/**
	 * Resolves whether a panel header should be rendered for a given index.
	 *
	 * When `hideFirstPanelHeader` is true (used in layouts where parent context
	 * is always visible as a sibling column), headers are suppressed on all panels
	 * that are not in drill-down mode. A header is only shown when the panel is in
	 * drill-down mode — meaning its parent level has been replaced and is no longer
	 * visible.
	 *
	 * @param index - Zero-based panel index in the rendered stack.
	 * @param panel - Panel state at the given index.
	 * @returns `true` when the header should be visible.
	 */
	shouldShowHeader(index: number, panel: HubNavPanelState): boolean {
		if (!this.hideFirstPanelHeader()) {
			return true;
		}

		// Only show header when the parent context is no longer visible as a
		// sibling column (drill-down replaced it). When all parent levels are
		// visible, no header is needed — the panel is closed by re-clicking
		// the parent item in the sidebar.
		return panel.isDrillDown;
	}
}
