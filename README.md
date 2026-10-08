# Slides

React／Vite 多簡報網站。首頁以真實投影片的靜態拼貼展示簡報；每份簡報可自行設計版型、字型、舞台比例、頁內動畫與跨頁轉場。

首頁先呈現黑色署名開場與閃動游標，向下捲動時淺色收藏頁覆上；也可點選「探索簡報」或使用 `/#collection` 直接前往收藏。收藏以雙欄作品集同時展示多份簡報，900px 以下使用單欄。第一列直接可見，後續各列隨捲動位置逐漸顯現，完整顯示後保持可見。斜向拼貼與投影片內容保持靜態，啟用減少動態效果時停止游標閃動與開場動效，並直接呈現全部卡片。

開場採冷黑石墨與建築式側光：銀灰署名直接完整顯示，背景以靜態柔光、底部陰影與細顆粒呈現霧面空間。手機使用獨立的光影構圖；沒有套印、背景大字或視差，捲動時僅署名淡出，減少動態效果下停用淡出與游標閃動。

## 啟動

在此根目錄執行，需 Node.js 22.12+：

```sh
npm ci
npm run dev
```

- 首頁：http://localhost:5173/
- Backend Workshop：http://localhost:5173/slides/backend-workshop
- Template：http://localhost:5173/slides/template

正式建置與本機預覽：

```sh
npm run build
npm start
```

從首頁開啟簡報會回到封面；重新整理則恢復目前分頁的頁面與步驟。進度使用 `sessionStorage`，每份簡報獨立保存，各分頁各自操作。

## 操作

| 按鍵 | 功能 |
| --- | --- |
| →／Space | 下一步，完成本頁後換頁 |
| ← | 上一步；頁首回到前頁的完成狀態 |
| Page Down／Page Up | 整頁切換 |
| O | 章節與頁面選單 |
| F | 全螢幕 |
| ? | 操作說明與從頭開始 |
| Esc | 關閉選單 |

控制列有返回首頁入口，閒置三秒後隱藏；移動游標、觸碰畫面或用鍵盤聚焦即可顯示。減少動態效果偏好會停用跨頁轉場，保留講解步驟。

Backend Workshop 的休息頁首次進入會開始十分鐘倒數。倒數按時間戳計算，離開該頁、背景分頁或重新整理均接續；到零停在 00:00。可暫停、繼續、重設，重設後需手動開始。首頁預覽不啟動倒數。

## 新增簡報

詳見 [新增簡報指南](docs/authoring.md) 與 [作者範例](decks/example/deck.tsx)。共用播放程式位於 `src/presentation/`，簡報登錄於 `src/registry.ts`。

[Template](decks/template/README.md) 是首頁公開展示的可複製模板，包含七種頁面版型、主題與動畫示範，也能用來檢查首頁的多簡報捲動呈現。

另外提供四套各五頁的獨立設計：[Editorial](decks/editorial/README.md)（雜誌排版）、[Signal](decks/signal/README.md)（技術介面）、[Prism](decks/prism/README.md)（幾何海報）、[Atlas](decks/atlas/README.md)（數據報告）。播放網址依序為 `/slides/template-editorial`、`/slides/template-signal`、`/slides/template-prism`、`/slides/template-atlas`。每套都有自己的版型、步驟動畫、轉場及複製指南。

Backend Workshop 保留於 `Backend Workhsop/`，其中的 `sources/`、`scripts/`、`docs/` 與 `examples/` 維持教材來源與產生流程。`npm run content` 會更新該簡報的衍生教材及網站字型。

## 驗證

```sh
npm test
npm run test:examples
npm run typecheck
npx playwright install chromium
npm run build:test
npm run test:browser
```

Python 範例驗證需要 Python 3。瀏覽器測試使用獨立的 5274 端口與 `.preview-dist/`，不占用本機開發的 5173；測試建置額外登錄作者範例，正式建置只收錄已登錄的公開簡報。

本次結果與涵蓋範圍見 [網站驗證紀錄](docs/verification.md)。

## 靜態部署

將 `npm run build` 產生的 `dist/` 放到靜態網站服務。網站使用根路徑，主機須先回傳存在的檔案，其餘路徑回退至 `/index.html`，讓 `/slides/<slug>` 可直接開啟及重新整理。

Nginx 範例：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

使用 Netlify／支援 `_redirects` 的靜態服務時，在發布目錄加入：

```text
/* /index.html 200
```

未知路徑與已移除的 `/presenter` 由前端處理。本專案目前提供本機啟動與建置，不包含自動發布。
