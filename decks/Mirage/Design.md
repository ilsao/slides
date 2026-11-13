# Mirage — Focused proposal slides

## Scope and content

Only Mirage slides are changed. Seven pages: cover, testing space, representation example, architecture, discovery attribution, bug evidence, and a closing / Q&A page. Fifteen total states include nine architecture states. The talk takes approximately 5–8 minutes. Implementation specifics, derivations, caveats, references and Q&A material live in SPEAKER_NOTES.md, rather than in projected footnotes or appendix pages.

## Visual hierarchy

The existing minimalist direction remains: Manrope / Source Han Sans, white background, aligned 96px projection margins, open layouts, 8px-based spacing, and modest corner radii. Authored copy uses #171717 on white; expanded architecture views use white on #171717. The former MR comparison line and final evaluation page are removed. Forward evidence explicitly contrasts expected and actual ln(10) ≈ 2.3026. No secondary grey descriptions, repeated source footers, redundant English section labels or decorative captions remain.

Semantic emphasis uses #FFE45C behind key phrases and mismatched matrix values. P1 follows the same white background, black typography, yellow emphasis, 96px margins and 8px radius as the remaining deck. Its original white-ground optical artwork merges directly into the page, bleeding beyond the authored right / top / bottom edges while leaving the copy area clear. It has no frame, radius, card background or shadow. In portrait it flows beneath the copy to the viewport edges. A live Manrope title, concise Chinese subtitle and fine rule retain the deck hierarchy. The current asset and prompt are recorded in sources/cover-integrated-v2.md. A full-bleed dark cover was rejected for inconsistency and is not the final design. The former tensor tile, memory lattice and yellow label blocks are removed. Primary research / visual references and the complete imagegen prompt are saved in sources/cover-direction.md. The remaining slides retain their existing design.

Architecture now uses three persistent panel elements, not a separate clipped curtain. Each panel owns its number, title, English name and detail rows. The same title and subtitle nodes interpolate between the card and full-canvas positions over 560ms. Details remain mounted, fade out as the panel contracts, and fade in after expansion begins. On collapse the black panel returns to its exact card bounds before returning to white; text color crosses at a contrast-preserving point instead of fading through the background color. The overview heading itself never changes text. The header uses difference compositing over the moving black / white surface. Reduced motion and previews settle immediately.

The overview has no task descriptions or feedback footer. Projection cards are 432px high, portrait cards 272px; portrait detail content reflows naturally. Mirage's player background fills expanded letterboxing. The gallery lists exactly nine previews: six content previews plus the three black expanded states (architecture steps 1, 4 and 7). The central preview (index 4) is the Mirage cover. P1 subtitle is 探索深度學習框架的新測試空間 and gallery description is “探索深度學習框架的新測試空間。”. No shared Gallery or player implementation was edited.

The original reference interpretation is Mercury / Revolut hierarchy and neutral surfaces, Zara whitespace, Fresha legibility and Magnific evidence clarity. Exact Mobbin collections were inaccessible; do not claim direct screenshot inspection. User requests for stronger emphasis and fewer words override the earlier subdued state styling.

## Responsive behavior

Projection remains 1600×900. Portrait viewports below 960px receive the existing single-column reading overlay, with wrapping text, readable matrices and 44px source links. Shared navigation, chapters, progress, fullscreen and reduced motion remain intact. The content revision increments the deck version so removed pages cannot restore obsolete progress.

## Integrity

Bug evidence remains attributed to the public PyTorch issue and independently checked analytic gradient. Discovery is explicitly attributed to the research workflow + Codex. Mirage remains a proposed framework; no automated framework result, fresh PyTorch execution, confirmed root cause or completed evaluation is claimed.

The closing page uses a large thank-you heading, the two research axes and a yellow Q&A highlight. It contains no implementation plan or additional claims.
