# System Is All You Need — 講者備註

繁體中文 · 約 30 分鐘 · 34 頁（第 34 頁作延伸閱讀／Q&A，不計入主講時間）

畫面只負責一個問題與一個視覺動作；背景、限制與因果由口述補足。以下時間是建議停留時間，包含逐步動畫，不是自動換頁時間。技術依據及精確性說明見 [SOURCES.md](./SOURCES.md)。

## 01 · cover · System Is All You Need

**0:00–0:15 · 15 秒**

先讓觀眾看見標題。今天不談如何訓練更聰明的模型，而是看同一個模型如何真正有效率地服務人。標題是對「Attention Is All You Need」的呼應，並不是宣稱模型不重要。

**轉場：** 先回到讓大家開始感受到改變的兩個年份。

## 02 · chatgpt · 2022 · ChatGPT

**0:15–0:35 · 20 秒**

2022 年，ChatGPT 把大型語言模型帶到大眾面前。對多數人而言，AI 第一次成為可以直接對話的工具。這裡用年份作時間錨點，不需要介紹模型演進史。

**轉場：** 接著，AI 不再只回答問題。

## 03 · agents · 2025 · AI Agents

**0:35–0:55 · 20 秒**

到了 2025 年，Agent 成為大家討論與使用 AI 的重要方式：讀程式、呼叫工具、修改專案、完成多步驟工作。這是講者選擇的時代切面，並不是 Agent 的發明年份，也不是所有軟體工作已被取代的統計結論。

**轉場：** 當工具開始做我們正在學的工作，疑問就出現了。

## 04 · question · 模型之外

**0:55–1:20 · 25 秒**

向觀眾拋出問題，留兩秒空白：還在讀資工的我們，該往哪裡走？花時間學計組、OS、平行程式設計，還有價值嗎？不要立刻回答，讓這個問題成為後面技術段落共同的動機。

**轉場：** 大家看到的是模型，但模型背後還有一整個世界。

## 05 · stage · Model + System

**1:20–2:00 · 40 秒**

模型再強，仍要有人處理請求、分配 GPU、安排運算、管理記憶體。模型放不進單卡，會碰到切分、通訊與容量問題；同時有大量使用者，會碰到排程與吞吐問題。本場聚焦單次推論的 GPU 記憶體與 serving 機制，不展開多卡平行。第二步展開四層的職責，並在底部顯示路線：先理解 GPU 的硬體限制，再看 Batching 如何排程、FlashAttention 如何搬資料、PagedAttention 如何放資料。

**轉場：** 要理解系統的價值，先看清楚模型到底在做什麼。

## 06 · request · 一次請求

**2:00–2:35 · 35 秒**

送出一則訊息後，請求經網路抵達服務端。服務端不等於裸露的模型：推論系統要接收、排隊、選擇工作，再啟動模型。先追蹤同一個問題「What makes us human?」：第一步停在使用者端，第二步顯示網路與服務端佇列，第三步由 scheduler 把工作交給 GPU。後面會回到這個問題，加入其他使用者及資源管理。

**轉場：** 在送進模型之前，文字先改變了形狀。

## 07 · tokens · Tokenization

**2:35–3:20 · 45 秒**

Tokenizer 將文字切成 tokens，再對應到 token IDs。Token 可能是字、詞、詞的一部分，或特殊符號，不能直接把 token 數當中文字數。畫面中的切分與 IDs 是概念示意，實際結果依 tokenizer 而異。最後一步一起顯示 token IDs 與下方 embedding 向量：IDs 用來查找 embedding，模型後續處理的是向量。Token 到 ID、ID 到向量是不同的轉換，圖上的小格僅表示向量維度。

**轉場：** 但理解一句話，不能只看每個 token 本身。

## 08 · attention · Attention

**3:20–4:05 · 45 秒**

