# Mirage — Gallery center and subtitle update

The gallery center preview (index 4 of nine) is now the Mirage first slide. P1 subtitle is exactly 探索深度學習框架的新測試空間; the gallery description is exactly 探索深度學習框架的新測試空間。.

Typecheck, 60 static renders / forward-and-reverse navigation and production build passed. The authored font subset was regenerated (265 characters, 38,136 bytes). Browser checks at 1440×900 and 390×844 verified the exact gallery copy, nine previews and center cover; the live slide subtitle also matched exactly. No browser exceptions. Screenshots were visually inspected; artifacts are ignored under output/playwright/mirage-copy/. The share cover was regenerated with the new subtitle. Shared Gallery code and playback behavior were not changed.

## Earlier validation

# Mirage — Closing page added

A single closing page was appended after the gradient evidence. It uses the same white background, black typography and yellow emphasis, with 謝謝聆聽, the two research axes and Q&A. The deck now has seven pages / fifteen states; the existing nine gallery previews and all earlier page IDs and steps remain intact. A closing chapter jump was added. No cover or architecture styling was changed by this addition.

| Check | Result |
| --- | --- |
| TypeScript | npm run typecheck passed |
| Static render / navigation | 7 pages, 15 states, 60 projection / reading and playback / preview renders; forward and reverse passed |
| Production build | npx vite build passed |
| Closing browser | 1440×900, 390×844, 320×740: no text overflow; page label 07 / 07 |
| Last-page navigation | Next remains on the ending; Previous reaches gradient; next returns to ending |
| Reload | Ending page restores correctly at all three tested sizes |
| Browser exceptions | None |
| Font coverage | Chinese subset regenerated for authored text: 265 characters, 38,080 bytes |
| Whitespace | git diff --check passed |

Desktop closing screenshot was visually inspected. Audit scripts / screenshots are ignored under output/playwright/mirage-ending/.

## Previous cover validation

# Mirage — Integrated white cover

Only P1 and its cover assets were changed. The former black rectangle / cropped image card is replaced by an original white-ground optical composition. It merges with the white slide, has no border or radius, and bleeds beyond the right / top / bottom canvas edges. Typography remains live HTML, and the existing black / white / yellow design system is retained. In portrait, the art reaches both viewport edges and the bottom of the page; decorative art can sit behind the shared controls without covering slide text.

| Check | Result |
| --- | --- |
| TypeScript | npm run typecheck passed |
| Static rendering | Six pages, fourteen states, 56 projection / reading and playback / preview renders passed |
| Production build | npx vite build passed |
| Cover browser | 1440×900, 1920×1080, 1024×768, 320×740, 390×844, 768×1024, 820×1180: image loaded, no text or horizontal overflow |
| Image treatment | 0px radius and multiply compositing at every tested size; white player background |
| Gallery | Nine previews retained, including three black details; new cover loaded |
| Browser exceptions | None |
| Whitespace | git diff --check passed |

Final slide and phone screenshots were visually inspected. Audit scripts and screenshots are ignored under output/playwright/mirage-integrated/. The current asset is assets/mirage-optical-white-v2.jpg (288,806 bytes). It was generated with built-in imagegen; the prompt and saved original are documented in sources/cover-integrated-v2.md. Prior cover directions are superseded. No third-party reference artwork is embedded.

P4's persistent panel animation and the other content pages were not modified. Their earlier morph / navigation audit is in output/playwright/mirage-morph/: 50 sampled frames per collapse, stable title nodes, continuously decreasing width, and minimum large-title contrast 3.89:1. This P1-only pass did not repeat that animation benchmark.

The research workflow + Codex attribution and source caveats remain unchanged. No new PyTorch execution or framework evaluation was performed.
