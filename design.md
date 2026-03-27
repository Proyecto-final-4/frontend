# Design System Strategy: The Intelligent Curator

## 1. Overview & Creative North Star
This design system moves away from the "transactional" nature of traditional fintech and toward the concept of **The Intelligent Curator**. In an era of information overload, FinanzIA does not just present data; it distills it. 

The Creative North Star is **"Architectural Clarity."** We treat the interface not as a series of boxes, but as a digital environment of light and depth. By leveraging a chat-first architecture, we prioritize the "flow" of conversation over the "friction" of navigation. The visual language utilizes intentional white space, sophisticated tonal layering, and high-contrast typography to ensure the AI's insights feel authoritative yet approachable. We break the "template" look by using asymmetric sidebar compositions and floating conversational bubbles that feel like physical objects resting on a premium surface.

---

## 2. Color & Surface Philosophy
The palette is rooted in a deep, intellectual teal, supported by a sophisticated range of cool grays.

*   **Primary (#00464a):** Used sparingly for high-impact actions and brand presence.
*   **The "No-Line" Rule:** Explicitly prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, the sidebar uses `surface_container_low` while the main chat area uses `surface`. 
*   **Surface Hierarchy & Nesting:** Use tiers to create "nested" depth.
    *   **Main Background:** `surface` (#f8f9fa).
    *   **Sidebar/Navigation:** `surface_container_low` (#f3f4f5).
    *   **Chat Bubbles (AI):** `surface_container` (#edeeef).
    *   **Chat Bubbles (User):** `primary_container` (#006064) with `on_primary` (#ffffff) text.
*   **The Glass & Gradient Rule:** For floating modals or the persistent bottom input bar, use a `surface_lowest` color with a 70% opacity and a `24px` backdrop-blur. Apply a subtle linear gradient from `primary` to `primary_container` (15% opacity) on active states to provide a professional "shimmer."

---

## 3. Typography: The Editorial Voice
We use a dual-typeface system to balance character with utility.

*   **Headlines: Manrope.** Chosen for its modern, geometric construction and high legibility. Use `display-md` (2.75rem) for major financial summaries and `headline-sm` (1.5rem) for chat headers.
*   **Body: Inter.** The industry standard for data-heavy interfaces. Use `body-lg` (1rem) for AI responses to ensure maximum readability during long-form financial analysis.
*   **Hierarchy as Authority:** We use tight letter-spacing (-0.02em) on Manrope headlines to create an "editorial" feel, contrasting with the open, airy spacing of Inter body text. This visual tension signals that the AI is both precise and conversational.

---

## 4. Elevation & Depth
In this system, depth is a functional tool, not a stylistic flourish.

*   **Tonal Layering:** Avoid drop shadows for static elements. Instead, place a `surface_container_lowest` card on a `surface_container_high` background to create a "lift" through contrast alone.
*   **Ambient Shadows:** For floating elements (like a tool-tip or a pop-over menu), use an extra-diffused shadow: `0px 12px 32px rgba(0, 70, 74, 0.06)`. Note the use of a teal-tinted shadow rather than pure black to maintain color harmony.
*   **The Ghost Border:** If a visual boundary is required for accessibility in data tables, use the `outline_variant` (#bec8c9) at 20% opacity. 100% opaque borders are strictly forbidden.
*   **The Sidebar:** The persistent sidebar should feel like a "grounding" element. Use `surface_dim` for the active state background with a `ROUND_EIGHT` (0.5rem) corner radius.

---

## 5. Components & Interface Elements

### Buttons
*   **Primary:** `primary` background with `on_primary` text. Use `ROUND_EIGHT` (0.5rem) corners. No border.
*   **Secondary:** `secondary_container` background with `on_secondary_container` text.
*   **Tertiary/Ghost:** Transparent background, `primary` text. Use only for low-priority sidebar actions.

### Chat-First Inputs
*   **The Command Bar:** The persistent input bar should be a "floating" container. Use `surface_container_lowest` with a `2px` "Ghost Border" of `primary_fixed_dim` at 10% opacity. 
*   **Contextual Chips:** Use `secondary_fixed_dim` for suggested AI prompts. These should have a subtle hover transition to `secondary_fixed`.

### Data Visualization (The Curator’s Lens)
*   **Charts:** Use `primary` (#00464a) and `tertiary` (#62330f) for contrasting data sets. 
*   **Forbid Dividers:** In lists of transactions or chat history, do not use lines. Separate items using `8px` (Spacing-2) of vertical white space or a subtle shift to `surface_container_low` on hover.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `surface_container_highest` for "Selected" states in the sidebar.
*   **Do** use `ROUND_EIGHT` (0.5rem) for all containers, but use `full` (9999px) for status badges and chips.
*   **Do** embrace asymmetry. The AI response can be left-aligned with a wider margin on the right to create an editorial layout.
*   **Do** use `tertiary` (#62330f) for "insight" callouts—this warm earth tone breaks the teal monochrome to draw the eye to critical warnings or advice.

### Don’t
*   **Don’t** use pure black (#000000) for text. Always use `on_surface` (#191c1d) to maintain a premium, softened contrast.
*   **Don’t** use standard "Material Design" shadows. If it looks like a default, it’s wrong.
*   **Don’t** use borders to separate the sidebar from the main chat. The background color shift from `surface_container_low` to `surface` is sufficient.
*   **Don’t** use harsh animations. All transitions should use a `cubic-bezier(0.4, 0, 0.2, 1)` easing for a fluid, high-end feel.