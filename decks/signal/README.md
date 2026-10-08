# Signal

播放：`/template-signal`。五頁：cover、architecture、flow、metrics、closing。首頁提供九張不同頁面／步驟的靜態拼貼。

## 設計與動畫

- 字體：Portfolio Code（本機 JetBrains Mono）與 Portfolio TC。
- 頁內動態：SVG 連線 pathLength、節點透明度、日誌分段揭露及示意指標。
- 跨頁轉場：signal-wipe：前進時由左至右擦入，後退反向；兩層同步裁切。

## 修改這份模板

`config.ts` 控制名稱、ID、版本、舞台尺寸、配色、動畫設定與轉場；`slides.tsx` 的頁面陣列提供 ID、標題、步驟數和自由編寫的 React 元件；`deck.tsx` 控制預覽、渲染與頁首頁尾；`styles.css` 定義這一套版型。

每頁可以獨立更換 DOM、SVG、圖片、影片及圖表，也能使用自己的動畫方式。修改 `palette` 更換核心色彩；裝飾色與細節在 CSS。修改舞台比例時，需一併調整固定版型的字級、間距與構圖，播放器會負責整體等比例縮放。

## 複製成新簡報

1. 複製此目錄到 `decks/my-talk/`，保留同層的 `decks/shared/`。
2. 將設定中的 ID 改成唯一的 `my-talk`，更新名稱、描述，並將 CSS 的 `[data-deck="template-signal"]` 全部改成 `[data-deck="my-talk"]`。
3. 編輯頁面元件與頁面陣列，更新 `previews` 引用。保留此模板的 `sg-` class 可正常隔離；新增 CSS keyframes 請使用新 ID 作為前綴。
4. 在 `src/registry.ts` 登錄新 ID 與名稱，使用 `import('../decks/my-talk/deck').then(module => module.signalDeck)`。
5. 開啟 `/my-talk?start=1`。頁面或步驟結構變更時遞增 `version`。

共用的 `Reveal`、`isStill`、`canInteract` 位於 `decks/shared/authoring.tsx`，只處理動態效果與互動條件，不要求共用版型。可修改各次 `Reveal` 的 `at`、`effect`、`duration`，也可直接使用 Motion／CSS／Web Animations API。步驟狀態由 `runtime.step` 算出，以支援退回、跳頁與重新整理。

預覽、離場快照與減少動態效果模式必須直接呈現指定狀態；請使用 `isStill(runtime)` 將動畫時長設為零。具有副作用的動作、影音與計時只能在目前啟用的播放頁執行；按鈕由 `canInteract(runtime)` 控制。字型定義使用現有本機資源，授權檔位於 `public/fonts/`。

更多 Provider、Controls、Overlay 等擴充方式見 [新增簡報指南](../../docs/authoring.md)。驗收至少包括步驟前進／退回、快速換頁、重新整理、手機比例、靜態預覽及減少動態效果。
