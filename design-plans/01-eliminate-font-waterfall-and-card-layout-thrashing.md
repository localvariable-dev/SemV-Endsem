# Eliminate Font Waterfall, Layout Thrashing, and Search Overlap

Written against: 0ca5c1f

## Evidence chain

- Surface: `Website/index.html`, `Website/styles.css`, `Website/app.js`
- Problem: Render-blocking `@import` font waterfall causing FOUT and layout shift; missing layout containment on 53 card feed nodes causing avoidable reflows; visual collision between search clear button and shortcut hint `/` badge.
- Design evidence: `Website/styles.css` (lines 7, 635, 651), `premium-ui-ux-principles-report.md` Section 3 (Perceived performance and zero jitter), `react-best-practices` (`rendering-resource-hints`, `rendering-content-visibility`, `rendering-script-defer-async`, `js-index-maps`, `js-batch-dom-css`).
- Owner: `Website/index.html`, `Website/styles.css`, `Website/app.js`
- Scope and affected surfaces: Header search input, feed cards grid, typography rendering across all viewports.
- Uncertainty: none.

## Design decision

Hoist font preconnects and stylesheet link to `Website/index.html` head to eliminate the nested CSS `@import` network waterfall. Add `content-visibility: auto; contain-intrinsic-size: 1px 260px;` to `.card` to skip offscreen layout calculation for all 53 items. Conditionally hide the search shortcut hint `/` when the clear button is active to prevent element collision.

## Reuse

- `--font-sans`, `--border`, `--radius-pill` from `Website/styles.css`
- Exemplar: `Website/styles.css` lines 9-82

## Changes

1. `Website/index.html`
   - Change: Add `<link rel="preconnect" href="https://fonts.googleapis.com">`, `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`, and `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap">`. Add `defer` attribute to `<script src="data.js">` and `<script src="app.js">`.
   - Preserve: Existing meta tags and header structure.
   - Verify: No nested `@import` network request in DevTools; fonts load before first paint.

2. `Website/styles.css`
   - Change: Remove `@import` on line 7. Add `content-visibility: auto; contain-intrinsic-size: 1px 260px;` to `.card`. Add `.search-bar-wrap:has(.search-clear-btn.visible) .search-shortcut-hint { display: none; }` to suppress the shortcut hint when clear button is displayed.
   - Preserve: Card visual layout, badges, buttons, and interaction animations.
   - Verify: Offscreen cards do not trigger layout calculations during scroll; search clear button does not collide with `/` badge.

3. `Website/app.js`
   - Change: Build a `Map` for `CATALOG_DATA` lookups by `id` (`catalogMap = new Map(...)`) and batch card insertions with `DocumentFragment` during `renderFeed()`. Add `{ passive: true }` to scroll listeners.
   - Preserve: Filtering, modal trigger behavior, bookmarking, and search logic.
   - Verify: O(1) modal lookup; zero unnecessary reflows during feed re-renders.

## Scope

- Inherit: All card feed items, search input, typography across desktop and mobile.
- Verify: Feed scrolling at 60fps on mobile viewports; search interaction flow.
- Exclude: File assets, modal dialog content structure.

## Validation

- Product: Filter and scroll through 53 catalog items smoothly with zero jitter.
- Interface: Test 390px mobile viewport, desktop viewport, dark and light modes.
- System: Confirm absence of duplicate font requests and verify clean layout containment.
- Repository: Inspect git diff against `0ca5c1f`.

## Stop conditions

- Stop if browser support for `content-visibility` causes rendering artifacts, or if font weights fail to resolve.

## Design documentation

- After acceptance and validation: Record updated font loading and layout containment decisions in design documentation.
