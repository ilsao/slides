# System Is All You Need

34 頁、約 30 分鐘的繁體中文技術演講。內容涵蓋 LLM request、GPU architecture、Continuous Batching、FlashAttention、PagedAttention 與完整 serving 流程。83 個可重現的畫面狀態，以少文字圖解配合口述。

在專案根目錄執行 `npm run dev`，開啟 `/system-is-all-you-need?start=1`。已登錄至首頁。→ / Space 推進步驟，← 返回；Page Down / Page Up 切換整頁，O 開啟章節，F 全螢幕。操作說明提供講者備註連結。

`SPEAKER_NOTES.md` 包含逐頁時間、講述提示與轉場。`SOURCES.md` 保存第一手參考資料、算例假設與技術界線。`sources/original.md` 是使用者提供的原始內容。

本機開發時可開啟 `/decks/System-Is-All-You-Need/review.html` 查看全套縮圖，或加 `?steps=1` 檢視全部 83 個靜態狀態。這個 authoring review 入口不包含於正式 Vite 單頁網站建置；正式放映入口正常包含於建置。

## 視覺與動畫

以參考簡報 <https://cerulean.works/slides/nchc-keynote/> 的深藍章節頁、冷白技術頁、大字與留白作為方向。原創的投影晶片導線形成封面與章節視覺，沒有拷貝參考網站的程式或圖像。

- Palette：Midnight `#0b1e3d`、Paper `#f2f5fa`、Ink `#152744`、Cobalt `#426dff`、Ice `#53d5f4`。
- 字體：本機 IBM Plex Sans 與思源黑體繁中，無網路字體依賴。
- 舞台：1600 × 900，沿用專案播放器等比例縮放。
- 動畫：晶片導線描繪、章節遮罩轉場、GPU 展開、batch 時間軸、Roofline 點位移動、tile 切換、KV 配置與共享。教學步進由講者控制，無無限循環。
- `still` / `prefers-reduced-motion` 直接落在當前狀態。首頁預覽不啟動計時器或播放副作用。

## 檔案

`deck.tsx` 管理頁序、文案、轉場與章節。`Scenes.tsx` 負責請求、FlashAttention 及整合流程。`GpuBatch.tsx` 負責 GPU 與排程。`MemoryScenes.tsx` 負責 KV 與分頁。各模組樣式使用 `sia-` 前綴。