Transformer 用 attention 讓目前位置參考相關的上下文。指向視覺中較亮的關係，說明資訊如何跨 token 整合；連線是概念示意，不是實測 attention weights。對本場的 causal decoder，位置只能讀取自身與前面的 token。畫面持續以 human 為目前位置：Q 比對自己與之前位置的 K，得到權重後整合對應的 V。右側矩陣的行表示 query、列表示 key，human 這一行對未來的問號保持遮罩。Q、K、V 先介紹為查詢、鍵與值，稍後再看它們如何帶來資料搬移。

**轉場：** 讀過問題後，模型還不會一次吐出整篇答案。

## 09 · generation · 逐 Token 生成

**4:05–5:00 · 55 秒**

模型產生下一個 token 的分數，轉為機率後按策略選出一個 token；greedy 與 sampling 都是可能的選擇。將新 token 加入上下文，重複執行，直到 EOS、長度限制或其他停止規則。這裡示範標準自回歸生成，不包含 speculative decoding 等多 token 技術。

完整 prompt 的 prefill 產生第一個輸出 token 所需的 logits；後續 decode 延續生成。五個步驟依序選出 Our、shared、connections、句點、EOS。藍色回饋線從取樣結果回到 context；context 顯示本輪之前已有的 tokens，輸出列同時包含本輪新選的 token。最後一步 EOS 另置，不併入文字回答。支援 streaming 時，文字可以邊生成邊回傳，不必等 EOS。分布數字是示意，並未執行模型推論。

**轉場：** 這個重複迴圈，會在什麼樣的硬體上發生？

## 10 · gpu · GPU

**5:00–5:35 · 35 秒**

本場以 NVIDIA CUDA GPU 為例。GPU 由多個 SM 組成，各 SM 有執行單元、warp scheduler 與片上記憶體。CUDA cores 處理一般算術；Tensor Cores 加速矩陣乘加。不要把一個 request 對應成一個 CUDA core；模型的一次運算會展開成大量平行工作。

**轉場：** 硬體要平行執行，程式也得把工作拆開。

## 11 · warp · Thread / Warp / Block

**5:35–6:10 · 35 秒**

CUDA 的 threads 組成 blocks，blocks 組成 grid。每個 block 在一個 SM 上執行，同一個 SM 可容納多個 blocks，受資源限制。NVIDIA 的 warp 是 32 threads 的執行群組；不是一個 core，也不代表所有 GPU 廠商都使用相同寬度。同一 block 的 threads 可以共享資料與同步。

**轉場：** 平行工作之外，資料放在哪裡一樣重要。

## 12 · hierarchy · Memory hierarchy

**6:10–7:00 · 50 秒**

從每個 thread 使用的 registers，看到 SM 內的 shared memory／L1，再到多個 SM 共用的 L2，最後是容量大的 global memory。資料中心 GPU 常使用 HBM；其他 GPU 可能使用 GDDR。模型 weights、activations、KV cache 的大部分資料會落在 global memory。

這是概念層級圖，不是所有存取都固定經過同一條路；shared memory 和 L1 在多代架構中共用可配置片上資源。Registers 使用過多也可能降低能同時駐留的工作數。記住一件事：計算很快，搬資料也有成本。

**轉場：** 第一個系統問題：如何讓 GPU 有足夠的工作可做？

## 13 · batch · Batching

**7:00–8:05 · 65 秒**

同一請求的 token 有前後依賴，不同使用者的請求則可以一起計算。Batching 把多個 requests 的工作組合，增加平行度，也讓同一份模型權重服務更多 token，攤薄權重讀取成本。它不代表把不同人的上下文混在一起，每個序列仍有自己的狀態。

吞吐量是單位時間完成多少工作；單一使用者的延遲是等待多久。更大 batch 不保證每個人的回答都更快，排程還要考慮服務目標與記憶體容量。

**轉場：** Batch 可以一起開始，卻不一定一起結束。

## 14 · static · Static batching

**8:05–9:55 · 110 秒**

