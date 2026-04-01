import { Directive, TemplateRef, inject } from '@angular/core';
import { HubNavItemTemplateContext } from '../models/nav-template-context.model';

/**
 * Structural directive that provides a custom template for rendering individual nav items.
 * When present, each nav item is rendered using this template instead of the default markup.
 *
 * The template receives a {@link HubNavItemTemplateContext} with `$implicit` (the item),
 * `active`, `expanded`, and `depth`.
 *
 * @example
 * ```html
 * <hub-nav [items]="menuItems">
 *   <ng-template hubNavItemTemplate let-item let-active="active" let-depth="depth">
 *     <div class="custom-item" [class.active]="active">
 *       <i [class]="item.icon"></i>
 *       {{ item.label }}
 *     </div>
 *   </ng-template>
 * </hub-nav>
 * ```
 */
@Directive({
	selector: '[hubNavItemTemplate]',
	standalone: true
})
export class HubNavItemTemplateDirective {
	/** Reference to the template provided by the consumer. */
	readonly template = inject(TemplateRef<HubNavItemTemplateContext>);
}
