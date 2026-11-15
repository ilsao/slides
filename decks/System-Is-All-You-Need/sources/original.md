
# 引言

2022 年，ChatGPT 橫空出世。

2025 年，AI Agent 席捲全球。

當 Agent 開始進入軟體工程，還在讀資工的我們，心中不免浮出一些疑問：我們該何去何從？難道資工系的盡頭只剩下機器學習了嗎？我們花費數年學習的計組與作業系統，是否已經失去了價值？

當所有人都在關注更大、更強的模型時，多數人都忽略了一個問題：模型是如何被高效運行的？

當模型大到無法容納於單張 GPU，記憶體管理便成了關鍵。當數千人同時發送對話請求，排程器便顯現出了價值。

AI 的舞台，從來不只有模型。

# 一次 LLM 請求

當然，在理解 AI 背後的世界之前，我們得先知道語言模型是怎麼處理一個請求的。

1. 請求被送出，經由網路被送往伺服器。

大家知道我們在與 AI 聊天的時候，AI 到底是怎麼處理我們發出的消息的嗎？(按下 Enter) 我們發出的消息會變成請求，經由網路送到提供服務的 LLM 伺服器。

2. 伺服器收到請求後，交往 LLM。

當伺服器收到我們的請求後，會將請求交給推論系統。推論系統負責管理收到的請求，把這些請求按某種規則分配給 LLM 處理。

3. Tokenizer 將輸入文字轉換為 tokens。

LLM 不會直接讀我們輸入的文字。請求在進入模型之前，會先經過一個特殊的組件：Tokenizer，Tokenizer 會先把文字切分成一個個 Token。Token 不一定是一個字，也可能是一個詞，或者是詞的一部分。然後，每個 Token 會被轉換成對應的數字，最後這些數字才是被 LLM 處理的內容。

4. LLM 透過 Transformer 處理輸入，利用 Attention 整合上下文資訊

這些 Tokens 會被送進 LLM。現在 LLM 大多使用 Transformer 架構，裡面有一個很重要的機制 Attention。它讓模型在處理每個 Token 時，可以參考前面出現過的內容，判斷哪些資訊比較相關。例如，在理解這個問題時，模型需要把「Human」跟「Us」等資料關聯起來。

5. LLM 選出第一個輸出 token。

當模型讀完我們的問題後，它不會一次產生完整的答案，而是會先預測下一個 Token 可能是什麼。就像人說話一樣，一次只能說一個字。模型會為不同的候選 Token 計算分數，形成一個機率分布，再依照某種策略選出其中一個作為第一個 Token。比如說，這次模型就選擇了「It's」，作為回答的第一個 Token。

6. LLM 將生成的 token 加入上下文，繼續預測第二個 token。

在選出第一個 Token 之後，LLM 會把它加入原本的上下文，再繼續預測下一個 Token。這個過程會不斷重複，每次生成一個新的 Token，直到逐漸組成完整的回答。

7. LLM 生成 EOS，停止生成。

當模型生成一個特殊的 Token，EOS，也就是 End of Sequence，就代表這次的生成結束了。最後，這些 Token 會被轉換回文字，被我們看到。

# System is All You Need

## GPU Architecture

GPU（Graphics Processing Unit）是一種專門為平行運算設計的處理器。

### Streaming Multiprocessor

GPU 由多個 Streaming Multiprocessors（SM）組成，每個 SM 都能獨立執行大量 Threads。

SM 內部包含 CUDA Cores、Warp Schedulers、Tensor Cores 等硬體單元，負責不同類型的運算。

CUDA Cores 主要執行一般的整數與浮點數運算，而 Tensor Cores 則專門加速矩陣乘法，是現代深度學習訓練與推論的重要硬體。

### Thread、Warp 與 Thread Block

在 CUDA Programming Model 中，程式會將工作拆分成大量 Threads。

Threads 會被組織成 Thread Blocks，而多個 Thread Blocks 組成一個 Grid。

GPU 會將 Thread Blocks 分配給不同 SM 執行。同一個 Block 的 Threads 可以互相協作與同步。

在 NVIDIA GPU 中，32 個 Threads 組成一個 Warp，是 GPU 執行與排程的重要單位。

### GPU Memory Hierarchy

GPU 的記憶體並不是只有一種，而是由多個層級組成。一般來說，越靠近運算單元的記憶體，存取速度越快，但容量也越小。

#### Registers

Registers 是 GPU 中速度最快的儲存空間之一，每個 Thread 都有自己的 Registers，用來儲存計算過程中的變數與中間結果。

Registers 的容量非常有限。如果每個 Thread 使用太多 Registers，可能降低 GPU 同時執行的 Threads 數量，進而影響效能。