以 A／B／C 分別需要 10／30／50 個輸出 tokens 為例，D／E 需要 40／20 個，先留在佇列。第一步從 t = 0 開始；第二步推進到 t = 10，A 完成，B 與 C 各完成 10 tokens。第三步仍停在 t = 10，強調 A 後方的空槽與 D 前面的阻擋：示意中的 static batch 要等到 C 在 t = 50 結束，才接納下一批。這一步只加強焦點，時間沒有繼續往前。

數字是解釋排程的教學工作量，不是實測效能。不同 iteration 的實際耗時不必相等，這裡比較的是接納新請求的邊界。已完成的 request 是否能先回應，也依系統實作；此圖重點是不能將新工作補進同批空位。

**轉場：** 模型本來就一輪一輪執行，為什麼一定要等整個 request？

## 15 · continuous · Continuous batching

**9:55–12:00 · 125 秒**

切頁時仍是剛才的 t = 10：D 從右側佇列直接移入 A 留下的空槽，沒有倒帶。A 的已完成區段留在時間軸上，B、C 的狀態與已生成內容保留；新的排程政策從這個 iteration 邊界接手。先讓跨頁變形完成，再指著同一條時間刻度解釋「排程單位由 request 改成 iteration」。

下一步到 t = 20，D 已生成 10／40 tokens，B 與 C 繼續。再到 t = 30，B 完成，E 從佇列接上 B 的空槽；D 已完成的 20／40 tokens 不會歸零。最後到 t = 50，C、D、E 都完成，連同先前的 A、B，五個請求全部結束。沿著 D、E 的移動講述補位，讓觀眾看到每次接納新工作都保留其他請求的進度。

Orca 在 OSDI 2022 提出 iteration-level scheduling，搭配 selective batching；後來常以 continuous／in-flight batching 描述這類動態組批方式。它減少空位等待，改善利用率與吞吐。實際系統仍需安排新請求的 prefill、KV 容量與延遲預算；圖中是核心機制的簡化示意。

**轉場：** 填滿 GPU 之後，仍可能有另一種等待：等待資料。

## 16 · flash-title · FlashAttention

**12:00–12:20 · 20 秒**

先不急著解釋演算法，只留下問題：同樣的 attention，為什麼換一種計算方式就能更快？答案要從計算與搬移的相對成本開始。

**轉場：** GPU 的效能，會被不同的天花板限制。

## 17 · bottlenecks · Compute / Memory

**12:20–13:30 · 70 秒**

Compute-bound：運算單元忙著算，計算吞吐成為主要限制。Memory-bound：運算等待資料，記憶體頻寬成為主要限制。指出兩個畫面瓶頸不同：前者可以改善運算量、精度或執行效率；後者可以減少資料搬移、增加重用或提高頻寬。

不要說「memory-bound 升級 GPU 沒用」；精確說法是「只增加 FLOPS、沒有改善頻寬，幫助有限」。這裡先忽略 launch latency、通訊等其他限制。

**轉場：** Roofline 把這件事畫成一張圖。

## 18 · roofline · Roofline

**13:30–15:00 · 90 秒**

先讀座標：橫軸 arithmetic intensity，是每搬移一 byte 做多少 FLOPs；縱軸是達成的 FLOPs/s。斜線是記憶體頻寬 B 乘上 intensity I，水平線是硬體的峰值計算效能 Ppeak，因此 P ≤ min(Ppeak, B × I)。兩線交界是 ridge point，I = Ppeak / B。

先指左側：工作量中的資料搬移比例高。第二步沿橫軸向右，以「同樣 FLOPs、減少 HBM bytes」提高 I；這與稍後 FlashAttention 的優化方向一致。第三步靠近水平上限，指出單靠增加 I 也不能超越 Ppeak。這是上限模型，不是保證實測達到；圖上位置是概念示意，不帶特定 GPU benchmark 數值。

**轉場：** 接著把 attention 的資料搬移放進這個框架。

## 19 · standard · Standard attention

**15:00–16:30 · 90 秒**

Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V。QKᵀ 形成 N×N 分數矩陣，softmax 後再乘 V。傳統分開執行各算子的實作，往往把大型中間結果寫到 HBM，再讀回來做下一步。序列長度加倍，這塊中間矩陣元素數變成四倍。

