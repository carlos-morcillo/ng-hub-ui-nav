# ng-hub-ui-nav — CSS Variables Reference

This document lists the CSS custom properties exposed by `ng-hub-ui-nav`.

## Usage

Import the library styles and override tokens at component, page, or theme level.

```scss
@use 'ng-hub-ui-nav/src/lib/styles/nav-tokens';
```

## Layout

| Variable | Default |
|---|---|
| `--hub-nav-height` | `3.5rem` |
| `--hub-nav-padding-x` | `var(--hub-ref-space-3, 1rem)` |
| `--hub-nav-padding-y` | `var(--hub-ref-space-2, 0.5rem)` |
| `--hub-nav-gap` | `var(--hub-ref-space-1, 0.25rem)` |
| `--hub-nav-horizontal-padding-y` | `0` |
| `--hub-nav-horizontal-padding-x` | `0` |
| `--hub-nav-horizontal-row-gap` | `0` |
| `--hub-nav-horizontal-items-justify` | `center` |
| `--hub-nav-horizontal-items-overflow-x` | `auto` |
| `--hub-nav-horizontal-items-overflow-y` | `hidden` |
| `--hub-nav-vertical-items-overflow-y` | `auto` |
| `--hub-nav-vertical-items-overflow-x` | `hidden` |
| `--hub-nav-vertical-panel-padding-inline` | `var(--hub-ref-space-2, 0.5rem)` |
| `--hub-nav-vertical-panel-padding-block` | `0` |
| `--hub-nav-horizontal-panel-padding-y` | `var(--hub-ref-space-2, 0.5rem)` |
| `--hub-nav-horizontal-panel-padding-x` | `0` |
| `--hub-nav-sticky-top` | `set by component config` |

## Scrollbars

| Variable | Default |
|---|---|
| `--hub-nav-scrollbar-width` | `none` |
| `--hub-nav-scrollbar-color` | `transparent transparent` |
| `--hub-nav-scrollbar-webkit-size` | `0` |
| `--hub-nav-scrollbar-thumb-color` | `transparent` |
| `--hub-nav-scrollbar-track-color` | `transparent` |
| `--hub-nav-scrollbar-thumb-radius` | `var(--hub-ref-radius-pill, 999px)` |

## Surface and Borders

| Variable | Default |
|---|---|
| `--hub-nav-bg` | `var(--hub-sys-surface-page, #fff)` |
| `--hub-nav-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-nav-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` |
| `--hub-nav-border-width` | `1px` |
| `--hub-nav-border-style` | `solid` |

## Brand Slots

| Variable | Default |
|---|---|
| `--hub-nav-brand-font-size` | `var(--hub-ref-font-size-lg, 1.25rem)` |
| `--hub-nav-brand-font-weight` | `var(--hub-ref-font-weight-semibold, 600)` |
| `--hub-nav-brand-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-nav-brand-padding-x` | `var(--hub-ref-space-2, 0.5rem)` |

## Items

| Variable | Default |
|---|---|
| `--hub-nav-item-padding-x` | `var(--hub-ref-space-3, 1rem)` |
| `--hub-nav-item-padding-y` | `var(--hub-ref-space-2, 0.5rem)` |
| `--hub-nav-item-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-nav-item-font-size` | `var(--hub-ref-font-size-base, 1rem)` |
| `--hub-nav-item-font-weight` | `var(--hub-ref-font-weight-normal, 400)` |
| `--hub-nav-item-border-radius` | `var(--hub-ref-border-radius-sm, 0.25rem)` |
| `--hub-nav-item-transition` | `var(--hub-sys-transition-fast, 150ms ease)` |
| `--hub-nav-item-hover-bg` | `var(--hub-sys-state-hover-overlay, rgba(0, 0, 0, 0.04))` |
| `--hub-nav-item-hover-color` | `var(--hub-sys-color-primary, #0d6efd)` |
| `--hub-nav-item-active-bg` | `var(--hub-sys-color-primary, #0d6efd)` |
| `--hub-nav-item-active-color` | `#fff` |
| `--hub-nav-item-active-font-weight` | `var(--hub-ref-font-weight-semibold, 600)` |
| `--hub-nav-item-disabled-color` | `var(--hub-sys-text-muted, #6c757d)` |
| `--hub-nav-item-disabled-opacity` | `var(--hub-sys-opacity-disabled, 0.65)` |

## Dropdown and Caret

| Variable | Default |
|---|---|
| `--hub-nav-dropdown-bg` | `var(--hub-sys-surface-elevated, #fff)` |
| `--hub-nav-dropdown-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-nav-dropdown-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` |
| `--hub-nav-dropdown-border-radius` | `var(--hub-nav-item-border-radius, var(--hub-ref-border-radius-sm, 0.25rem))` |
| `--hub-nav-dropdown-shadow` | `var(--hub-sys-shadow-md, 0 0.5rem 1rem rgba(0, 0, 0, 0.15))` |
| `--hub-nav-dropdown-padding-y` | `var(--hub-ref-space-2, 0.5rem)` |
| `--hub-nav-dropdown-min-width` | `12rem` |
| `--hub-nav-dropdown-z-index` | `var(--hub-sys-z-index-dropdown, 1000)` |
| `--hub-nav-caret-size` | `0.3rem` |
| `--hub-nav-caret-color` | `currentColor` |

## Headers and Separators

