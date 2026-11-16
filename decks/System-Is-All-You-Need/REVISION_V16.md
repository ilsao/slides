# Version 16 · Opening, agent orbit and batching fill

43 pages / 108 manual states.

- p2: remove the independently fading white seam. Subtle gray borders belong to the two dark panels and travel outward with them. The opening keeps its center-out motion and authored offscreen endpoints.
- p3: eight marks: Claude Code, Codex, Cursor, OpenAI, Qwen, Gemini, GLM and Copilot. All clockwise with the same 14-second period; evenly spaced phases and three orbital radii keep a coherent, varied orbit. Labels stay upright. GLM uses the ChatGLM family mark from [Lobe Icons](https://github.com/lobehub/lobe-icons), [SVG source](https://unpkg.com/@lobehub/icons-static-svg@latest/icons/chatglm.svg).
- Continuous batching: each request now has one rectangle containing its ID, duration and progress. Remove the competing span/reveal layer and keep the background stable after admission. Progress and playhead share the same time mapping. Normalize every progress keyframe to scaleX, including zero: interpolating a singular matrix(0,…) against scaleX caused D's empty bar to jump instead of fill.

Validation: TypeScript, 66 unit tests, production/test builds and 25 built-Chrome regressions passed. The new D regression samples 0/100/260/520/900ms, comparing fill to the actual playhead, stable card geometry/background and border alignment. Existing checks cover all 84 forward/reverse page boundaries, seven permitted 240ms section fades, interruption, cleanup and reduced motion. All 43 pages /108 static states rendered with zero SVG-text collisions or browser errors. p2's 120/300/480/650/900ms frames were also inspected visually. Artifacts: ignored output/playwright/sia-v16/.