指向矩陣與往返路線，而不是逐項推導公式。問題不只是乘法多，也可能是龐大中間結果反覆穿越記憶體層級。後面的「不儲存」不代表 attention 的所有配對計算消失。

**轉場：** 能不能算出答案，卻從未把這張大表完整寫出去？

## 20 · tiling · Tiling

**16:30–18:20 · 110 秒**

FlashAttention 把 Q、K、V 切成 tiles，將能放進快速片上 SRAM 的部分帶進來。逐塊計算 scores、softmax 相關狀態與輸出累積，融合原本分開的操作，避免把完整 N×N 中間矩陣 materialize 到 HBM。

跟著一塊資料完成一次進入、計算、累積，再移到下一塊；不要只說「變小塊所以更快」，關鍵是小塊留在快速記憶體內重用、減少 HBM I/O。Q/K/V 仍需讀取、輸出仍需寫回，HBM 並沒有消失。

**轉場：** 但 softmax 的分母需要整列資料，怎麼能只看一塊？

## 21 · softmax · Online softmax

**18:20–19:50 · 90 秒**

Online softmax 不必先保存整列 scores，而是持續維護三種狀態：目前最大值、指數和，以及加權輸出累積值。下一塊出現更大最大值時，舊累積值要按新基準重新縮放，然後加入新塊貢獻；最後完成正規化。

畫面用同一列六個 scores 的三塊純量例子，避免將三種狀態誤解成三個分開執行的步驟。每按一次，m、ℓ、o 都同步更新：scores 為 [1, 2]、[3, 0]、[2, 4]，對應 V 為 [2, 4]、[1, 3]、[5, 2]。第 1 塊 m=2、ℓ≈1.368、o≈4.736；第 2 塊 m=3、ℓ≈1.553、o≈2.891；第 3 塊 m=4、ℓ≈1.707、o≈3.740，最後 O=o/ℓ≈2.192。這裡 o 表示尚未除以分母的加權輸出累積，O 才是正規化後結果。實際 head 的 V/o/O 是向量，圖採單一維度以方便講解。

不推導遞迴公式；數字不是要觀眾心算，而是讓「新 max 會使舊累積重新縮放」成為可觀察的變化。不要把 ℓ/o 在某一步變小誤解成丟掉先前資料。Exact 指數學上等價的 dense attention，不是近似或捨棄注意力連線；浮點運算順序不同仍可能造成微小數值差異。

**轉場：** 我們省下的究竟是什麼？

## 22 · flash-result · FlashAttention 的取捨

**19:50–21:00 · 70 秒**

對照三件事：dense attention 的漸近計算量仍是 O(N²d)；不用儲存完整 N×N 中間矩陣；HBM 讀寫量減少。效益主要來自 IO-aware 的演算法與 kernel 實作，而不是把 attention 換成近似版本。

連回 Roofline：減少 HBM bytes，能提高對該層記憶體計算的有效 arithmetic intensity。不是保證任何序列長度、GPU、dtype 都有同一倍速，也不宣稱整個模型必然從 memory-bound 變成 compute-bound。

**轉場：** 算得更有效率之後，另一種記憶體還會一直長大。

## 23 · paged-title · PagedAttention

**21:00–21:15 · 15 秒**

FlashAttention 關心計算過程的 I/O；PagedAttention 關心生成過程的 KV cache 如何存放與共用。接下來會看到一個熟悉的作業系統概念。

**轉場：** 先看模型為什麼需要「記住」先前的計算。

## 24 · kv · KV cache

**21:15–22:10 · 55 秒**

生成新 token 時，attention 需要先前 tokens 的 K 與 V。將它們快取，可以避免每一步都重新計算整段前綴。新的 token 繼續把自己的 K/V 加入 cache，於是 cache 隨序列長度成長。