#### Shared Memory / SRAM

Shared Memory 是位於 GPU 晶片上的高速記憶體，通常由同一個 Thread Block 內的 Threads 共同使用。

相較於 GPU Global Memory，Shared Memory 具有更低的存取延遲與更高的頻寬，因此常被用來暫存需要重複使用的資料。

#### L1 / L2 Cache

Cache 會自動保留近期使用過的資料，減少重複存取較慢記憶體的需求。

L1 Cache 通常位於每個 SM（Streaming Multiprocessor）附近，而 L2 Cache 則由多個 SM 共享。

#### Global Memory / HBM

Global Memory 是 GPU 主要的大容量記憶體，通常使用 GDDR 或 HBM 技術。

模型權重、Activations 與 KV Cache 通常儲存在這裡。

雖然 Global Memory 容量大，但相較於片上記憶體，其存取延遲較高，因此大量資料搬移可能成為 GPU 的效能瓶頸。

## Continuous Batching

一個 Serving System 需要處理多位使用者的請求，將多個請求打包成一個 Batch，然後交給 LLM 生成內容。

1. Why Batching? 

我們為什麼需要把請求打包成 Batch 呢？

大家還記得前面提到過，LLM 在回答問題時，一次只會生成一個 Token 嗎？

如果我們每次只讓 GPU 處理一個使用者的請求，就可能沒法充分利用 GPU 強大的平行運算能力，造成運算資源的浪費。

其實我們可以發現，LLM 對不同使用者的回答其實是彼此獨立的。也就是說，我們不需要等第一個人的回答全部生成完，才可以開始處理第二個人的問題。

因此，我們可以將多個使用者的請求組成一個 Batch，交給 GPU 同時處理。

這不僅能更充分利用 GPU 的平行運算能力，也能更有效率地利用模型權重，讓系統在相同時間內生成更多 Token，提升整體的處理效率。

2. Static Batching

Static Batching 的運作方式很簡單：系統先收集多個使用者的請求，將它們組成一個 Batch，接著一起執行推論。只有當整個 Batch 的請求都完成後，才能開始處理下一批請求。

但這會產生一個問題：不同使用者需要生成的 Token 數量可能不同。

例如，同一個 Batch 有三個請求：
- A：需要生成 10 個 Tokens
- B：需要生成 30 個 Tokens
- C：需要生成 50 個 Tokens

當 A 生成完第 10 個 Token 時，B 和 C 還沒完成。即使 A 已經結束，系統也無法立即將新的請求加入 A 空出來的位置，而是必須等待整個 Batch 結束。

這造成 GPU 資源無法充分利用，也增加了新請求的等待時間。

3. Continuous Batching

為了解決這個問題，Orca 在 2022 年提出了 Continuous Batching。

相對於 Static Batching 以每個用戶的 request 為排程單位，Continuous Batching 提出了新的排程粒度：Iteration (LLM 生成一個 token 稱為一個 iteration)。Continuous Batching 利用這個特性，在每次迭代之間，動態調整正在處理的請求。

同樣的例子，假設 GPU 正在同時處理三個使用者的請求：
- 使用者 A：需要生成 10 個 Tokens
- 使用者 B：需要生成 30 個 Tokens
- 使用者 C：需要生成 50 個 Tokens

當 A 生成完第 10 個 Token 時，系統就可以將 A 從 Batch 中移除，並將等待中的使用者 D 加入 Batch。此時 B 和 C 不需要重新開始，而是可以繼續生成剩餘的 Tokens。

這種機制稱為 Iteration-level Scheduling（迭代層級排程），也就是在每次模型推論迭代之間，重新決定哪些請求應該由 GPU 執行。

透過這種動態排程方式，Continuous Batching 可以減少 GPU 運算資源的浪費，降低新請求的等待時間，並提高單位時間內能完成的請求數量。

## FlashAttention

### Compute-Bound and Memory-Bound

在理解 FlashAttention 之前，我們需要先認識 GPU 運算的兩種瓶頸：

Compute-bound（計算受限）：程式的執行速度主要受到 GPU 計算能力限制。例如大型矩陣乘法，需要大量浮點數運算，GPU 的運算單元可能已經接近滿載。此時，想要進一步加速，就需要減少運算量。

Memory-bound（記憶體受限）：程式的執行速度主要受到記憶體頻寬限制。即使 GPU 還有足夠的計算能力，也可能因為等待資料從記憶體傳輸而無法充分利用運算單元。此時升級 GPU 通常不會有顯著的性能提升。

為了分析這兩種瓶頸，我們可以使用 Roofline Model。

