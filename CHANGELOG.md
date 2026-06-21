# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