這是計算重用，不是把整段 attention 的答案都保存，也不代表後續步驟不需要讀取先前 K/V。KV cache 的大小與 layers、KV heads、head dimension、dtype、token 數及同時 requests 數有關。

**轉場：** 一段看起來不長的對話，可能佔多少空間？

## 25 · kv-scale · KV cache 的容量

**22:10–23:15 · 65 秒**

這是一個**假設性 MHA 教學模型**，不是特定產品的記憶體報告：32 layers、32 KV heads、head dimension 128，K/V 用 BF16，每元素 2 bytes。每個 token 的 KV 為 2 × 32 × 32 × 128 × 2 = 524,288 bytes = 512 KiB。4,096 cached tokens 就是 2 GiB；16 個同長 request 合計 32 GiB。

式子的第一個 2 是 K 和 V，最後的 2 是 bytes／element。這只計 K/V 張量，不含模型權重、activations、metadata、padding；未做 prefix sharing、KV 壓縮或跨 GPU 分片。GQA／MQA 使用較少 KV heads，結果會不同。圖中 R01–R16 表示十六個各有 4,096 cached tokens 的 request；每個 request 佔 2 GiB，總計 32 GiB。讓大數字停留一下。

**轉場：** 容量已經很珍貴，連配置方式都不能浪費。

## 26 · fragmentation · Fragmentation

**23:15–24:25 · 70 秒**

連續配置有三種浪費：為不確定的最終長度預留太多，實際沒用完；可用空間分散，湊不成需要的連續區域；相同 prompt 的多個序列各存一份相同 K/V。分別指向圖上的空白尾部、散落空洞與重複前綴。

內部碎片與未來尚未使用的 reservation 可分開描述：前者最終可能永遠不用，後者即使日後會用到，當下仍無法借給別人。這是早期或採連續配置的 serving 管理方式，不是所有現代系統的必然行為。

**轉場：** OS 已經教過我們，邏輯連續不等於實體連續。

## 27 · paging · Paging

**24:25–25:45 · 80 秒**

PagedAttention 將 KV cache 切成固定 token 數的 blocks。每個 request 有 block table，記錄 logical block 到 physical block 的對應。依序讀取的上下文，可以放在不連續的實體位置；kernel 根據映射找到相應 K/V，完成 attention。

沿一條 logical-to-physical 連線走完，再換下一條，讓觀眾確實讀懂映射。這是受 virtual memory／paging 啟發的 KV 管理與 attention 機制，不是直接把 OS 的 page table 或缺頁中斷搬過來。論文由 vLLM 團隊於 2023 年提出。

**轉場：** 有了 block table，新的 token 不再需要預留整條長序列。

## 28 · growth · 按需配置

**25:45–26:50 · 65 秒**

沿三個狀態追蹤同一個 request：14 tokens 時仍有兩格可用；16 tokens 剛好填滿；第 17 個 token 才配置下一個 physical block P2。P2 對應從 16 開始的 token indices（0-based），free pool 從 4 blocks 減少為 3 blocks。先填當前 block，滿了才配置另一個 physical block，並更新 mapping。圖中採 16 tokens／block 作示例；實際大小是系統設計與配置的選項。這樣避免替未知的最終長度一次預留巨大連續空間。

最後一個 block 仍可能未滿，所以不是零浪費。Request 完成或取消時，系統可回收不再被引用的 blocks，供新請求使用；若還有其他序列共用，須等引用解除後再釋放。

**轉場：** 而且，不同 request 的映射可以指向同一份內容。

## 29 · sharing · Prefix sharing

**26:50–28:00 · 70 秒**

當多個生成序列共用相同的已計算前綴，可以讓 block tables 指向相同 physical blocks。共享建立後，圖上 refcount 從 1 增至 2；只有引用降為 0 的 block 才可回收。後續 token 分歧時，各自延伸；對仍被共用且需要修改的 block，使用 copy-on-write 保留正確性。分享的是相同前綴所對應的 K/V，不是文字任意一段相同就一定可共用。