### Roofline Model

Roofline Model 描述 GPU 的理論運算效能上限：

$$
P \leq \min(P_{\text{peak}}, B \times I)
$$

其中：
- $P_{\text{peak}}$：GPU 的峰值計算效能（FLOPS）。
- $B$：記憶體頻寬（Bytes/s）。
- $I$：Arithmetic Intensity，代表每讀寫一個 Byte 的資料，可以執行多少次浮點數運算（FLOPs/Byte）。

當 Arithmetic Intensity 較低時，程式容易受到記憶體頻寬限制；當 Arithmetic Intensity 足夠高時，程式則可能受到計算能力限制。

兩種瓶頸的分界點稱為 Ridge Point：

$$
I_{\text{ridge}} = \frac{P_{\text{peak}}}{B}
$$

當 $I < I_{\text{ridge}}$ 時，程式處於 Memory-bound 區域；反之，則進入 Compute-bound 區域。

### 傳統 Attention 的問題

標準的 Scaled Dot-Product Attention 計算如下：

$$
\operatorname{Attention}(Q,K,V)
=\operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

假設輸入序列長度為 $N$，傳統實作通常會先計算 $QK^T$，產生大小為 $N \times N$ 的 Attention Score Matrix，接著執行 Softmax，最後與 $V$ 相乘。

問題在於，這個巨大的中間矩陣往往需要寫入 GPU 的高頻寬記憶體（HBM），再重新讀取進行後續運算。

當序列長度增加時，中間矩陣的大小會以 $O(N^2)$ 成長，造成大量記憶體存取。

因此，傳統 Attention 的效能瓶頸不一定是計算量，而可能是大量中間資料在 HBM 與 GPU 運算單元之間搬移的成本。

### FlashAttention

FlashAttention 使用兩個關鍵技術：

- Tiling（分塊計算）

FlashAttention 不會一次計算完整的 Attention Matrix，而是將 $Q$、$K$、$V$ 分成較小的 Blocks，讓資料可以放進 GPU 晶片上速度更快的 SRAM。

每個 Block 在 SRAM 中完成部分矩陣乘法、Softmax 與輸出累積，避免反覆存取 HBM 中的大型中間矩陣。

- Online Softmax

一般 Softmax 需要知道整列所有元素，才能計算正規化分母。

FlashAttention 使用 Online Softmax，在逐塊處理 Attention Scores 時，持續更新每一列的最大值、指數總和與輸出累積值。

所以，即使沒有儲存完整的 Attention Matrix，也能計算出數學上等價的 Attention 結果。

### FlashAttention 帶來的改善

FlashAttention 的主要改善來自減少記憶體存取。

| 比較項目 | 傳統 Attention | FlashAttention |
|---|---|---|
| Attention 計算量 | $O(N^2d)$ | $O(N^2d)$ |
| 額外中間記憶體 | $O(N^2)$ | 不需儲存 $N^2$ 矩陣 |
| HBM 存取 | 較多 | 較少 |
| 計算結果 | Exact Attention | Exact Attention |

從 Roofline Model 的角度來看，FlashAttention 透過減少 HBM 資料傳輸量，提高有效的 Arithmetic Intensity，讓 GPU 能花更多時間執行實際運算，而不是等待資料搬移。

## PagedAttention

PagedAttention 是由 vLLM 團隊在 2023 年提出的技術，主要目的是改善大型語言模型（LLM）推論時的記憶體管理效率，讓 GPU 能同時處理更多使用者請求，提高系統吞吐量（Throughput）。

### KV Cache 是什麼？

在 LLM autoregressive 生成的過程中，模型每次只會生成一個新的 Token，但在計算 Attention 時，需要使用先前所有 Tokens 的 Key 和 Value。

如果每次生成新 Token，都重新計算之前所有 Tokens 的 Key 和 Value，會造成大量重複運算。

因此，LLM Serving 系統通常會使用 KV Cache，將過去 Tokens 的 Key 和 Value 儲存起來，讓後續生成可以直接重複使用。

不過，KV Cache 的記憶體需求會隨著序列長度增加。對於一般 Transformer，其大小大約為：

$$
M_{\text{KV}}=2\times L\times N\times H_{\text{kv}}\times d_h\times b
$$

其中：
- $L$：Transformer Layers 數量
- $N$：目前的 Token 數量
- $H_{\text{kv}}$：每層 KV Heads 數量
- $d_h$：每個 Head 的維度
- $b$：每個元素佔用的 Bytes

當系統同時服務大量使用者時，KV Cache 便會佔據相當可觀的 GPU 記憶體。

TODO: 給一個例子

