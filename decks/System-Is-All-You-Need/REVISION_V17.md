# Version 17 · ChatGPT to Agents

- p2 → p3: capture the currently painted background and foreground colors before navigation. Interpolate the destination background from that color to the authored dark background over 680ms. The source page remains hidden immediately; no source clone or whole-page opacity animation.
- Agents marks enter from outside the upper-right edge, moving inward on clockwise spirals around the central title. Each arrival takes 1280ms with 25ms spacing. Labels reveal during the last 240ms.
- Arrival carriers subtract the synchronized running orbit from the spiral path. The spiral ends at the orbit's position and angular velocity; radial velocity reaches zero. Releasing the entrance animation leaves the existing upright, 14-second clockwise orbits running.
- Reduced motion uses the authored static positions and final background.

Validation: TypeScript and 66 unit tests passed. The 25 established built-Chrome regressions passed; after the final trajectory adjustment, the three boundary/opening/reduced-motion regressions passed again. Eight timed p2 → p3 frames verified matching initial background, monotonic darkening, all eight marks starting outside the upper-right edge, final zero-offset carriers, and hidden source paint throughout. The contact sheet was inspected visually. Production/test builds and diff whitespace checks passed. Artifacts: ignored output/playwright/sia-v17/.
