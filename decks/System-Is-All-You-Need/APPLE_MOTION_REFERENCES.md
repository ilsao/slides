# Apple 動效參考與採用方式

2026-11-16。先閱讀下列具體示範，再修改換頁、Section文字與02–05開場。這是依原則重做的網頁動效，沒有宣稱使用Apple原生框架。

| 具體參考 | 採用方式 |
| --- | --- |
| [WWDC23 Animate with springs](https://developer.apple.com/videos/play/wwdc2023/10158/) 18:15：`.snappy(duration: 0.4)` | Section詞組420ms揭示、65ms間隔；短而有明確落點，不逐字拖長 |
| 同場20:34／21:07：無bounce與小bounce對照 | 普通頁主圖改為56px、700ms、critical damping，移除原本96px位移及尺度起伏；標題32px、500ms，保留主次與平順煞停 |
| [WWDC18 Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)：Music Now Playing點按展開100% damping、滑動關閉80% damping | 換頁由按鍵觸發，不額外加反覆回彈；既有共享物件位置／速度接續保留 |
| [Keynote Build In / Delivery](https://support.apple.com/guide/keynote/animate-objects-onto-and-off-a-slide-tan72234bb6/mac) | 對有語意的詞組與行排序，使用遮罩內位移，不把整頁一起淡入 |

## 開場分鏡

- 02：2022作小型時間錨點；ChatGPT大字由遮罩內進場，What makes us human?快速按詞組揭示。
- 03：年份與主標維持相同位置；轉為深色，Plan／Build／Run相隔110ms出現，單一動點完成一次接力。
- 04：延續深色；問題分兩行，第二行晚150ms，讓重點落在「還有價值嗎？」。
- 05：先停在Model；手動推進後「+ System」與四層架構依序展開，使用輕微透視交代層級。

Section照片動畫保持原參數：1.055×→1×、1150ms、mass 2.1。只修改文字，沒有更換圖片、裁切或圖片動畫。

每頁標題下的灰色敘述已從DOM移除。圖解內有助理解的名稱、軸、公式與標籤保留。

## Version 11：全頁套用修復

原先shared-objects分支未呼叫通用pageLayers，且一般技術標題沒有data-reveal。現已移除分支內的獨立進場實作：所有頁面先進入相同pageLayers，再處理共享物件。先啟動父層進場才量測FLIP，讓共享物件首幀仍對齊原本可見位置。

一般技術頁、References、ML Systems標題採420ms遮罩內揭示，詞組間隔55ms；封面與結語按行揭示。開場與Section專屬節奏保留，Section照片動畫不變。瀏覽器回歸對全部82個正反邊界逐一斷言：技術頁的scene自身有進場animation，且每個標題詞組都有reveal animation，避免只檢查「頁面上有某個動畫」而漏掉實際未套用的頁面。