### 傳統 KV Cache 管理的問題

早期的 LLM Serving 系統通常會為每個 Request 預先配置一塊連續的 GPU 記憶體，用來存放整個序列的 KV Cache。

然而，系統無法事先知道使用者最終會生成多少 Tokens，因此容易產生三種問題。

第一種是 Internal Fragmentation（內部碎片）。假設系統為某個 Request 預留 2048 Tokens 的空間，但實際只使用 300 Tokens，剩餘的空間就會被浪費。

第二種是 External Fragmentation（外部碎片）。即使 GPU 記憶體總共有足夠的剩餘空間，也可能因為空間分散、不連續，而無法配置新的大型 KV Cache。

第三種是 Memory Duplication（記憶體重複）。當多個生成序列共享相同的 Prompt 時，傳統方法可能需要為每個序列分別儲存相同的 KV Cache。

這些問題會降低 GPU 記憶體的使用效率，限制系統能同時處理的 Requests 數量。

### PagedAttention 如何解決？

PagedAttention 的設計受到作業系統 Virtual Memory（虛擬記憶體）與 Paging（分頁機制）的啟發。

它不再要求每個 Request 的 KV Cache 必須存放在一整塊連續的 GPU 記憶體中，而是將 KV Cache 切分成固定大小的 Blocks。

每個 Block 可以儲存固定數量 Tokens 的 Key 和 Value，例如 16 Tokens。

系統會為每個 Request 維護一張 Block Table，記錄 Logical Blocks 與 Physical Blocks 的對應關係。

雖然實際儲存位置不連續，但 PagedAttention Kernel 可以透過 Block Table 找到對應的 Key 和 Value，並完成 Attention 計算。

當 Request 生成新的 Tokens 時，系統只需要在目前的 Block 寫入資料。如果 Block 已滿，再配置新的 Physical Block。

因此，不需要事先為整個序列預留大量記憶體。

PagedAttention 還支援不同 Requests 共享相同的 Physical Blocks。

例如，當多個生成序列具有相同的 Prompt 時，可以讓它們的 Logical Blocks 指向相同的 Physical Blocks，避免重複儲存相同的 KV Cache。

# 一次 LLM 請求：A Systems Perspective

現在，讓我們重新回到一開始的問題：當使用者向 ChatGPT 發送一則訊息時，背後究竟發生了什麼？

這一次，我們不再只關注 Transformer 如何生成 Token，而是從系統的角度，重新走過一次完整的 LLM 推論流程。

### Request Scheduling

當大量使用者同時發送請求時，Serving System 首先需要決定哪些請求應該被執行。

系統會透過 Scheduler 管理等待中的 Requests，並利用 Continuous Batching，將多個請求動態組合成 Batch。

與傳統 Static Batching 不同，Continuous Batching 允許 Scheduler 在每次推論迭代之間，移除已完成的請求，並加入新的請求。

因此，GPU 不需要等待整批請求全部完成，就能持續處理新的工作，提高整體 Throughput。

### Tokenization 與 Prefill

當請求被選中執行時，輸入文字會先經過 Tokenizer，轉換成模型可以理解的 Token IDs。

接著，模型進入 Prefill 階段。

在 Prefill 階段，Transformer 需要同時處理輸入 Prompt 中的大量 Tokens，涉及大量矩陣乘法，因此整體運算通常具有較高的 Arithmetic Intensity，在足夠大的工作負載下容易呈現 Compute-bound 的特性。

然而，傳統 Attention 需要將 Attention Score Matrix 寫入 HBM，再讀取進行 Softmax 等後續運算。這些中間資料的搬移仍然會造成額外的記憶體存取成本。

FlashAttention 透過 Tiling、Kernel Fusion 與 Online Softmax，避免將完整的 Attention Matrix 寫入 HBM，減少不必要的資料搬移。

因此，即使 Prefill 整體偏向 Compute-bound，FlashAttention 仍然能透過改善 Attention Kernel 的記憶體存取效率，提高整體推論效能。

### KV Cache Management

當 Prefill 完成後，模型已經建立輸入 Prompt 對應的 KV Cache。

這些 KV Cache 通常儲存在 GPU 的 HBM 中，並且會隨著生成的 Token 數量持續增加。

為了有效管理這些資料，Serving System 可以使用 PagedAttention，將 KV Cache 分割成固定大小的 Blocks。

每個 Request 透過 Block Table，將 Logical Blocks 映射到實際的 Physical Blocks。

如此一來，KV Cache 不需要佔據連續的 GPU 記憶體，也不必事先配置整個序列可能需要的空間。

