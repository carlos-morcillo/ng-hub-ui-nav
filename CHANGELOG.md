# Changelog

All notable changes to this project will be documented in this file.

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
