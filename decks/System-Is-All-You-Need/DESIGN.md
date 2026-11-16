# Keynote revision · November 2026

ML systems technical keynote for computer science students. The slides accompany a spoken talk.

## Visual system

- Carbon #080b10, Paper #f6f6f4, Graphite #17191c, Fog #777d87, Rule #d9dce1, Signal #376bba.
- Helvetica Neue for Latin; PingFang TC for Traditional Chinese, with system and bundled CJK fallback. Display 108–140 / 400–500; technical headings 66 / 450; labels 22–28 / 400.
- Cover: full-bleed NASA Webb Cosmic Cliffs, downsampled from a 14575 px original to 4096 px. Preserve nebula detail under a restrained contrast overlay. Large two-line name and one short subtitle.
- Section cards: six distinct full-bleed NASA Webb cosmic images, dark left-side scrim, one two-line heading and one restrained subtitle. Technical diagrams retain the light canvas.
- Technical pages: a large, meticulous engineering diagram, short noun heading, low-chroma emphasis only for the moving/active object. Show scope, inputs, outputs and allocation units where they change interpretation. Technical qualifications stay in notes and source document.
- Closing: Oskar Kadaksoo’s coastal aurora from Unsplash, downsampled from a 7872 px original to 4096 px. Left-aligned type occupies the naturally dark sky; the aurora and reflection remain visible on the right.

## Motion

Object identity carries explanations across pages. Transform-only movement wherever possible; animated dimensions and shadows are avoided. Every ordinary page change paints the destination background immediately. The title moves at 0ms, the diagram follows at 110ms, and local labels enter from 250ms with bounded stagger. Only the diagram and individual details reveal locally; the slide root is never faded. Never clone or retain outgoing page paint, and never clip the incoming page. Shared objects retain explanatory FLIP movement. No perpetual ambient motion.

## Critique constraints

Avoid a uniform card kit, oversized rounded rectangles, all-caps metadata, punctuation-as-branding, motivational sentence headings, glowing AI imagery, rainbow token palettes, and every-page fade/slide choreography. More refinement must not become more decoration.


## Content-first refinement

The original outline remains 38 slides and 96 manual states. Opening architecture now names each layer’s job and previews the technical route. Chapter transitions connect hardware parallelism to batching, I/O cost to FlashAttention, and growing KV state to paging. The recap uses three engineering questions, the corresponding mechanism, and the course that supplies its foundations.

Use real explanatory detail instead of repeated decorative grids: causal-mask axes, next-token feedback, roofline units and native subscripts, simultaneous online-softmax state, a one-to-one request capacity diagram, logical/physical block mappings, explicit KV ownership and recycling.

Motion preserves authored perspective transforms and opacity through interruption. Incoming headings, surfaces and scenes remain fully painted from the first frame. The outgoing layer is excluded with static opacity, so cancellation cannot resurrect it. No heading or whole-scene re-entry fade follows a page change. Diagram arrows finish within the same beat as their corresponding objects. Review pages expose every settled state and an enlarged step view for inspection.


## Gallery cover

The first slide occupies the exact center of a 3 × 3 mosaic, with eight real technical slides surrounding it and filling the card to its edges. The center slide remains complete at desktop and mobile widths. The gallery keeps previews still; decoded photographic assets are prepared separately by the player.
