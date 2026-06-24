# ng-hub-ui-nav

**Español** | [English](./README.md)

[![npm version](https://img.shields.io/npm/v/ng-hub-ui-nav.svg)](https://www.npmjs.com/package/ng-hub-ui-nav)
[![license](https://img.shields.io/npm/l/ng-hub-ui-nav.svg)](https://github.com/carlos-morcillo/ng-hub-ui-nav/blob/main/LICENSE)

Componente de navegación flexible, accesible y altamente personalizable para Angular 21+. Soporta menús horizontales, sidebars verticales, modos responsive para móvil, paneles apilados con drill-down, slots `start` y `end`, y soporte de scroll-spy.

> [!IMPORTANT]
> La versión `21.1.1` está orientada a Angular 21 y sigue la arquitectura basada en signals del ecosistema `ng-hub-ui`.

## Documentación y ejemplos en vivo

Este paquete forma parte de [Hub UI](https://hubui.dev/), una colección de bibliotecas de componentes Angular para aplicaciones standalone.

- Documentación: https://hubui.dev/nav/overview/
- Ejemplos en vivo: https://hubui.dev/nav/examples/
- Hub UI: https://hubui.dev/

## 🧩 Familia `ng-hub-ui`

Esta biblioteca forma parte del ecosistema **ng-hub-ui**:

- [**ng-hub-ui-accordion**](https://www.npmjs.com/package/ng-hub-ui-accordion) (obsoleto — usa ng-hub-ui-panels)
- [**ng-hub-ui-action-sheet**](https://www.npmjs.com/package/ng-hub-ui-action-sheet)
- [**ng-hub-ui-avatar**](https://www.npmjs.com/package/ng-hub-ui-avatar)
- [**ng-hub-ui-board**](https://www.npmjs.com/package/ng-hub-ui-board)
- [**ng-hub-ui-breadcrumbs**](https://www.npmjs.com/package/ng-hub-ui-breadcrumbs)
- [**ng-hub-ui-calendar**](https://www.npmjs.com/package/ng-hub-ui-calendar)
- [**ng-hub-ui-dropdown**](https://www.npmjs.com/package/ng-hub-ui-dropdown)
- [**ng-hub-ui-ds**](https://www.npmjs.com/package/ng-hub-ui-ds)
- [**ng-hub-ui-forms**](https://www.npmjs.com/package/ng-hub-ui-forms)
- [**ng-hub-ui-history**](https://www.npmjs.com/package/ng-hub-ui-history)
- [**ng-hub-ui-milestones**](https://www.npmjs.com/package/ng-hub-ui-milestones)
- [**ng-hub-ui-modal**](https://www.npmjs.com/package/ng-hub-ui-modal)
- [**ng-hub-ui-nav**](https://www.npmjs.com/package/ng-hub-ui-nav) ← Estás aquí
- [**ng-hub-ui-paginable**](https://www.npmjs.com/package/ng-hub-ui-paginable)
- [**ng-hub-ui-panels**](https://www.npmjs.com/package/ng-hub-ui-panels)
- [**ng-hub-ui-portal**](https://www.npmjs.com/package/ng-hub-ui-portal)
- [**ng-hub-ui-skeleton**](https://www.npmjs.com/package/ng-hub-ui-skeleton)
- [**ng-hub-ui-sortable**](https://www.npmjs.com/package/ng-hub-ui-sortable)
- [**ng-hub-ui-stepper**](https://www.npmjs.com/package/ng-hub-ui-stepper)
- [**ng-hub-ui-utils**](https://www.npmjs.com/package/ng-hub-ui-utils)

## Índice

- [Características](#características)
- [Instalación](#instalación)
- [Inicio rápido](#inicio-rápido)
- [Ejemplos](#ejemplos)
- [Referencia de API](#referencia-de-api)
- [Estilos](#estilos)
- [Changelog](#changelog)
- [Contribuir](#contribuir)
- [Soporte](#soporte)
- [Colaboradores](#colaboradores)
- [Licencia](#licencia)

## Características

- Disposición horizontal y vertical.
- Modos responsive: `offcanvas`, `dropdown` y `fullscreen`.
- Modos de expansión vertical: `accordion`, `flyout` y `panel`.
- Navegación drill-down con paneles apilados y límite configurable.
- Slots proyectados `hubNavStart` y `hubNavEnd`.
- Render personalizado de items con `hubNavItemTemplate`.
- Estados activos sincronizados con Angular Router.
- Directivas de scroll-spy para documentación y páginas de una sola vista.
- Soporte de `sticky` en navegación vertical.
- Sistema de acento semántico `variant` (`primary` / `success` / `danger` / `warning` / `info`, además de cualquier acento personalizado) que recolorea los estados hover/activo — replica el de `<hub-panels>`.
- Personalización completa mediante variables CSS `--hub-nav-*`.

## Instalación

```bash
npm install ng-hub-ui-nav
```

## Inicio rápido

```typescript
import { Component } from '@angular/core';
import { HubNavComponent, HubNavItem } from 'ng-hub-ui-nav';

@Component({
	standalone: true,
	imports: [HubNavComponent],
	template: `
		<hub-nav
			[items]="items"
			[config]="{
				orientation: 'horizontal',
				dropdownTrigger: 'click'
			}"
		/>
	`
})
export class ExampleComponent {
	readonly items: HubNavItem[] = [
		{ id: 'home', label: 'Home', type: 'link', route: '/' },
		{
			id: 'components',
			label: 'Components',
			type: 'dropdown',
			children: [
				{ id: 'accordion', label: 'Accordion', type: 'link', route: '/accordion' },
				{ id: 'calendar', label: 'Calendar', type: 'link', route: '/calendar' }
			]
		}
	];
}
```

## Ejemplos

### Sidebar vertical con paneles

```html
<hub-nav
	[items]="items"
	[config]="{
		orientation: 'vertical',
		verticalExpandMode: 'panel',
		panelMaxVisible: 2,
		panelWidth: '18rem',
		position: 'sticky',
		stickyTop: '1rem'
	}"
/>
```

### Slots start y end

```html
<hub-nav [items]="items" [config]="{ orientation: 'horizontal' }">
	<ng-template hubNavStart let-collapsed="collapsed">
		<strong>My App</strong>
	</ng-template>

	<ng-template hubNavEnd>
		<button type="button">Profile</button>
	</ng-template>
</hub-nav>
```

### Scroll spy

```html
<section
	hubNavScrollSpy
	(activeSectionChange)="activeSection = $event"
>
	<section id="overview" hubNavScrollSpySection>...</section>
	<section id="api" hubNavScrollSpySection>...</section>
</section>
```

## Referencia de API

### `HubNavComponent`

#### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `items` | `HubNavItem[]` | required | Árbol de navegación a renderizar. |
| `config` | `Partial<HubNavConfig>` | `{}` | Configuración por instancia combinada con los defaults globales. |
| `navClass` | `string` | `''` | Clase adicional aplicada al `<nav>` interno. |
| `itemTemplate` | `TemplateRef<unknown> \| null` | `null` | Plantilla opcional para renderizar items. |
| `autoOpenFromRoute` | `boolean` | `false` | Abre dropdowns/paneles en función de la ruta activa. |
| `variant` | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'info' \| string` | `'primary'` | Acento semántico para los estados hover/activo. Los valores integrados usan los tintes del design-system; cualquier string personalizado se resuelve mediante `--hub-sys-color-<variant>`. |

#### Outputs

| Output | Type | Description |
|---|---|---|
| `itemClick` | `OutputEmitterRef<HubNavItem>` | Se emite cuando se activa un item navegable. |
| `dropdownOpen` | `OutputEmitterRef<HubNavItem>` | Se emite cuando se abre un dropdown. |
| `dropdownClose` | `OutputEmitterRef<HubNavItem>` | Se emite cuando se cierra un dropdown. |
| `mobileToggle` | `OutputEmitterRef<boolean>` | Se emite al abrir o cerrar el panel responsive. |
| `panelChange` | `OutputEmitterRef<HubNavPanelEvent>` | Se emite al abrir, cerrar o navegar dentro de paneles. |

### `HubNavConfig`

```typescript
interface HubNavConfig {
	orientation: 'horizontal' | 'vertical';
	verticalExpandMode: 'accordion' | 'flyout' | 'panel';
	dropdownTrigger: 'hover' | 'click' | 'both';
	position: 'static' | 'sticky' | 'fixed';
	stickyTop: string;
	collapseMode: 'offcanvas' | 'dropdown' | 'fullscreen';
	collapseBreakpoint: number;
	offcanvasPosition: 'start' | 'end' | 'top' | 'bottom';
	ariaLabel: string;
	panelMaxVisible: number;
	sidebarSide: 'left' | 'right';
	panelWidth: string;
}
```

### `HubNavItem`

```typescript
interface HubNavItem {
	id: string;
	label: string;
	type: 'link' | 'dropdown' | 'header' | 'separator' | 'custom';
	icon?: string;
	route?: string | string[];
	queryParams?: Record<string, string>;
	fragment?: string;
	routerLinkActiveOptions?: { exact: boolean };
	children?: HubNavItem[];
	badge?: string;
	badgeClass?: string;
	disabled?: boolean;
	cssClass?: string;
	data?: unknown;
	expandMode?: 'accordion' | 'flyout' | 'panel';
}
```

### Directivas

- `hubNavStart`: proyecta contenido al inicio.
- `hubNavEnd`: proyecta contenido al final.
- `hubNavItemTemplate`: sustituye el render por defecto del item.
- `hubNavScrollSpy`: detecta la sección visible en un contenedor con scroll.
- `hubNavScrollSpySection`: marca una sección como observable por el scroll spy.

## Estilos

El componente expone un conjunto completo de tokens `--hub-nav-*`. La referencia completa está en:

- [CSS Variables Reference](docs/css-variables-reference.md)

### Recolorear toda la navegación desde un único acento

Los estados hover/activo y la superficie de la navegación derivan todos de un único acento. Defínelo (o usa el input `variant`) para re-tematizar la navegación entera:

```css
.my-sidebar {
	--hub-nav-panel-width: 18rem;
	/* Único punto de recoloreo — el fondo activo con tinte, el texto de acento,
	   el tinte de hover, la barra indicadora y el lavado de la superficie siguen
	   este único acento. */
	--hub-nav-accent: var(--hub-sys-color-success);
	--hub-nav-dropdown-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.16);
}
```

### Restaurar el aspecto clásico de relleno sólido

El item activo por defecto ahora es un tinte suave de acento + texto de acento. Para restaurar el relleno sólido de acento + texto blanco anterior (el aspecto previo a `22.1.0`), sobrescribe estos tokens explícitamente:

```css
.my-sidebar {
	--hub-nav-item-active-bg: #0d6efd;
	--hub-nav-item-active-color: #ffffff;
	--hub-nav-item-hover-bg: rgba(0, 0, 0, 0.04);
	--hub-nav-bg: #ffffff;
}
```

## Changelog

Puedes consultar el historial completo de versiones en [CHANGELOG.md](CHANGELOG.md).

Si actualizas entre versiones, revisa también [BREAKING_CHANGES.md](BREAKING_CHANGES.md).

## Contribuir

Se aceptan issues, debates y pull requests.

Si quieres contribuir:

1. Haz un fork del repositorio.
2. Crea una rama para tu cambio.
3. Mantén documentados los cambios de API en el README y en el changelog.
4. Abre una pull request con una descripción clara del cambio.

## Soporte

Si esta biblioteca te resulta útil, puedes apoyar su mantenimiento aquí:

- [Buy Me a Coffee](https://buymeacoffee.com/carlosmorcillo)

## Colaboradores

Creada y mantenida por [Carlos Morcillo](https://www.carlosmorcillo.com).

## Licencia

Este proyecto está licenciado bajo MIT. Consulta el fichero [LICENSE](LICENSE) para más detalle.