| Variable | Default |
|---|---|
| `--hub-nav-header-font-size` | `var(--hub-ref-font-size-sm, 0.875rem)` |
| `--hub-nav-header-font-weight` | `var(--hub-ref-font-weight-semibold, 600)` |
| `--hub-nav-header-color` | `var(--hub-sys-text-muted, #6c757d)` |
| `--hub-nav-header-padding-x` | `var(--hub-ref-space-3, 1rem)` |
| `--hub-nav-header-padding-y` | `var(--hub-ref-space-1, 0.25rem)` |
| `--hub-nav-header-margin-top` | `var(--hub-ref-space-3, 0.75rem)` |
| `--hub-nav-header-margin-inline-start` | `var(--hub-ref-space-3, 0.75rem)` |
| `--hub-nav-header-horizontal-padding-inline-start` | `2rem` |
| `--hub-nav-separator-color` | `var(--hub-sys-border-color-default, #dee2e6)` |
| `--hub-nav-separator-margin-y` | `var(--hub-ref-space-2, 0.5rem)` |

## Badge and Icon

| Variable | Default |
|---|---|
| `--hub-nav-badge-font-size` | `var(--hub-ref-font-size-xs, 0.75rem)` |
| `--hub-nav-badge-padding-x` | `0.5em` |
| `--hub-nav-badge-padding-y` | `0.25em` |
| `--hub-nav-badge-bg` | `var(--hub-sys-color-danger, #dc3545)` |
| `--hub-nav-badge-color` | `#fff` |
| `--hub-nav-badge-border-radius` | `var(--hub-ref-border-radius-pill, 50rem)` |
| `--hub-nav-icon-size` | `var(--hub-ref-icon-size, 1.25rem)` |
| `--hub-nav-icon-gap` | `var(--hub-ref-space-2, 0.5rem)` |

## Toggler and Mobile

| Variable | Default |
|---|---|
| `--hub-nav-toggler-padding-x` | `var(--hub-ref-space-2, 0.5rem)` |
| `--hub-nav-toggler-padding-y` | `var(--hub-ref-space-1, 0.25rem)` |
| `--hub-nav-toggler-font-size` | `var(--hub-ref-font-size-lg, 1.25rem)` |
| `--hub-nav-toggler-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-nav-toggler-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` |
| `--hub-nav-toggler-border-radius` | `var(--hub-ref-border-radius-sm, 0.25rem)` |
| `--hub-nav-mobile-bg` | `var(--hub-sys-surface-page, #fff)` |
| `--hub-nav-mobile-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-nav-mobile-width` | `18rem` |
| `--hub-nav-mobile-z-index` | `var(--hub-sys-z-index-fixed, 1030)` |
| `--hub-nav-mobile-backdrop-bg` | `rgba(0, 0, 0, 0.5)` |
| `--hub-nav-mobile-transition` | `var(--hub-sys-transition-base, 300ms ease)` |
| `--hub-nav-mobile-accordion-gap` | `component-defined` |
| `--hub-nav-mobile-accordion-nested-spacing` | `component-defined` |
| `--hub-nav-mobile-body-padding-block-end` | `component-defined` |
| `--hub-nav-mobile-body-padding-inline` | `component-defined` |
| `--hub-nav-mobile-border-color` | `component-defined` |
| `--hub-nav-mobile-item-padding-inline` | `component-defined` |
| `--hub-nav-mobile-overlay-position` | `component-defined` |
| `--hub-nav-mobile-root-padding-inline` | `component-defined` |
| `--hub-nav-mobile-shadow` | `component-defined` |

## Accordion and Panel Mode

| Variable | Default |
|---|---|
| `--hub-nav-accordion-indent` | `var(--hub-ref-space-3, 1rem)` |
| `--hub-nav-accordion-transition` | `var(--hub-sys-transition-collapse, 350ms ease)` |
| `--hub-nav-panel-width` | `16rem` |
| `--hub-nav-panel-bg` | `var(--hub-sys-surface-elevated, #fff)` |
| `--hub-nav-panel-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-nav-panel-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` |
| `--hub-nav-panel-border-width` | `1px` |
| `--hub-nav-panel-shadow` | `var(--hub-sys-shadow-sm, 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075))` |
| `--hub-nav-panel-z-index` | `var(--hub-sys-z-index-dropdown, 1000)` |
| `--hub-nav-panel-transition` | `transform var(--hub-sys-transition-base, 300ms ease)` |
| `--hub-nav-panel-header-height` | `3rem` |
| `--hub-nav-panel-header-bg` | `var(--hub-sys-surface-page, #fff)` |
| `--hub-nav-panel-header-border-color` | `var(--hub-sys-border-color-default, #dee2e6)` |
| `--hub-nav-panel-header-font-size` | `var(--hub-ref-font-size-sm, 0.875rem)` |
| `--hub-nav-panel-header-font-weight` | `var(--hub-ref-font-weight-semibold, 600)` |
| `--hub-nav-panel-header-padding-x` | `var(--hub-ref-space-3, 1rem)` |
| `--hub-nav-panel-back-color` | `var(--hub-sys-text-primary, #212529)` |
| `--hub-nav-panel-back-hover-bg` | `var(--hub-sys-state-hover-overlay, rgba(0, 0, 0, 0.04))` |
| `--hub-nav-panel-back-size` | `2rem` |
