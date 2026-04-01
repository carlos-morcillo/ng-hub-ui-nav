import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Visual separator between navigation item groups.
 * Renders as a horizontal rule in vertical list contexts.
 * Root horizontal nav bars hide separators because structural grouping
 * should not consume inline menu space there.
 *
 * @internal This component is used internally by `HubNavItemListComponent`.
 */
@Component({
	selector: 'hub-nav-separator',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'hub-nav-separator',
		role: 'separator'
	},
	template: '',
	styles: [
		`
			:host {
				display: block;
				border: 0;
				opacity: 1;
			}

			:host-context(.hub-nav--horizontal) {
				display: none;
			}

			:host-context(.hub-nav--vertical) {
				height: 0;
				border-top: var(--hub-nav-border-width, 1px) var(--hub-nav-border-style, solid)
					var(--hub-nav-separator-color, var(--hub-sys-border-color-default, #dee2e6));
				margin: var(--hub-nav-separator-margin-y, 0.5rem) 0;
			}

			/*
			 * Menus rendered inside dropdown/accordion/panel are always vertical lists,
			 * even when the root nav orientation is horizontal. In these contexts,
			 * separators must be horizontal full-width rules.
			 */
			:host-context(.hub-nav-dropdown),
			:host-context(.hub-nav-accordion),
			:host-context(.hub-nav-panel__body),
			:host-context(.hub-nav-mobile-panel__body) {
				display: block;
				width: 100%;
				height: 0;
				align-self: stretch;
				border-left: 0;
				border-top: var(--hub-nav-border-width, 1px) var(--hub-nav-border-style, solid)
					var(--hub-nav-separator-color, var(--hub-sys-border-color-default, #dee2e6));
				margin: var(--hub-nav-separator-margin-y, 0.5rem) 0;
			}
		`
	]
})
export class HubNavSeparatorComponent {}
