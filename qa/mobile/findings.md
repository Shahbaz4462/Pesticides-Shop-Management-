# Narrow-screen QA findings

The authenticated Chrome DevTools Protocol emulation covered dashboard, billing, and inventory at 360, 375, 390, 412, 430, and 768 px widths. Across the tested routes, `documentWidth` matched the emulated viewport width and `horizontalOverflow` was false. Each route reported exactly one visible child under `main > .screen-container`, confirming that only one active main screen is rendered. The mobile bottom navigation was visible at phone widths and hidden at 768 px after the tablet refinement.

Navigation timing from the loaded session was approximately 59 ms to DOM interactive, 572 ms to DOMContentLoaded, and 1,014 ms to load completion. The session reported 64 resources, 10 JavaScript resources, and zero layout-shift entries.

Visual review of the 360 px billing screenshot showed the POS screen stacking vertically, with a touch-sized search field, horizontally scrollable category chips, separated product cards, and a six-item bottom navigation bar. The emulated dashboard screenshot was captured while the menu drawer was open; the drawer stayed within the 360 px viewport and the active inventory item was visually distinct. The shop title is intentionally ellipsized on narrow screens to preserve header controls.
