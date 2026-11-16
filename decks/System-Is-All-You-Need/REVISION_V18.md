# Version 18 · Sequential tangent entry

- Exactly one mark enters at a time: 420ms flight, 480ms spacing, with waiting marks hidden. Each joins the same clockwise tangent from the upper right before the next starts.
- Replace the long spiral with a short Cartesian quintic path. Its endpoint position, tangent velocity and centripetal acceleration match the running orbit. The arrival carrier subtracts the orbit's current position, so releasing it leaves no positional jump.
- All eight marks maintain the admission speed afterwards: one clockwise revolution every 3.84 seconds. Remove the group slowdown. Upright labels, the smooth p2 → p3 background color transition and reduced motion remain supported.

Validation: TypeScript, 66 unit tests, production/test builds and four focused built-Chrome regressions passed. A 221-sample timeline audit found at most one active flight and no visible waiting marks or source paint. All eight joins were checked at ±1ms: relative speed mismatch under 1.5% and heading mismatch under .015 radians. Every mark reaches the common 35° gate; cleanup leaves identical orbit poses. Eight sequential-entry frames were inspected visually. Artifacts: ignored output/playwright/sia-v18/.
