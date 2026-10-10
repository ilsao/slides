# Backend Workshop 教材模組

這份簡報已接入根目錄的 Slides 網站。請在上層 `slides/` 執行 `npm ci`、`npm run dev` 或 `npm run build`；放映路徑為 `/slides/backend-workshop`。

共 92 個播放頁面、35 個 Notion 程式碼區塊，保留原有逐步揭露、程式碼聚焦、章節指引與十分鐘休息倒數。Final Lab 保留於教材但不列入播放。講者提詞介面、授課計時及跨分頁同步已移除。

網站啟動、操作、測試及部署方式見 [根目錄 README](../README.md)；新增簡報方式見 [作者指南](../docs/authoring.md)。

## 教材維護

- `sources/scene-script.md`：概念腳本。
- `sources/notion.md` 與 `sources/notion-code.json`：講義快照與程式碼共同來源。
- `sources/join-demo.json`：JOIN 的多筆資料、查詢參數與六個教學步驟。
- `scripts/build-lessons.mjs`：教學順序、穩定 ID、步驟、時間分配、來源引用與分頁。
- `src/definition.tsx`：播放核心 adapter、預覽代表頁及 Workshop 專屬版型。
- `src/rest.ts` 與 `src/RestProvider.tsx`：休息倒數；首次進入自動開始，重設後手動開始。
- `src/ProgressGuide.tsx` 與 `src/outline.ts`：本機講義對照與放映章節指引。
- `src/WorkshopScenes.tsx`、其他場景元件與 `src/styles.css`：專屬視覺與頁內動畫。CSS 限定於 `data-deck="backend-workshop"`。
- `docs/code-coverage.md`：來源程式碼覆蓋對照。
- `slides.md` 與 `docs/teaching-script.md`：完整教材腳本，由產生器更新。
- `examples/`：Python／FastAPI／SQLite 教材範例。

在根目錄執行 `npm run content` 重新產生教材；`npm run build` 也會執行此步驟。根目錄共用播放程式位於 `src/presentation/`，Workshop 的來源格式、180 分鐘課程安排與視覺留在本模組。

`docs/revision-*.md` 與歷史 `docs/visual-checks/` 是舊版記錄；其中的提詞、同步或舊網址描述不代表目前功能。
