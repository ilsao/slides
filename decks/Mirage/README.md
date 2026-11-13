# Mirage — Final Project Proposal

探索深度學習框架的新測試空間。**7 頁、15 個放映狀態，約 5–8 分鐘。**

- [放映](http://127.0.0.1:5173/mirage?start=1)
- [所有投影片總覽](http://127.0.0.1:5173/decks/Mirage/review.html)
- [逐步總覽](http://127.0.0.1:5173/decks/Mirage/review.html?steps=1)
- [講者筆記](SPEAKER_NOTES.md)
- [設計系統](Design.md)
- [驗證紀錄](docs/VALIDATION.md)

## 視覺與閱讀

全篇使用無襯線字體、黑白主體與一致留白。只保留重點文字；架構展開頁補充三個重點，其餘推導與來源放在講者筆記。重點以黃色實底標示，架構每層依序黑底聚焦、全頁展開、收回白底總覽，錯誤梯度以黃色色塊和黑框直接標示。

第 1 頁沿用白底、黑字與黃色重點，搭配大字排版及直接融入頁面的白底光學視覺，沒有獨立圖片框；素材與生成提示保存於 [封面整合紀錄](sources/cover-integrated-v2.md)，網路參考保存於 [設計方向](sources/cover-direction.md)。第 4 頁總覽只保留編號、中英文名稱；同一張卡片平滑展開與縮回，標題與英文名稱持續移動，詳細文字以淡入淡出過渡。黑底展開會填滿畫布外的留白。首頁提供九張預覽，中央固定為 Mirage 第一頁，其中三張為各層的黑底展開頁。

第 5 頁先說明研究流程 + Codex 的發現方式，第 6 頁展示 bug 證據，並明列 forward 的預期值與實際值。第 7 頁以「謝謝聆聽」與 Q&A 收尾。

桌面及橫向放映沿用 1600×900 舞台。寬度小於 960px 的直向畫面切換為單欄閱讀：文字、表格、程式與公式重排，長頁可捲動。旋轉螢幕會保留當前投影片；切換頁面會將閱讀區回到頂端。首頁縮圖保持靜態投影片。

## 證據與歸因

[PyTorch issue #204407](https://github.com/pytorch/pytorch/issues/204407) 是依研究流程搭配 **Codex** 找到並回報的初步案例。Mirage 三層自動化框架仍是 proposal。

快照保存於 `sources/pytorch-204407.json`；2026-11-13 的快照為 open、0 comments。未宣稱維護者已確認根因、完成修復或 GPU reproduction。數值出自 issue，本次未執行 PyTorch；解析梯度另以 central finite difference 檢查。

## 執行與驗證

從專案根目錄執行：

```bash
npm run dev
npm run typecheck
npm test
node decks/Mirage/scripts/validate.mjs
npx vite build
```

靜態檢查涵蓋全部頁面、步驟、projection / reading 與 playback / preview。SSR 檢查使用獨立快取，不影響執行中的開發伺服器。`npx vite build` 驗證正式網站，不重新生成其他教材。總覽入口供開發檢視；正式放映路由是 `/mirage`。

## 播放

`→` / Space 前進，`←` 返回，Page Up / Page Down 直接換頁，`O` 開啟章節，`F` 全螢幕。原有共用播放器繼續處理導覽與進度儲存。減少動態效果設定與靜態預覽均不播放過場。

## 字體與來源

- Manrope：`assets/Manrope-Regular.ttf`，OFL 授權。
- 中文字集：由專案既有 Source Han Sans TW 製作、依 OFL 更名為 Mirage Text Han；授權位於 `assets/SourceHanSans-LICENSE.txt`。
- JetBrains Mono：專案既有 `/public/fonts/` 本地字體與授權。
- 修改文字後，先執行靜態驗證，再以安裝了 `fonttools`、`brotli` 的 Python 執行 `scripts/subset-font.py` 更新字集。
- 使用者最新設計規格保存於 `sources/premium-minimalist-brief.md`。舊版 serif 與效果素材保留在目錄中，但不由目前的投影片匯入或載入。