收束因果：更少碎片與重複，能容納更多 requests；更多可用的 batch 工作量，有機會提高吞吐。PagedAttention 管配置與存取，continuous batching 管排程，兩者相互支援。

**轉場：** 現在重新按下那一次 Enter。

## 30 · systems · 一次請求，系統的視角

**28:00–28:35 · 35 秒**

快速追蹤開場同一個問題。第一步對應 tokenization／佇列與 continuous batching 排程；第二步接上 prefill、decode 與兩者共用的 KV cache，把 FlashAttention 的 attention I/O 改善和 PagedAttention 的 block 管理指回圖中位置。Decode 完成一輪會回到 scheduler，決定下一輪的 requests。第三步達到 EOS 或長度限制後解除引用，僅回收不再共用的 blocks，留在圖上的 blocks 表示其他仍在使用的資料。

整個過程可持續 detokenize 與 streaming；完成不是第一個回傳文字的時點。具體系統中 tokenize 與 admission／排程的邊界可能不同。圖上示範 FlashAttention 對 prefill 的典型用途，不表示它只能用於 prefill。

**轉場：** 同一請求的前半段與後半段，工作形狀也不同。

## 31 · phases · Prefill / Decode

**28:35–29:00 · 25 秒**

Prefill 處理已知 prompt 的大量 tokens，建立 KV 並提供第一個輸出 token 的 logits；足夠工作量下常偏向 compute-bound。標準 decode 每輪每序列一個新 token，小 batch 下常受 weights／KV 的讀取頻寬限制。左圖五個 prompt tokens 共同建立 KV，並提供第一個 token Our 的分布。右圖再以 Our 作為新的輸入，讀取舊 KV、追加自己的 KV 並預測 shared；後面兩列持續同一過程。灰格是既有 KV，藍格是這輪新增的 KV，空格還沒有配置；每列畫的是不同的 iteration，不是同一輪的三個 requests。最後一步補上 streaming。這是典型傾向，不是無條件分類。

**轉場：** 這些差異，正是系統設計發揮作用的地方。

## 32 · takeaway · ML Systems

**29:00–29:40 · 40 秒**

第一步用三個問題收束：誰先算？每輪重新排程，用 continuous batching 補入新請求。資料怎麼搬？FlashAttention 在片上完成分塊，減少 HBM 存取。記憶體怎麼放？PagedAttention 按需配置 KV blocks，重用相同前綴。

第二步再出現對應課程：作業系統、計算機組織、虛擬記憶體。這些基礎沒有退場，它們讓相同的模型能服務更多人。

回應開頭的問題：AI 的進步不只來自模型本身，也來自讓模型運作的整個系統。這就是 ML Systems 的價值。

**轉場：** 讓最後一句落下，不再加新概念。

## 33 · closing · System Is All You Need

**29:40–30:00 · 20 秒**

以 Unsplash 的海岸極光回應開場 NASA Webb 的宇宙觀測影像，讓標題形成回環。「讓相同的模型，服務更多人」是這場演講的落點。口述收尾：「下一次看見一個 token 出現在螢幕上，希望你也看見它背後的整個系統。」停頓，致謝，進入提問。

## 34 · sources · References

**Q&A／延伸閱讀，不計入 30 分鐘主講**

四組入口：NVIDIA CUDA／GPU performance 文件、Orca、FlashAttention、PagedAttention。詳細連結、計算假設與本次對原稿做的精確性修訂整理在 [SOURCES.md](./SOURCES.md)。若有人問實測加速比，說明本簡報沒有進行效能 benchmark，請依論文工作負載與對照基線解讀數字。

再推進一步顯示兩張圖片的來源與使用規範。封面是 NASA Webb Cosmic Cliffs，署名 NASA, ESA, CSA, STScI，屬 NIRCam 紅外觀測合成影像。結尾為 Oskar Kadaksoo / Unsplash 的海岸極光攝影。兩張素材均從原圖縮製為 4096px，只做裁切、縮放與明暗遮罩。
