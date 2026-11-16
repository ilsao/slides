# System Is All You Need

38 頁、約 30 分鐘的繁體中文技術演講。內容涵蓋 LLM request、GPU architecture、Continuous Batching、FlashAttention、PagedAttention 與完整 serving 流程。96 個可重現的畫面狀態，以機制圖解與可驗算的例子配合口述。

在專案根目錄執行 `npm run dev`，開啟 `/system-is-all-you-need?start=1`。已登錄至首頁。→ / Space 推進步驟，← 返回；Page Down / Page Up 切換整頁，O 開啟章節，F 全螢幕。操作說明提供講者備註連結。

`SPEAKER_NOTES.md` 包含逐頁時間、講述提示與轉場。`SOURCES.md` 保存第一手參考資料、算例假設與技術界線。`sources/original.md` 是使用者提供的原始內容。

本機開發時可開啟 `/decks/System-Is-All-You-Need/review.html` 查看全套縮圖，或加 `?steps=1` 檢視全部 96 個靜態狀態。可切換逐頁總覽、所有步驟，點擊縮圖放大，並以前後步驟逐一檢查；`?slide=softmax&step=2` 可直達指定狀態。這個 authoring review 入口不包含於正式 Vite 單頁網站建置；正式放映入口正常包含於建置。

## 視覺與動畫

本版以高級研討會的簡約構圖為方向：NASA Webb Cosmic Cliffs 作滿版封面、Unsplash 海岸極光作結語（均由原圖縮製為 4096px），六個技術章節採 NASA Webb 高清宇宙影像開場，技術頁使用細線工程圖。來源與使用規範列於最後一頁的第二步及 `SOURCES.md`。標題清楚標示主題，圖內補上輸入、輸出、數量、作用域及完成條件；技術限制和背景保留在講者備註。

三組核心圖解維持物件身份：Static → Continuous Batching 保留同一個 t = 10，先交接排程政策，下一步才讓 D 從佇列移入 A 的空槽；Standard attention → Tiling 讓矩陣與記憶體區域縮合為片上 tiles；KV cache → 容量 → 碎片 → 分頁 → 成長 → 共享，持續追蹤相同 KV blocks。跨頁與同頁步進使用 FLIP 位移／縮放，文字獨立定位，避免逐幀改動寬高。

- Palette：Carbon `#080b10`、Paper `#f6f6f4`、Graphite `#17191c`、Fog `#777d87`、Signal `#376bba`。
- 字體：Helvetica Neue / Helvetica / Arial；繁中採 PingFang TC 與內附思源黑體備援，無網路字體依賴。
- 舞台：1600 × 900，沿用專案播放器等比例縮放。
- 動畫：每個換頁都有空間動效：新頁背景從第一幀完整顯示；標題在0ms開始，主圖解在110ms接上，標註與細節從250ms起分批收尾；共享物件沿 FLIP 軌跡變形。前頁立即隱藏，不複製前頁底圖、不使用全頁遮罩；無 blur 與無限循環。
- `still` / `prefers-reduced-motion` 直接顯示當前狀態。首頁預覽不啟動計時器或播放副作用。

## 檔案

`deck.tsx` 管理頁序、文案、章節與照片署名；`morph.ts` 處理跨頁物件變形。`BatchMorph.tsx`、`AttentionMorph.tsx`、`KvMorph.tsx` 分別負責排程、attention 與 KV 的連續圖解。`GpuBatch.tsx` 保留 GPU 架構與 batching 引入，`Scenes.tsx` 負責請求、Roofline、online softmax 與整合流程。照片位於 `assets/`；各模組樣式使用 `sia-` 前綴。


## 本輪審查

`REVIEW.md` 記錄敘事、技術、視覺、動效與操作的問題及改進。`VALIDATION.md` 記錄實際執行的檢查範圍。Online softmax 現在以三組數字展示 m／ℓ／o 同步更新；KV 容量圖對應 16 個 requests，並補上 Q 入口、block 索引、引用與回收條件。完整流程回扣同一個 prompt，串起 tokenization、排程、prefill、decode、streaming 與資源釋放。

首頁封面採九宮格投影片拼貼，第一頁位於正中央、周圍八張內容填滿展示區。`Photography.tsx` 在放映前預先解碼六張宇宙章節圖與兩張首尾圖片；首頁預覽不啟用此播放器流程。

## 動效與解說修訂（2026-11-16）

08 展示三個 heads 的 causal maps、human 列的權重與多組連線；09 每輪使用不同機率，取樣 token 移向 streaming output。10 的 SM 採縮放展開，12 的記憶體階層改為金字塔。14 先走過 t=0/5/10，再聚焦空轉；15 保留 t=10 交接政策，分步補入 D、E。18 的點依 roofline 線段方程計算，19 逐列顯示分數與後續讀取。

21 的五步從「分塊後如何維持共同分母」開始，示範三個 tiles 的 m/ℓ/o、重新縮放與最後正規化。26 的三種浪費逐列累加，27 依序追蹤 L0→P7、L1→P2、L2→P10。28 先填滿 P7，再取出 P2、更新 table、寫入第17個 token；29 保留 P7、P2 的位置、內容與大小。30 按 Tokenize、Schedule、Prefill、Decode、Complete 五次推進。

六張章節影像與署名由 `ChapterPhotography.tsx` 管理。新增 request／GPU／batching／systems 四張章節頁，既有 FlashAttention／PagedAttention 章節頁更新為宇宙影像；頁碼順延，內容仍可由章節面板直接定位。
