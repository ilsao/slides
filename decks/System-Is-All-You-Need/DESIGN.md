# One clear focus, enough context

Technical keynote for computer-science students. 42 slides, 101 manual states. The speaker carries the explanation; each technical slide keeps a primary visual and useful context where a relationship needs it. Gray descriptions under slide headings are removed.

## Visual system

- Paper #f6f6f4, Ink #17191c, Signal #376bba, Muted #68717e, Rule #ccd2db, Carbon #080b10.
- Helvetica Neue / PingFang TC with the bundled CJK fallback. Technical headings 70 px, orientation copy 27 px; essential labels generally 26–42 px. Small type is reserved for source credits and magnified local coordinates.
- A primary visual in the 1408×510 scene: a map, chart, chip, cache, matrix, memory bank, block or formula. Selective context insets clarify relationships: selected-query weights, GPU location, HBM source, tile scores, and previous/private KV blocks. Do not force every page to contain exactly one diagram.
- Split independent explanations across pages. Use manual states and cameras for related details. GPU-to-SM zoom removes peripheral geometry from paint; tiny world-coordinate labels keep zero letter spacing and enter after magnification.
- Six full-bleed NASA Webb chapter photographs; Cosmic Cliffs cover and Unsplash coastal-aurora closing. Chapters retain only the title and source credit.

## Motion

The old page is excluded from paint at CSS level and again in the transition callback. No clone, screenshot, source fade or incoming full-page clip. The slide root and primary scene stay opaque. Only destination objects participate.

Ordinary page entry uses a damped physical response rather than the same ease curve for every layer. Title: 48 px / 620 ms, light mass .95, no delay. Lead: 24 px / 600 ms from 65 ms. Primary diagram: 96 px horizontally, 8 px vertically, 1.2% depth / 880 ms from 70 ms, mass 1.8. Semantic details begin at 190 ms, capped at three 45 ms intervals. Chapter photographs push from 1.055× to 1× over 1150 ms. Do not stagger SVG text nodes by DOM order.

Related diagrams keep their parent anchored. Capture the actual visible SVG surface before mutation and cancellation; sample transform timelines 8 ms earlier in the same task to retain velocity. Matrix-to-tile and P7/P2 main-to-context handoffs begin at the captured rectangle and velocity. Camera motion lasts 840 ms; SVG object handoffs 820 ms. The response uses stiffness 320 / damping 40, with less than 1% default overshoot and no repeated bounce. Visible numeric replacements stay painted. Batch progress and playhead retain a common 520 ms rhythm.

The sampled output glyph starts at the right-hand sampling socket and follows a curved path above existing words before landing. Prior glyphs settle from their captured pose if the speaker advances early. Roofline motion follows its two segments. Decode words travel around the cache. Fixed-capacity blocks retain a 4×4 grid and row-major indices. All finished effects are released; still/reduced-motion shows the settled endpoint.

## Restraint

Keep cosmic photography, quiet typography, blue active states, and enough text to orient the audience. Avoid narration paragraphs and repeated subtitles. References and credits remain an appendix. Preserve the centered cover in the gallery mosaic.

## Grounding diagrams

Inspect the original teaching figures before redrawing. Follow their input/output, containment and memory-placement relationships, then adapt the amount of detail to the talk. Use actual tokens, position labels, named operators and routed connections. Do not use unlabeled rectangles as substitutes for a mechanism. The source-to-slide mapping is in TEACHING_REFERENCES.md. The teaching diagrams are original SVG redraws; stock cosmic photographs remain the chapter artwork.

## Apple reference revision (version 10)

See APPLE_MOTION_REFERENCES.md for the specific WWDC demonstrations and timestamps inspected before this revision. Ordinary page entry now uses 32px/500ms headings and 56px/700ms diagrams with critical damping and no depth scale. Shared object continuity remains. Chapter photograph motion is unchanged. Chapter words enter in 420ms with 65ms spacing; the full phrase completes within roughly 0.65 seconds.

Slides 02–05 are a deliberate opening sequence: large ChatGPT title and phrase reveal, aligned Agents title with three-beat action sequence, two-line dark question, then a hand-triggered expansion from Model to System. Do not apply the generic scene translation to a wrapper already containing masked text reveals.

Version 11 correction: all page boundaries enter through pageLayers, including shared-object pages. General technical/reference/takeaway headings now use masked word-group reveals (420ms, 55ms stagger); covers use line reveals. Parent entrance starts before FLIP measurement to preserve the actual captured source surface. Every technical page boundary explicitly tests both title and diagram animation coverage.
