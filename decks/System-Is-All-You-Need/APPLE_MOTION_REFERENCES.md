# Apple 動效參考與採用方式

## Version 20：快速入軌、一圈、減速

本次先查閱 [WWDC23 Wind your way through advanced animations in SwiftUI，9:48 Keyframes](https://developer.apple.com/videos/play/wwdc2023/10157/?time=588) 的 rotation／translation 分軌編排及跨 keyframe 速度連續性，再以 [Animate with springs，1:36 Why springs](https://developer.apple.com/videos/play/wwdc2023/10158/?time=96) 的位置與速度連續性示範交叉檢查。這裡採用分段敘事與接續原則；軌道構圖與時間是本投影片的設計。

- 每個圖標 210ms 切線飛入，間隔 240ms；同時最多一個正在飛入。
- 第一個入軌（330ms）就開始計一圈；快速軌道 1.92 秒一圈，2250ms 開始降速。最後一個在 2010ms 入軌，所以只再等 240ms。
- 用 1100ms 將角速度平滑降到每圈 12 秒。速度以 smoothstep 變化，角度是速度的積分，兩端的角加速度皆為零。整圈共同時鐘保留各圖標間距；反向旋轉標籤保持正向。
- 有限的旋轉軌道在終點直接交接給相同相位與速度的 CSS 持續動畫，取消效果不會跳位。切線飛入保留位置、速度及向心加速度的接續。

## Version 13：Draw On 與章節尾頁淡出

2026-11-16。先查閱[WWDC25 What’s new in SF Symbols 7，2:19 Draw](https://developer.apple.com/videos/play/wwdc2025/337/?time=139)，再改寫圖解進場。選擇Whole Symbol的共同起終節奏：圖形固定在原位，既有輪廓以420ms描繪；填色晚110ms、持續200ms；標籤晚180ms、持續160ms。頁面主圖從70ms起動。大於30×24的無描邊矩陣格先用同色細輪廓描繪，再填實，輪廓自行消退；微小晶片紋理不套這種額外描邊。

這是SVG／HTML的視覺改寫，不是原生SF Symbols renderer。移除scene父層的上下／左右位移與縮放；新build也不再translateY。HTML時間軸以固定位置的面展開。新P2以相同Draw On節奏形成，移除.94×縮放。KV每格保留固定build身份，written／empty狀態替換只短暫調整墨色，不移動格子。真正選定位置的鏡頭、token資料路徑與共享物件接續保留；這也符合[同場6:02 Magic Replace](https://developer.apple.com/videos/play/wwdc2025/337/?time=362)保留相同外框、只更新差異部分的示範。

依本次明確要求，六個章節尾頁→星空頁是來源繪製的例外：stage→request-title、generation→gpu-title、hierarchy→batch-title、continuous→flash-title、flash-result→paged-title、sharing→systems-title。來源持續淡出240ms，之後opacity=0且visibility=hidden；沒有靜態停留。來源只用切換前讀到的幾何、墨色與文字pose，讓中途token／描繪不會在淡出首幀跳到完成狀態。星空圖片沿用原動畫；新章節標題到240ms才啟動，避免前後兩頁標題重疊。其餘換頁與反向仍立即隱藏來源；reduced motion直接顯示終點。

以下為version 12與更早版本的參考歷史；垂直主圖進場與P2縮放已由上方Draw On取代。

---

2026-11-16，version 12。先閱讀下列具體示範，再修改換頁、Section文字與02–05開場。這是依原則重做的網頁動效，沒有宣稱使用Apple原生框架。

| 具體參考 | 採用方式 |
| --- | --- |
| [WWDC24 Enhance your UI animations and transitions](https://developer.apple.com/videos/play/wwdc2024/10145/?time=94) 1:34–2:07：Zoom transition，取代 trailing-edge slide | 章節目的影像平面由0.955×展開為滿版，720ms無回彈；圓角28px收至0。一般主圖取消側向推入，改24px垂直收束／640ms。這裡前後圖意不同，沒有假造共享來源；採用縮放建立空間的原則 |
| [WWDC23 Animate with springs](https://developer.apple.com/videos/play/wwdc2023/10158/) 18:15：`.snappy(duration: 0.4)`；20:34／21:07：無bounce與小bounce對照 | 章節標題整組進場，120ms後啟動，18px垂直、560ms無回彈，前180ms完成文字顯現；兩行共用一條時間軸，不拆詞、不逐行跳出 |
| [WWDC18 Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)：Music Now Playing點按展開100% damping、滑動關閉80% damping | 換頁由按鍵觸發，不額外加反覆回彈；既有共享物件位置／速度接續保留 |
| [Keynote Build In / Delivery](https://support.apple.com/guide/keynote/animate-objects-onto-and-off-a-slide-tan72234bb6/mac) | 技術標題與開場對有語意的詞組與行排序；章節改用整組標題，不把整頁一起淡入 |

## 開場分鏡

- 02：2022作小型時間錨點；ChatGPT大字由遮罩內進場，What makes us human?快速按詞組揭示。
- 03：年份與主標維持相同位置；轉為深色，Plan／Build／Run相隔110ms出現，單一動點完成一次接力。
- 04：延續深色；問題分兩行，第二行晚150ms，讓重點落在「還有價值嗎？」。
- 05：先停在Model；手動推進後「+ System」與四層架構依序展開，使用輕微透視交代層級。

Section內層照片推鏡保持原參數：1.055×→1×、1150ms、mass 2.1。外層只負責「進入章節」的720ms展開，與內層分開；沒有更換圖片或最終裁切。標題獨立於影像平面，兩行保持同一構圖，不受圖片縮放牽動。

每頁標題下的灰色敘述已從DOM移除。圖解內有助理解的名稱、軸、公式與標籤保留。

完成後另以[WWDC24 Create custom visual effects with SwiftUI，12:49 Text transitions](https://developer.apple.com/videos/play/wwdc2024/10151/?time=769)交叉檢視文字手感。其示範結合快速opacity ramp與y軸spring；本稿採用這兩個構成，但按本次回饋把整個章節標題視為一組，不採其逐行／逐glyph延遲，也沒有增加文字blur。新配置的P2同樣改為以(704,255)為中心由.94×展開，移除從右側虛構free pool飛入的路徑；真正資料流、選定物件放大與共享物件的實際位置接續仍保留。

## Version 11：全頁套用修復

此段為上一版歷史；version 12保留全頁入口與共享物件首幀量測順序，並以上方的垂直進場及章節整組文字取代橫向推入與章節分詞。

原先shared-objects分支未呼叫通用pageLayers，且一般技術標題沒有data-reveal。現已移除分支內的獨立進場實作：所有頁面先進入相同pageLayers，再處理共享物件。先啟動父層進場才量測FLIP，讓共享物件首幀仍對齊原本可見位置。

一般技術頁、References、ML Systems標題採420ms遮罩內揭示，詞組間隔55ms；封面與結語按行揭示。開場與Section專屬節奏保留，Section照片動畫不變。瀏覽器回歸對全部82個正反邊界逐一斷言：技術頁的scene自身有進場animation，且每個標題詞組都有reveal animation，避免只檢查「頁面上有某個動畫」而漏掉實際未套用的頁面。
