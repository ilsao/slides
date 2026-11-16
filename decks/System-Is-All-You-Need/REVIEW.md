# 全套審查與改進

2026-11-16（Asia/Taipei）。以使用者提供的原稿與 30 分鐘大綱為準，保留 34 頁、84 個可手動前進／倒退的講解狀態。

## 敘事與大綱對齊

| 原大綱 | 頁面 | 講述時間 | 本輪補強 |
| --- | --- | --- | --- |
| 引言：AI 的舞台不只有模型 | 01–05 | 2 分鐘 | 問題明確回到資工學生的學習價值；架構層說明各自責任，預告四段技術路線 |
| 一次 LLM 請求 | 06–09 | 3 分鐘 | 保持同一個 prompt；文字、IDs、embeddings、causal attention、取樣與 EOS 接續呈現 |
| GPU Architecture | 10–12 | 2 分鐘 | 硬體層次、thread/block/warp、記憶體作用域與資料搬移成本 |
| Continuous Batching | 13–15 | 5 分鐘 | 從共用模型權重引出 batching；同一 t=10 比較等待與補位，逐輪顯示存活請求 |
| FlashAttention | 16–22 | 9 分鐘 | 瓶頸、Roofline、HBM 中間矩陣、tiling、online softmax、改善與保留的計算量 |
| PagedAttention | 23–29 | 7 分鐘 | KV 重用、容量算例、三種浪費、block table、按需成長、前綴共享與回收條件 |
| A Systems Perspective | 30–31 | 1 分鐘 | 回到相同 prompt，串起三個系統技術與完整生命週期 |
| 結語 | 32–33 | 1 分鐘 | 三個工程問題對應三種機制，回扣計組／OS／虛擬記憶體的價值 |
| 來源與影像署名 | 34 | Q&A 延伸 | 第一手技術來源與NASA Webb 與 Unsplash 影像的來源、作者及使用規範 |

## 多角度發現與處理

### 觀眾理解與資訊層次

原版部分頁名過於籠統，例如「2 GiB」「32 threads」「Less I/O」，容易把數字或結論當成整頁主題。改成 KV cache 的容量、Thread / Warp / Block、FlashAttention 的取捨，讓觀眾先知道正在理解哪個問題。必要的作用域、輸入與輸出留在圖內，完整背景與技術界線放入逐頁講者備註。

原版結語的重複小格圖缺少資訊，改為「誰先算／資料怎麼搬／記憶體怎麼放」，各自接上技術與具體機制，再揭露對應課程。

### 技術正確性

- Tokenization 加入 embeddings；明確說明切分、IDs、向量與 attention 關係皆為教學示意。
- 自回歸生成的回饋線從選出的 token 回到 context，並區分 prefill 的第一個輸出、後續 decode 與不顯示為回答文字的 EOS。
- Roofline 補上算術強度單位與 ridge point，使用 SVG 原生下標，避免混用 Unicode 上下標造成公式跳動。
- Online softmax 原先每步只點亮一種狀態，容易誤導為分別更新。改成每個 tile 同時更新 m、ℓ、o，顯示可驗算的純量範例與最終正規化。
- FlashAttention 保留最後一個 tile，呈現完整累積與寫回路徑；保留 O(N²d)、exact attention 和 Q/K/V 仍需 HBM 存取的界線。
- KV cache 補目前 Q 的入口；容量例圖實際對應 16 個 requests；新 block 接續 token 16–31，free pool 隨配置遞減。
- Prefix sharing 標出 physical block 的邊界、引用數與回收條件；COW 是對共享未滿 block 寫入的條件說明，不把私有續寫誤稱為 COW 動畫。

### 圖解與視覺

維持單一大型工程圖的構圖。藍色表示當前資料、工作或引用狀態，灰色表示未啟用、可配置或背景結構；不同意義在相關圖內標明。重整生成迴圈、decode 表格欄名、KV 圖例、箭頭端點與中間狀態，讓物件的位置可以被解讀。

NASA Webb Cosmic Cliffs 滿版封面與 Oskar Kadaksoo / Unsplash 海岸極光結語形成首尾呼應。兩張原圖分別為 14575 × 8441、7872 × 5251，皆縮製為 4096px 寬，未放大補畫質。照片只用在敘事首尾；技術頁保持清楚的資訊密度。兩張圖都儲存在本機並提供署名。

### 動畫與講者操作

保留跨頁共享物件，讓 batching 的請求、attention 的 tiles、KV blocks 延續身份。修正章節圖入口覆蓋原有透視／旋轉的跳動、雙層淡出露出黑底，以及中斷時忽略祖先透明度造成的變亮。縮短 GPU reveal 與 attention 寫回線的延遲，使圖解在同一節奏內完成。

維持手動步進、不自動換頁；支援反向、快速打斷、章節跳轉與減少動態效果。review 入口加入逐頁／所有步驟切換、單狀態放大與前後步驟連結，方便排練時定位問題。

## 使用與驗證界線

逐頁講述與轉場見 `SPEAKER_NOTES.md`，技術來源和數字假設見 `SOURCES.md`。實際測試範圍與結果見 `VALIDATION.md`。

投影片仍以 16:9 投影為主要用途；小螢幕採等比例縮放。排程圖的 iterations、Roofline 點位與記憶體示意不是效能 benchmark。這次驗證集中在本機 Chrome，沒有將功能通過推論為所有瀏覽器或所有裝置的 FPS 保證。
