# Changelog

All notable changes to this project will be documented in this file.

## [22.4.0] - 2026-07-02

### Changed

- `--hub-nav-accent-subtle` now uses the canonical design-system derivation — `color-mix(in oklch, var(--hub-nav-accent) 12%, var(--hub-sys-surface-page, #ffffff))` (was a `14%` mix) — in the base tokens and in the open-set `[data-variant]` rule. The subtle tint now matches the ds `-subtle` families exactly, so custom accents re-derive the full role family at runtime with the same values a built-in variant gets.

### Fixed

- **SSR/prerender no longer logs `requestAnimationFrame is not defined`.** `HubNavScrollSpyDirective` scheduled its `IntersectionObserver` setup through `requestAnimationFrame` on every platform; on the server (Angular prerender/SSR) that API does not exist and every route using the scroll spy logged a `ReferenceError`. The directive is now inert outside the browser (`isPlatformBrowser` guard in `scheduleInit`) — section tracking only ever ran client-side anyway.
- **Nav transitions actually run when the ds tokens are loaded.** The ds transition tokens are complete `transition` values (`all 0.15s ease-in-out`, `all 0.2s ease-in-out`), but the components composed them after a property name (`transition: background-color var(--hub-nav-item-transition)`), producing an invalid declaration and silently disabling every item/caret/panel/mobile transition whenever ds was present. All consumers now use the token as the full transition value.
- The accordion expand animation no longer references `--hub-sys-transition-collapse`: the ds value (`height 0.35s ease`) is a transition shorthand carrying a property name, which is invalid inside `animation` and silently disabled the expand animation with ds loaded. `--hub-nav-accordion-transition` is now a plain `0.35s ease` (same timing as ds).
- `--hub-nav-panel-transition` no longer prefixes `transform` to `--hub-sys-transition-base` (invalid once the token resolves to `all 0.2s ease-in-out`); it now resolves to the token directly.
- D1 fallbacks aligned with the actual ds values (they only apply when the ds tokens are not loaded): `--hub-ref-icon-size` → `1em` (was `1.25rem`, also in the icon width/height usage fallbacks), `--hub-sys-transition-fast` → `all 0.15s ease-in-out` (was `150ms ease`), `--hub-sys-transition-base` → `all 0.2s ease-in-out` (was `300ms ease`).
- Docs: `docs/css-variables-reference.md` default values resynchronized with the actual code declarations (now guarded by the repo-level `tokens-parity` check F).

## [22.3.0] - 2026-06-29

### Added

- **Tooltip on truncated item labels.** A nav item whose label is clipped with an ellipsis (the standard sidebar/menu behaviour) now reveals its full text on hover — applied automatically through `ng-hub-ui-utils`' new `[hubOverflowTooltip]` directive, only when the label actually overflows. The tooltip is **agnostic**: it uses the hub-ui tooltip by default but can be swapped for any implementation with `provideHubTooltip(...)`. No API changes; requires `ng-hub-ui-utils >= 22.6.0` and the tooltip styles (`@use 'ng-hub-ui-utils/styles/tooltip';`).

## [22.2.0] - 2026-06-26

### Added

