# System Is All You Need — 來源與技術說明

內容以使用者提供的繁體中文講稿為基礎整理。下列第一手資料用於核實技術概念；核查日期：2026-11-16（Asia/Taipei）。簡報中的排程、記憶體及 Roofline 圖為教學示意，不是實測 benchmark。

## 簡報上的四組延伸閱讀

1. **NVIDIA — GPU architecture / CUDA / performance**
   - [CUDA Programming Guide — Programming Model](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html)
   - [GPU Performance Background User’s Guide](https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html)
   - [Mastering LLM Techniques: Inference Optimization](https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/)
2. **Orca — Iteration-level scheduling**
   - Gyeong-In Yu et al., *Orca: A Distributed Serving System for Transformer-Based Generative Models*, OSDI 2022.
   - [USENIX 論文與演講頁](https://www.usenix.org/conference/osdi22/presentation/yu)
3. **FlashAttention — IO-aware exact attention**
   - Tri Dao et al., *FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness*, 2022.
   - [arXiv:2205.14135](https://arxiv.org/abs/2205.14135)
4. **PagedAttention — KV cache memory management**
   - Woosuk Kwon et al., *Efficient Memory Management for Large Language Model Serving with PagedAttention*, SOSP 2023.
   - [arXiv:2309.06180](https://arxiv.org/abs/2309.06180)
   - [全文 HTML](https://arxiv.org/html/2309.06180v1)

## 逐段對應

| 頁面 | 概念 | 主要依據 |
|---|---|---|
| 07–10、34–35 | Prompt processing、prefill、decode、KV reuse、batching | NVIDIA Inference Optimization；PagedAttention §2 |
| 12–14 | SM、thread/block/grid、warp、register/shared memory/L1/L2/HBM | CUDA Programming Model；GPU Performance Background |
| 16–18 | Request batching、iteration-level scheduling、動態補入請求 | Orca；NVIDIA Inference Optimization |
| 20–21 | Compute／memory limitations、arithmetic intensity、效能上限 | GPU Performance Background §4 |
| 22–25 | N×N 中間矩陣、tiling、online softmax、exact attention、HBM I/O | FlashAttention |
| 27–32 | KV cache、碎片、block table、按需配置、sharing／copy-on-write | PagedAttention §2–4 |
| 36 | 三種技術的角色與互補關係 | 根據上述論文與文件的教學整理 |

## KV cache 算例：2 GiB／request

第 28 頁採**假設性 MHA 模型**，不是實際產品或特定模型的容量宣稱。公式為每個序列的 K/V 張量儲存量：

```text
M_KV = 2 × L × N × H_kv × d_h × b

L     = 32 layers
N     = 4,096 cached tokens
H_kv  = 32 KV heads
d_h   = 128 elements/head
b     = 2 bytes/element (BF16)

每 token：2 × 32 × 32 × 128 × 2 = 524,288 bytes = 512 KiB
每 request：4,096 × 512 KiB = 2,147,483,648 bytes = 2 GiB
16 requests：16 × 2 GiB = 32 GiB
```

- 第一個 `2` 代表 Key 與 Value；`b = 2` 是每個 BF16 元素的 bytes。
- `N` 是目前快取的總 token 數，可包含 prompt 與已生成 tokens，不是只計輸出。
- 假設 16 個 requests 都各有 4,096 cached tokens，且沒有 prefix sharing、KV 量化／壓縮或跨 GPU 分片。
- 不含模型權重、activations、allocator／block table metadata、對齊與未填滿 block 等額外空間。
- GQA／MQA 的 KV heads 較少，不能把此 MHA 例子的結果直接套用。採其他 dtype、sliding-window 或其他注意力設計時，也要重新計算。
- GiB = 2³⁰ bytes，KiB = 2¹⁰ bytes；刻意不用十進位 GB／KB 混稱。

## 原稿的精確性修訂與圖解範圍

### GPU 與 Roofline

- 「32 threads = 1 warp」採 NVIDIA CUDA 範圍；SM、CUDA Core、Tensor Core 也屬此硬體語境。
- 每個 block 在一個 SM 上執行；SM 可能同時容納多個 blocks。Requests、threads 與實體運算單元沒有一對一對應。
- Shared memory 與 L1 在多代 NVIDIA GPU 上共用可配置片上資源；層級圖表達 locality 與容量取捨，不是每筆資料的強制逐層流向。
- 原稿的「memory-bound 時升級 GPU 通常不會顯著提升」改為「若只提高 FLOPS、沒有改善頻寬，幫助有限」。頻寬更高的裝置仍可加速 memory-bound 工作。
- Compute-bound 的改善不只減少 FLOPs，也可能來自更高效的 kernel、Tensor Core 使用、精度選擇與利用率。
- Roofline `P ≤ min(P_peak, B × I)` 描述簡化上限；實際效能也受 launch latency、occupancy、指令效率、通訊等影響。示意曲線與資料點不代表指定 GPU 的測量結果。

### Tokenization 與生成

- Token 不等於字或詞；示例切分、IDs 與 attention 連線不是實際 tokenizer／模型的量測輸出。
- Prefill 處理 prompt，建立 KV cache，並產生第一個新 token 所需的 logits；標準 decode 產生後續 tokens。
- 「每輪一個 token」是標準自回歸 decode 的教學前提；不涵蓋 speculative decoding 等可接受多個 tokens 的策略。
- 停止條件除了 EOS，還包括長度限制、停止規則與取消。Streaming 可在生成期間逐步回傳。
- Tokenization、admission、queue 與 scheduler 的具體先後邊界依 engine 而異，整合圖是概念流程。

### Continuous batching

- Orca 在 2022 年提出 iteration-level scheduling，並搭配 selective batching。簡報用 continuous batching 描述每輪可調整 requests 的主要概念，不把通用術語誤當成論文唯一技術名稱。
- A／B／C／D／E 的 10／30／50／40／20 tokens 是教學工作量。圖中的一格是一個 iteration，不代表每輪相同 wall-clock 耗時，也不構成效能比值。
- Static 頁停在 t = 10，Continuous 頁從同一時刻接續：D 補入 A 留下的空槽；t = 30 時 E 補入 B 的空槽，D 的進度保留；t = 50 時全部完成。跨頁是同一工作量下排程政策的比較，不是重新開始計時。
- 新 request 的 prefill、KV 資源、token budget、延遲需求及公平性仍需排程；插入 lane 是概念動作。
- 更高吞吐量不保證每個 request 的 latency 都下降。Static 圖的限制是無法補入新請求，不將「完成後一定無法立即回傳」泛化到所有實作。

### FlashAttention

- Dense attention 的漸近計算量仍為 `O(N²d)`；減少的是大型中間矩陣的 materialization 與 HBM I/O，不能說把 attention 計算複雜度變成線性。
- Tiling、kernel fusion、online softmax 的組合允許逐塊累積結果。Q/K/V 及輸出依然需要讀寫，並非完全不使用 HBM。
- Exact attention 指數學等價，並不保證浮點輸出與其他實作逐位元相同。
- Prefill 在足夠大工作量下常偏 compute-bound；小 batch decode 常偏 memory-bound。這些是典型傾向，受硬體、模型、精度、batch 及序列長度影響。
- 不採用未註明 GPU、shape、dtype 與比較基線的倍速宣稱。

### PagedAttention

- PagedAttention 是受 OS virtual memory／paging 啟發的 attention 與 KV 管理機制，不表示直接重用 OS page table 或缺頁處理流程。
- 16 tokens／block 為示例大小，不是固定規格；最後一個 block 仍可能未填滿，因此不宣稱零碎片或零浪費。
- 共用的是相同前綴對應的有效 KV blocks；需要引用管理與適當的 copy-on-write。文字任意片段相同不保證 KV 可共用。
- Request 結束後，只有不再被其他序列引用的 blocks 才能回收。
- Paging 改善可容納的 requests 數及記憶體使用效率；它與連續批次、attention kernel 的 I/O 優化處理不同層面的問題。

## 敘事與視覺參考

- 使用者提供的講稿：從 ChatGPT／Agent 引言，經單次 LLM request、GPU、continuous batching、FlashAttention、PagedAttention，回到 systems perspective 與 ML Systems 的價值。
- 2022／2025 為引言的敘事時間錨點；2025 不被表述為 Agent 的發明年份或普及率統計。
- 既有版本的視覺參考：[Cerulean — NCHC keynote](https://cerulean.works/slides/nchc-keynote/)。此連結保留為視覺方向來源，不是上述技術主張的依據。

## 高解析影像與使用規範

封面採 NASA Webb 觀測影像，結語採 Unsplash 海岸極光攝影。兩張素材均從原始解析度縮製為寬 4096 px，沒有放大、AI 補細節或生成式修改；本機打包，不依賴外部熱連結。播放器開始前預先解碼並保留圖片，避免換頁時才載入。技術頁維持可步進的機制圖解。

### 封面：Cosmic Cliffs

- **來源：** [Cosmic Cliffs in the Carina Nebula — NIRCam Image](https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/)
- **署名：** NASA, ESA, CSA, STScI。
- **觀測日期：** 2022-06-03；發布日期：2022-07-12。
- **性質：** Webb NIRCam 多波段紅外觀測的官方配色合成影像，不是肉眼可見光照片。
- **原始檔：** [NASA 原圖 PNG](https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/07/STScI-01GA6KKWG229B16K4Q38CH3BXS.png)，14575 × 8441 px。
- **本機檔案：** `assets/cosmic-cliffs-webb.jpg`，4096 × 2372 px。
- **使用規範：** [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)。教學／資訊用途；署名不代表 NASA 為本演講背書。

### 結語：海岸極光

- **來源：** [Aurora borealis glows brightly in the night sky](https://unsplash.com/photos/aurora-borealis-glows-brightly-in-the-night-sky-m5oOEXIRWdU)
- **署名：** Oskar Kadaksoo / Unsplash。
- **發布日期：** 2025-03-26；不將發布日當作拍攝日。
- **場景：** 深色海岸、夜空中的極光與海面反光。
- **原始檔：** [Unsplash 原始尺寸影像](https://images.unsplash.com/photo-1742993493624-ac0f22810eb6?fm=jpg&q=90)，7872 × 5251 px。
- **本機檔案：** `assets/aurora-oskar.jpg`，4096 × 2732 px。
- **使用規範：** [Unsplash License](https://unsplash.com/license)。免費使用與修改；保留作者署名。

全部影像皆依版面裁切、縮放並疊加明暗遮罩。第 38 頁第二步提供八張圖片的來源、署名、影像性質與兩站使用規範。

## 六張宇宙章節影像（2026-11-16）

使用者選擇每個技術章節各用一張滿版高清圖片，並指定極光或宇宙主題。六張均取自 NASA 的 Webb 官方影像頁，為紅外觀測的配色合成影像。保留技術頁的淺色底與可步進圖解；章節圖不表示硬體或演算法的科學對應關係。所有圖片本機打包、放映前解碼，原圖先裁成16:9，再縮到最多4096px寬，沒有放大或生成式補圖。

| 章節頁 | NASA影像／來源頁 | 原始尺寸 | 本機尺寸 | 儀器 |
|---|---|---|---|---|
| 06 · 一次 LLM 請求 | [Southern Ring Nebula](https://science.nasa.gov/asset/webb/southern-ring-nebula-nircam-image/) | 4833 × 4501 | 4096 × 2304 | NIRCam |
| 11 · GPU Architecture | [Webb’s First Deep Field](https://science.nasa.gov/asset/webb/webbs-first-deep-field-nircam-image/) | 4537 × 4630 | 4096 × 2304 | NIRCam |
| 15 · Continuous Batching | [Cartwheel Galaxy](https://science.nasa.gov/asset/webb/cartwheel-galaxy-nircam-and-miri-composite-image/) | 4685 × 4312 | 4096 × 2304 | NIRCam + MIRI |
| 19 · FlashAttention | [Pillars of Creation](https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-image/) | 8423 × 14589 | 4096 × 2304 | NIRCam |
| 26 · PagedAttention | [NGC 604](https://science.nasa.gov/asset/webb/ngc-604-miri-image/) | 3562 × 3024 | 3562 × 2003 | MIRI |
| 33 · A Systems Perspective | [Stephan’s Quintet](https://science.nasa.gov/asset/webb/stephans-quintet-nircam-and-miri-composite-image/) | 12654 × 12132 | 4096 × 2304 | NIRCam + MIRI |

署名：NASA, ESA, CSA, STScI；Cartwheel另含Webb ERO Production Team。Pillars of Creation影像處理：Joseph DePasquale、Anton Koekemoer、Alyssa Pagan（STScI）。每張章節頁可點擊署名回到官方來源，References第二步列出八張圖片。

原始下載：

- [Southern Ring Nebula 原始PNG](https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/07/STScI-01G8GZQ3ZFJRD8YF8YZWMAXCE3.png)；本機 `assets/cosmos-southern-ring.jpg`。
- [Webb’s First Deep Field 原始PNG](https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/07/STScI-01G8H1K2BCNATEZSKVRN9Z69SR.png)；本機 `assets/cosmos-deep-field.jpg`。
- [Cartwheel Galaxy 原始PNG](https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/08/STScI-01G9G4J23CDPVNGCYDJRZTTJQN.png)；本機 `assets/cosmos-cartwheel.jpg`。
- [Pillars of Creation 原始PNG](https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/10/STScI-01GGF8H15VZ09MET9HFBRQX4S3.png)；本機 `assets/cosmos-pillars.jpg`。
- [NGC 604 原始PNG](https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2024/03/STScI-01HQP6MAB9N9NS69HBBA9RN5KK.png)；本機 `assets/cosmos-ngc604.jpg`。
- [Stephan’s Quintet 原始PNG](https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2022/07/STScI-01G8H49RQ0E48YDM8WKW9PP5XS.png)；本機 `assets/cosmos-quintet.jpg`。

## Online softmax 的數字示例

第 24 頁使用單列 scores `[1, 2, 3, 0, 2, 4]`，分成三個 tiles；對應純量 V 為 `[2, 4, 1, 3, 5, 2]`。這是解釋演算法的合成資料，不是模型輸出。

每次更新共同基準 m，保存 `ℓ = Σ exp(score − m)` 與 `o = Σ exp(score − m) × v`，最後 `O = o / ℓ`。三步顯示的 `(m, ℓ, o)` 分別約為 `(2, 1.368, 4.736)`、`(3, 1.553, 2.892)`、`(4, 1.707, 3.740)`，最終 O 約為 2.192。畫面顯示四捨五入值，計算採完整精度。

實際 attention 的 V 與輸出是向量，教學算例只保留一個維度以看清「重新縮放舊摘要，再累加新 tile」；它不將完整 N × N scores 常駐 HBM。此處說明數學等價，並不宣稱浮點結果逐位元一致。
