# Logo Component Design

**Date:** 2026-03-10

**Problem**

ParsePal currently renders its brand as repeated inline text in multiple places, mainly the public navigation and the authenticated app sidebar. That duplicates typography decisions, makes future brand updates noisy, and leaves no shared API for showing an icon-only or title-only brand treatment in compact layouts.

**Goal**

Create a shared `Logo` component for the web app that can render an icon, a title, or both. Use a Lucide icon that fits a document/chat product, keep the component lightweight, and replace current brand-mark occurrences without affecting functional UI icons elsewhere.

**Approaches Considered**

1. **Single shared `Logo` component**
   One component owns the icon + title composition and exposes props for showing either.

   Pros:
   - Smallest API surface.
   - Centralizes branding markup and typography.
   - Simple to roll out in the existing nav and sidebar.

   Cons:
   - Slightly less flexible than splitting icon and wordmark primitives.

2. **Separate `LogoIcon` and `LogoWordmark` with a composed `Logo`**
   Create lower-level primitives and compose them into a top-level `Logo`.

   Pros:
   - Good for future favicon, animated mark, or app-switcher use cases.

   Cons:
   - More abstraction than the current product needs.
   - More exports and more decisions for callers.

3. **Leave markup inline and share only typography classes**
   Keep icon and title composition duplicated in each consumer.

   Pros:
   - Minimal new abstraction.

   Cons:
   - Repeats brand markup.
   - Makes future brand changes easy to miss.
   - Does not solve the icon-only/title-only requirement cleanly.

**Decision**

Use the **single shared `Logo` component** approach.

**Design**

## 1. Component Shape

Create a shared `Logo` component in the web app component layer. It should render a Lucide icon plus the `ParsePal` wordmark by default, with props that allow callers to hide either side when needed.

Recommended props:

- `showIcon?: boolean`
- `showTitle?: boolean`
- `className?: string`
- `iconClassName?: string`
- `titleClassName?: string`

Behavior:

- default: icon + title
- icon-only: render the icon when `showTitle={false}`
- title-only: render the wordmark when `showIcon={false}`
- both false: return `null`

The component should own horizontal alignment and spacing, but leave exact sizing and contextual styling adjustable through class props.

## 2. Icon Choice

The requested direction is **document/chat literal**. Lucide does not provide a perfect combined “PDF chat” symbol, so the brand mark should choose the strongest conversation-oriented icon and let the product name carry the document meaning.

Recommended icon: `MessagesSquareIcon`

Why:

- reads immediately as conversation/messaging
- feels more like a product mark than `FileTextIcon`
- scales well in nav/sidebar brand slots
- stays simple enough to work beside the wordmark

Functional icons such as upload, GitHub, panel toggles, and file/document icons remain unchanged. Only brand-mark occurrences should be replaced by the new shared component.

## 3. Integration

Replace the current plain-text `ParsePal` brand usage in:

- public navigation
- authenticated app sidebar

Keep the existing font direction:

- title uses the current `Space Grotesk` styling
- technical labels elsewhere remain on `IBM Plex Mono`

The logo icon should inherit text color so it adapts naturally across public and app shells without introducing new theme tokens.

## 4. Performance and Architecture

The component should remain server-safe and lightweight:

- no client state
- no effects
- no memoization for a small presentational component
- direct `lucide-react` import instead of an extra icon indirection layer

This keeps the implementation aligned with the current Next.js app-router setup and avoids unnecessary client work.

## 5. Accessibility and Verification

Accessibility:

- the `Logo` component itself should stay presentational
- when used as an icon-only interactive control, the wrapping link or button should provide the accessible label

Manual verification:

- public nav renders the shared logo correctly
- sidebar renders the same shared logo correctly
- icon-only and title-only states render as expected if exercised locally
- no non-brand icons are replaced unintentionally

**Out of Scope**

- replacing functional UI icons across the app
- creating a custom SVG logo system
- animating the mark or adding advanced brand motion