- **Open-set accent variants.** `<hub-nav variant="…">` now accepts the full open accent set out of the box — `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `neutral`, `light`, `dark` (previously only the first five chromatic ones re-based the accent). Any other variant still works at runtime with no recompile: define a single `--hub-sys-color-<name>` (e.g. `:root { --hub-sys-color-brand: #ff6b00; }`) and `<hub-nav variant="brand">` derives the whole hover/active treatment from it, via the new open-set `[data-variant]` rule.
- New derived accent roles `--hub-nav-accent-emphasis` (accent mixed over the theme ink) and `--hub-nav-accent-on` (the contrast colour for text sitting on the accent, a grayscale flip driven by the accent's lightness). Both follow the active accent/variant automatically.

### Changed

- Canonical `zindex` token names (BREAKING): `--hub-nav-dropdown-z-index` → `--hub-nav-dropdown-zindex`, `--hub-nav-mobile-z-index` → `--hub-nav-mobile-zindex`, `--hub-nav-panel-z-index` → `--hub-nav-panel-zindex` (no hyphen, matching the `--hub-sys-zindex-*` convention).
- All accent derivations (`--hub-nav-accent-subtle`, `--hub-nav-bg`, `--hub-nav-item-hover-bg`) now interpolate in the **OKLCH** colour space (`color-mix(in oklch, …)`) instead of sRGB, for perceptually even tints across every accent. No token API change; tints shift very slightly.

## [22.1.1] - 2026-06-25

### Fixed

- Design-token consistency pass: aligned inline fallback defaults with the canonical `ng-hub-ui-ds` values and routed hardcoded literals (z-index, font-weight, line-height, radii and theme-aware colours) through their `--hub-sys-*` / `--hub-ref-*` tokens, so they follow the active theme. No visual change when the ds tokens are loaded.

## [22.1.0] - 2026-06-24

### Added

- New `variant` input on `<hub-nav>` selecting the **semantic accent** of the hover/active affordances: `<hub-nav variant="success">` recolours the active item background and the hover link colour. The built-in variants (`primary` / `success` / `danger` / `warning` / `info`) render with the exact design-system tints; **any other string is also accepted** — the nav reads `--hub-sys-color-<variant>` from the host application, so a custom accent palette interconnects with no changes to the library. Defaults to `primary`. Mirrors the `<hub-panels>` accent system.
- New token `--hub-nav-accent` (defaults to `--hub-sys-color-primary`). `--hub-nav-item-hover-color` and `--hub-nav-item-active-bg` now resolve through this single accent instead of being hard-wired to `--hub-sys-color-primary`.
- **Richer accent treatment** for the item hover/active states: the hover and active backgrounds are now a soft `color-mix` tint of the accent (new `--hub-nav-accent-subtle`) and the active text uses the accent colour. In a **horizontal** navbar the active item also gains an accent **indicator bar** along its bottom edge (tabs-style underline); **vertical / sidebar navs are signalled by the tint + accent text alone — no inline-start bar**. New tokens `--hub-nav-accent-subtle`, `--hub-nav-item-active-indicator-color`, `--hub-nav-item-active-indicator-size`.
- The **nav surface** (`--hub-nav-bg`) now carries a faint wash of the accent (`color-mix(accent 5%, surface)`), so each `variant` reads as a distinctly-themed surface, not just via the active item.

### Changed

- **BREAKING (visual)**: the active item style moved from a solid accent fill + white text to a soft accent tint + accent text + accent indicator bar; the hover background is now an accent tint instead of a neutral grey; and the nav surface carries a faint accent wash instead of being pure white. Override `--hub-nav-item-active-bg` / `--hub-nav-item-active-color` / `--hub-nav-item-hover-bg` / `--hub-nav-bg` to restore the previous look.

### Fixed

- Aligned cross-layer token references with the canonical `ng-hub-ui-ds` names (no visual change; the components now follow the theme instead of only their inline fallback):
  - `--hub-sys-z-index-*` → `--hub-sys-zindex-*`
  - `--hub-sys-shadow-md` → `--hub-sys-shadow`
  - `--hub-sys-state-hover-overlay` → `--hub-sys-state-hover-bg`
  - `--hub-ref-border-radius-*` → `--hub-ref-radius-*`
  - `--hub-ref-font-weight-normal` → `--hub-ref-font-weight-base`

## [22.0.0] - 2026-06-17

### Changed

- Aligned with Angular 22.
- README documentation standardized.


## [21.1.1] - 2026-04-12

### Fixed

- Fixed panel mode behavior when a `nav-item` lacks a dedicated caret, ensuring the panel opens on label click.

### Documentation

- Updated `README.md` and `README.es.md` with live documentation links and corrected Hub UI family references.

## [21.1.0] - 2026-04-01

### Added

- Panel drill-down expand mode (`expandMode: 'panel'`) for vertical navigation.
- `HubNavPanelComponent` and `HubNavPanelContainerComponent` for stacked panel navigation.
- `HubNavPanelState` and `HubNavPanelEvent` models for panel state and events.
- Per-item `expandMode` override on `HubNavItem` (`'accordion' | 'flyout' | 'panel'`).
- `panelMaxVisible`, `sidebarSide`, and `panelWidth` configuration options on `HubNavConfig`.
- Panel stack management in `HubNavStateService` (open, close, drill-down, navigate back).
- `panelChange` output on `HubNavComponent` emitting `HubNavPanelEvent` for all panel actions.
- Keyboard navigation for panels: Escape closes, ArrowLeft navigates back.
- Focus management: auto-focus first item on panel open, return focus on close.
- Slide-in/out CSS animations for panels with `prefers-reduced-motion` support.
- Mobile fallback: panel mode automatically degrades to accordion when collapsed.
- CSS custom properties for panel styling (`--hub-nav-panel-*`).
- Host classes `hub-nav--sidebar-left` and `hub-nav--sidebar-right` for sidebar positioning.

### Changed

- Finalized package metadata for standalone publication under the `ng-hub-ui-nav` repository.
- Declared the package license as MIT and enabled public npm publication metadata.

### Documentation

- Added a complete English `README.md` with installation, usage, API, and styling guidance.
- Added a synchronized Spanish `README.es.md`.
- Added `BREAKING_CHANGES.md` for release-to-release migration tracking.
- Added English and Spanish CSS variables reference files under `docs/`.

## [21.0.0] - 2026-03-19

### Added

- Initial library scaffolding.
- `HubNavItem` interface with support for link, dropdown, header, separator, and custom item types.
- `HubNavConfig` interface with orientation, dropdown trigger, collapse mode, and positioning options.
- `HubNavItemTemplateContext` and `HubNavBrandTemplateContext` template context interfaces.
- `HubNavItemClickEvent` and `HubNavDropdownEvent` event interfaces.
- `HubNavConfigService` for global configuration management with signal-based reactivity.
- `HUB_NAV_CONFIG` injection token for providing configuration at application startup.
- Complete CSS custom properties token set (`--hub-nav-*`) integrated with the hub design system.
