# Breaking Changes - ng-hub-ui-nav

This document tracks breaking changes in the `ng-hub-ui-nav` library.

## Version 22.1.0

### New default active/hover/surface appearance (visual breaking)

- **Change**: The default visual treatment of the nav was reworked to read as a soft, accent-themed surface rather than a high-contrast solid bar:
    - The **active item** moved from a solid accent fill + white text (`--hub-nav-item-active-bg: #0d6efd; --hub-nav-item-active-color: #fff;`) to a **soft accent tint background + accent-coloured text**. In a **horizontal** navbar the active item additionally gains an accent **indicator bar** along its bottom edge (a tabs-style underline); vertical/sidebar navs are signalled by the tint + accent text alone (no inline-start bar).
    - The **hover background** moved from a neutral grey overlay to a **soft accent tint**.
    - The **nav surface** (`--hub-nav-bg`) moved from pure white to a **faint wash of the accent** (`color-mix(accent 5%, surface)`), so each `variant` reads as a distinctly-themed surface.
- **Impact**: This is a purely **visual** breaking change — no API, markup, or input was removed or renamed; existing code keeps compiling. However, the rendered appearance changes for every consumer that relied on the previous solid-fill look.
- **Accessibility note**: The active item now relies on a **tinted background + accent text** rather than a solid fill with white text. The accent-on-tint pairing is lighter-contrast than the previous white-on-solid pairing. If your design requires a guaranteed high-contrast active state (e.g. for WCAG AA on a busy background), restore the legacy solid fill via the recipe below, or supply an accent whose tint/text pairing meets your contrast target.
- **Restore the previous look**: Override the four tokens at component, page, or theme level to reinstate the v22 solid-fill appearance:

    ```css
    .my-nav {
    	/* Active item: solid accent fill + white text (legacy look) */
    	--hub-nav-item-active-bg: #0d6efd;
    	--hub-nav-item-active-color: #ffffff;
    	/* Hover: neutral grey overlay (legacy look) */
    	--hub-nav-item-hover-bg: rgba(0, 0, 0, 0.04);
    	/* Nav surface: pure white (legacy look) */
    	--hub-nav-bg: #ffffff;
    }
    ```

    The horizontal active indicator bar inherits `--hub-nav-item-active-indicator-color` (the accent) and is harmless over a solid fill; set `--hub-nav-item-active-indicator-size: 0` if you want it gone.

## Version 21.1.0

No breaking changes were introduced in this release.

## Version 21.0.0

### Angular 21 alignment

- **Change**: The library major version aligns with Angular 21.
- **Impact**: Consumers should use Angular 21 or newer when adopting `ng-hub-ui-nav` 21.x releases.
