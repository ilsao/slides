# 教學圖參考與重畫對照

2026-11-16。先閱讀教學、檢視原圖／動圖，再依本場的範例和版面重畫 SVG。沒有將第三方圖像貼進投影片；原始研究與完整數值依據仍見 SOURCES.md。

| 教學參考 | 借鑑的教學結構 | 對應改圖 |
| --- | --- | --- |
| [3Blue1Brown — Attention, step-by-step](https://www.3blue1brown.com/lessons/attention/) | 從具體詞句、Q/K 比對進入 attention pattern，再按權重整合 V | 08 保留文字與 ID 的對應；09 heatmap 標示真實 tokens／位置、human query、權重與 V；數值仍是教學示例 |
| [Hugging Face — Continuous batching from first principles](https://huggingface.co/blog/continuous_batching) | 把 token、attention、KV cache、prefill/decode 與動態 batch 串成資料流 | 07 Client→Queue→Scheduler→GPU；16 各 request 的下一 token；28、37–39 歷史 KV、當前輸入與輸出 |
| [Hugging Face — How caching works](https://huggingface.co/docs/transformers/main/en/cache_explanation) | 分清 cached K/V、當前 token 的 K/V、當前 Q 與下一個輸出 | 28 逐欄對應 token，新增 Our 的 K/V，再以 Qₜ 和完整 cache 算出 shared；38–39 延續相同位置與顏色 |
| [NVIDIA — CUDA Programming Model](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html) / [Hardware multithreading](https://docs.nvidia.com/cuda/cuda-programming-guide/03-advanced/advanced-kernel-programming.html) | Grid 包含 blocks；block 分成 warps；warp 包含32 threads，維持包含關係和選定位置 | 13 加入 Grid／Block 的外框、Block 4 定位、兩個 warp 帶與32個 thread 索引；14 保留金字塔並釐清容量與延遲方向 |
| [NVIDIA — GPU Performance Background](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html) / [Ampere architecture](https://developer.nvidia.com/blog/nvidia-ampere-architecture-in-depth/) | 區分 GPU、SM、運算管線與記憶體；資料供給與運算吞吐共同決定瓶頸 | 12 在 SM 內區分 schedulers、CUDA cores、Tensor Cores、registers、shared/L1；20–21 從 HBM 搬到 SM，明示運算滿載或等待資料 |
| [Tri Dao / Stanford CRFM — FlashAttention-2](https://crfm.stanford.edu/2023/07/17/flash2.html) | 以 Q、K tiles、scores、softmax、V、輸出之間的箭頭，區分 HBM 儲存與 SRAM 計算；新塊須重新縮放舊摘要 | 23 完整 scores 的產生／寫入／讀回；24 固定 Qᵢ、讀入 Kⱼ/Vⱼ、片上 scores 與摘要、最後寫回 Oᵢ；25 補當前 scores、V、舊累積×α＋新貢獻 |
| [vLLM — PagedAttention introduction](https://vllm-project.github.io/2023/06/20/vllm.html) | 將 logical blocks、block table、physical blocks 放在可對照的位置；逐步配置與共用前綴 | 30 補實際使用／預留／重複前綴標籤；31 標出每塊 token 範圍；33 table 與分散的實體記憶體連線；34–35 延續 P7/P2 身份、logical L0 引用及 refcount |

## 動效參考

[Apple WWDC23 — Animate with springs](https://developer.apple.com/videos/play/wwdc2023/10158/) 說明位置、速度連續，以及不同 damping 對物體感受的影響。本版以這些原則設計自己的運動參數，並非照搬 Apple 的預設動畫。

- 標題先起動，主圖稍後以較大位移進場並緩慢煞停；細節較輕，避免全體同速漂移。
- 主圖採阻尼響應，約96px水平位移、8px垂直位移、1.2%尺度變化；小於1%的位置超越用於收束，沒有反覆彈跳。
- 矩陣、camera、KV blocks 在中斷取樣後接續位置與速度。切換時取樣前8ms的transform姿勢，動畫本身交由瀏覽器播放，不逐幀讀寫DOM。
- 前頁立即排除繪製；背景、slide root、主圖始終不透明。章節照片以較慢的推鏡呼應主題，不用全頁淡入淡出。

研究用截圖／原圖URL清單及驗證輸出位於已忽略的 `output/playwright/sia-grounded/`。GPU、token 切分、heatmap、block 大小與 tile 形狀均為教學示意；不表示某一實際模型或 GPU 的精確配置。