透過減少記憶體碎片，系統可以在相同的 GPU 記憶體容量下，同時容納更多 Requests。

### Decode

完成 Prefill 後，模型進入 Decode 階段，開始逐一生成新的 Tokens。

每次 Decode Iteration，模型會讀取先前儲存的 KV Cache，計算目前 Token 的 Attention，並預測下一個 Token。

與 Prefill 不同，Decode 每次通常只處理每個 Request 的一個新 Token。

因此，在 Batch Size 較小的情況下，Decode 的 Arithmetic Intensity 通常較低，容易受到 HBM 頻寬限制，也就是 Memory-bound。

這時候，GPU 的運算能力不一定是主要瓶頸，反而是模型權重與 KV Cache 的資料搬移成本。

Continuous Batching 可以透過同時處理更多 Requests，提高模型權重的重複使用效率，改善 GPU 的整體利用率。

而 PagedAttention 則負責讓持續增長的 KV Cache 能夠有效配置與存取。

### Request Completion

當模型生成 EOS Token，或達到預設的生成長度限制時，這次請求便會結束。

Serving System 會釋放該 Request 使用的 KV Cache Blocks，讓其他請求可以重新利用這些 GPU 記憶體空間。

同時，Continuous Batching 的 Scheduler 可以將新的 Request 加入正在執行的 Batch，繼續利用 GPU 的運算資源。

生成的 Token 會經過 Detokenization，轉換回人類可以閱讀的文字，並傳送給使用者。在支援 Streaming 的系統中，文字也可以在生成過程中逐步傳回，而不必等待整個回答完成。

## 結語

回顧整個流程，我們可以發現，一次看似簡單的 LLM 請求，背後其實涉及許多不同領域的系統技術。

Continuous Batching 解決的是排程問題，FlashAttention 改善的是 Attention 計算中的記憶體存取效率，而 PagedAttention 解決的是 KV Cache 的記憶體管理問題。

這些技術並沒有讓模型變得更聰明，卻讓相同的模型能夠以更低的成本、更高的效率服務更多使用者。

從 GPU Architecture、Memory Hierarchy，到 Scheduling、Memory Management，我們過去在計算機組織、作業系統與平行程式設計中學習的知識，都在這些技術中扮演著重要角色。

當我們談論 AI 的未來時，除了思考如何訓練出更強大的模型，也值得思考如何讓這些模型真正有效率地運行。

因為 AI 的進步，不只來自模型本身，也來自支撐模型運作的整個系統。

而這，正是 ML Systems 的價值。

---

## 一、引言：AI 的舞台不只有模型（2 分鐘）

## 二、一次 LLM 請求（3 分鐘）

- Request 如何從使用者傳送到 LLM Server
- Tokenization：文字如何轉換成 Tokens
- Transformer 與 Attention 的基本概念
- Autoregressive Generation：逐 Token 生成
- EOS 與 Request Completion

## 三、System is All You Need（23 分鐘）

### 3.1 GPU Architecture（2 分鐘）

- Streaming Multiprocessor（簡介）
- CUDA Cores 與 Tensor Cores（簡介）
- GPU Memory Hierarchy
  - Registers / Shared Memory / SRAM
  - Global Memory / HBM

### 3.2 Continuous Batching：讓 GPU 不再等待（5 分鐘）

- 為什麼 LLM Serving 需要 Batching？
- Static Batching 的限制
- Continuous Batching
  - Iteration-level Scheduling

### 3.3 FlashAttention：減少不必要的記憶體存取（9 分鐘）

- Compute-bound 與 Memory-bound
- Roofline Model 與 Arithmetic Intensity（概念介紹）
- 傳統 Attention 的記憶體瓶頸
- FlashAttention 的核心技術
  - Tiling
  - Online Softmax（不推導公式）
- FlashAttention 的效能改善

### 3.4 PagedAttention：從作業系統到 LLM 記憶體管理（7 分鐘）

- KV Cache 的用途與記憶體需求
- 傳統 KV Cache 管理的問題
  - Memory Fragmentation
  - Memory Duplication
- Virtual Memory 與 Paging 的概念
- Logical Blocks、Physical Blocks 與 Block Table
- PagedAttention 如何提升記憶體使用效率

## 四、一次 LLM 請求：A Systems Perspective（1 分鐘）

- Request Scheduling：Continuous Batching 動態排程請求
- Tokenization & Prefill：FlashAttention 加速 Attention 計算
- KV Cache Management：PagedAttention 管理 GPU 記憶體
- Decode：逐 Token 生成與 Memory-bound 瓶頸
- Request Completion：釋放資源並回傳結果

## 五、結語：AI 的進步不只來自模型（1 分鐘）
