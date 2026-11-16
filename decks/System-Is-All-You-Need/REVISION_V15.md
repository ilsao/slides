# Version 15 · Animation corrections

43 pages / 108 manual states.

- p2: CSS authored endpoints now match the finished opening (left curtain −100%, right +100%, seam opacity 0). Releasing fill effects no longer closes the opening again.
- p3: only Claude Code, Codex, Cursor, OpenAI and Qwen. All clockwise, evenly spaced initial phases, shell radii and slightly different periods. Upright marks/labels. New marks sourced from https://github.com/lobehub/lobe-icons and https://unpkg.com/@lobehub/icons-static-svg@latest/icons/; OpenAI/Cursor retained from the previous sourced assets.
- p9: selected human query explicitly maps to four labeled causal-key weights, with values and the full attention formula below. The right-hand chart is attention weights, not next-token sampling probabilities.
- p10: probability bars interpolate from their captured transforms. EOS uses the same 64px type as preceding output.
- p13 and Grid: persistent overview starts centered and shrinks/moves into its left context location. The selected SM/block expands independently. No replacement of the entire overview by a different thumbnail.
- p18: remove the detached gate/wait wire. One correctly positioned time playhead, with waiting text inside the idle region. Progress bars and playhead use the same time mapping and clamping, including t50→t10 rewind and completed-request boundaries. Native progress CSS transitions are disabled to avoid a second competing clock.
- p19: 10 → admit D at10 → advance to30 (E waiting) → admit E at30 → advance to50. Full rectangle admission retained.
- p21/p22: persistent linear data streams, 600ms vs2400ms cycles, staggered negative phases. Packets cross the SM boundary before fading; continuous until leaving the page. Reduced motion stops ambient movement.

Validation: TypeScript, 66 unit tests, production/test builds; 20 established Chrome regressions and four new focused built-Chrome regressions passed. New cases verify the post-cleanup opening endpoint, five marks/direction, probability interpolation/EOS size, GPU first-frame pose, intermediate bar/playhead synchronization, E sequencing, and packets visibly inside SM after multiple cycles. All 43 pages /108 static states rendered with zero SVG-text collisions or browser errors. Artifacts: ignored output/playwright/sia-v15/.
