# System Is All You Need

43 頁、108 個手動狀態，約 30 分鐘的繁體中文 ML Systems 演講。

在專案根目錄執行 `npm run dev`，開啟 `/system-is-all-you-need?start=1`。→ / Space 推進，← 返回；Page Down / Page Up 切頁，O 開啟章節，F 全螢幕。

## 畫面與講述

技術頁以一個主要圖解為焦點，保留必要的名稱、數字、軸及公式，移除標題下的灰色敘述；需要關係的地方加入局部參照，並不限制每頁只能有一張圖。例如 attention 附選定 query 的權重、SM 附 GPU 定位、tile 附 HBM 來源、KV 配置保留前一個 block。完整解說、公式、作用域與限制保存在 `SPEAKER_NOTES.md`。Compute/Memory、Prefill/Decode、KV 切塊/table/physical bank 已分頁，其餘複雜流程透過鏡頭與手動狀態逐段聚焦。

保留七張 NASA 高清宇宙章節影像，以及 Cosmic Cliffs 封面、Unsplash 海岸極光結語。圖片都在本機；最後一頁提供來源與署名。

圖解參考Apple SF Symbols 7的Draw On：固定在原位，輪廓先畫出、填色與標籤跟上；取消整張圖的上下／左右浮入。slide根節點及scene始終不透明。七組章節交接前進至星空章節時，來源淡出240ms後完全隱藏，新章節標題此時才啟動；其餘來源立即排除繪製，不複製前頁，不套全頁遮罩。矩陣與 tile、主圖與縮圖中的 P7/P2 由實際可見位置及速度接續；token 從右側取樣口繞過既有文字落位，roofline 沿折線移動。支援快速反向、中斷續接與 reduced motion。

## 編輯與檢查

`deck.tsx` 管理頁序、每個狀態的短標題與章節。`FocusedScenes.tsx`、`FocusedHardware.tsx`、`FocusedAttention.tsx`、`FocusedMemory.tsx` 是目前技術畫面；共同 SVG 元件在 `FocusPrimitives.tsx`，樣式在 `focus.css`。`BatchMorph.tsx` 保留單一時間軸的排程動態。`morph.ts` 負責目的頁進場、物件身份與專屬路徑。既有舊圖解模組仍保留，但放映入口使用 Focused 模組。

開發時可用 `/decks/System-Is-All-You-Need/review.html?steps=1` 檢視全部狀態，或 `?slide=softmax&step=2` 定位。此 authoring review 不包含於正式 Vite 建置；正式放映入口會正常建置。

`TEACHING_REFERENCES.md` 記錄先檢視的網上教學圖、重畫方式與頁面對照。`SOURCES.md` 保存第一手資料與算例假設，`REVIEW.md` 記錄畫面取捨，`VALIDATION.md` 記錄實際驗證結果。

最新開場與換頁的具體Apple參考、時間點及採用方式見 `APPLE_MOTION_REFERENCES.md`。Version 13採用WWDC25 Draw On／Whole Symbol重做圖解與新配置P2的進場。章節圖片的展開與推鏡保留；章節尾頁新增240ms淡出，標題交接不重疊。所有頁共用同一入口，並逐個正反換頁檢查圖解、標題及來源可見時間。

Version 14：開場、agent生態軌道、NASA Section 2、prompt傳送、矩陣、attention與取樣，以及GPU／batching／瓶頸圖解重做。逐項對照與參考見 `OPENING_V14.md`。

Version 15修復動畫清理後的白線、重新選定五個同向環繞圖標、attention語意、取樣長條動畫、中心overview接續、batching共用時間與E補位順序，以及快慢持續資料流；見REVISION_V15.md。

Version 16：p2 改由面板灰色邊緣向兩側展開，移除獨立白線；p3 擴充為八個圖標、同向同速 14 秒環繞；Continuous Batching 改用單一請求矩形，修復 D 從零開始填充時的跳切。見 `REVISION_V16.md`。

Version 17：p2 → p3 的背景連續轉色，Agents 圖標從右上方沿順時針螺旋飛入，再連續接上既有軌道。見 `REVISION_V17.md`。

Version 18：Agents 改為每次一個從右上方沿切線入軌，420ms 飛行／480ms 間隔；接入後維持相同轉速，不再減速。見 `REVISION_V18.md`。

Version 19：同一條入場路徑整體放慢至原速度的 2/3：630ms 飛行、720ms 間隔、每圈 5.76 秒。逐一入場與切線接續保留。

Version 20：依最新回饋改為 210ms 快速逐一入軌，從第一個入軌開始計一圈，最後一個到齊後 240ms 開始平順降速，最後維持每圈 12 秒。具體 Apple 參考與時序見 `APPLE_MOTION_REFERENCES.md`。
