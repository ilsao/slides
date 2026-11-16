# System Is All You Need

42 頁、101 個手動狀態，約 30 分鐘的繁體中文 ML Systems 演講。

在專案根目錄執行 `npm run dev`，開啟 `/system-is-all-you-need?start=1`。→ / Space 推進，← 返回；Page Down / Page Up 切頁，O 開啟章節，F 全螢幕。

## 畫面與講述

技術頁以一個主要圖解為焦點，保留必要的名稱、數字、軸及公式，移除標題下的灰色敘述；需要關係的地方加入局部參照，並不限制每頁只能有一張圖。例如 attention 附選定 query 的權重、SM 附 GPU 定位、tile 附 HBM 來源、KV 配置保留前一個 block。完整解說、公式、作用域與限制保存在 `SPEAKER_NOTES.md`。Compute/Memory、Prefill/Decode、KV 切塊/table/physical bank 已分頁，其餘複雜流程透過鏡頭與手動狀態逐段聚焦。

保留六張 NASA Webb 高清宇宙章節影像，以及 Cosmic Cliffs 封面、Unsplash 海岸極光結語。圖片都在本機；最後一頁提供來源與署名。

普通進場依序為標題、主圖、局部標籤，參考Apple的snappy與無回彈示範，以短位移和清楚的減速建立層次；slide 根節點及主圖始終不透明。前頁在 CSS 與轉場程式中都立即排除繪製，不複製前頁，不套全頁遮罩。矩陣與 tile、主圖與縮圖中的 P7/P2 由實際可見位置及速度接續；token 從右側取樣口繞過既有文字落位，roofline 沿折線移動。支援快速反向、中斷續接與 reduced motion。

## 編輯與檢查

`deck.tsx` 管理頁序、每個狀態的短標題與章節。`FocusedScenes.tsx`、`FocusedHardware.tsx`、`FocusedAttention.tsx`、`FocusedMemory.tsx` 是目前技術畫面；共同 SVG 元件在 `FocusPrimitives.tsx`，樣式在 `focus.css`。`BatchMorph.tsx` 保留單一時間軸的排程動態。`morph.ts` 負責目的頁進場、物件身份與專屬路徑。既有舊圖解模組仍保留，但放映入口使用 Focused 模組。

開發時可用 `/decks/System-Is-All-You-Need/review.html?steps=1` 檢視全部狀態，或 `?slide=softmax&step=2` 定位。此 authoring review 不包含於正式 Vite 建置；正式放映入口會正常建置。

`TEACHING_REFERENCES.md` 記錄先檢視的網上教學圖、重畫方式與頁面對照。`SOURCES.md` 保存第一手資料與算例假設，`REVIEW.md` 記錄畫面取捨，`VALIDATION.md` 記錄實際驗證結果。

最新開場與換頁的具體Apple參考、時間點及採用方式見 `APPLE_MOTION_REFERENCES.md`。Section圖片動畫保留，文字採快速依序揭示。

Version 11統一所有頁面的換頁入口，共享物件頁也套用通用進場。一般技術頁標題以詞組快速揭示，並逐個換頁檢查標題與主圖的實際動畫覆蓋。
