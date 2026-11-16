# System Is All You Need — 講者備註

繁體中文 · 約 30 分鐘 · 42 頁（第 42 頁作延伸閱讀／Q&A，不計入主講時間）

畫面以主要圖解為焦點，保留一句短提示與必要的局部參照；背景、限制、完整公式與因果由講者口述。技術頁不放解說段落，四頁拆開比較與映射；請依手動狀態切換講述。以下時間是建議停留時間，包含逐步動畫，不是自動換頁時間。技術依據及精確性說明見 [SOURCES.md](./SOURCES.md)。

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

模型再強，仍要有人處理請求、分配 GPU、安排運算、管理記憶體。模型放不進單卡，會碰到切分、通訊與容量問題；同時有大量使用者，會碰到排程與吞吐問題。本場聚焦單次推論的 GPU 記憶體與 serving 機制，不展開多卡平行。第二步展開四層名稱，由講者口述各層職責與接下來的路線：先理解 GPU 的硬體限制，再看 Batching 如何排程、FlashAttention 如何搬資料、PagedAttention 如何放資料。

**轉場：** 要理解系統的價值，先看清楚模型到底在做什麼。

## 06 · request-title · 一次 LLM 請求

**章節轉場**

以 Southern Ring Nebula 滿版影像讓引言暫停一拍。只說「現在追蹤一次請求」，再進到下一頁的 What makes us human。停留時間併入下一頁原有預算。

## 07 · request · 一次請求

**2:00–2:35 · 35 秒**

送出一則訊息後，請求經網路抵達服務端。服務端不等於裸露的模型：推論系統要接收、排隊、選擇工作，再啟動模型。先追蹤同一個問題「What makes us human?」：四個畫面依序聚焦 prompt、queue、scheduler、Transformer；同一個 A 標記在物件之間接續，完整四站路徑持續可見，當前站突出，A沿同一路徑移動。後面會回到這個問題，加入其他使用者及資源管理。

**轉場：** 在送進模型之前，文字先改變了形狀。

## 08 · tokens · Tokenization

**2:35–3:20 · 45 秒**

Tokenizer 將文字切成 tokens，再對應到 token IDs。Token 可能是字、詞、詞的一部分，或特殊符號，不能直接把 token 數當中文字數。畫面中的切分與 IDs 是概念示意，實際結果依 tokenizer 而異。三個畫面各自聚焦文字、token strip、embedding 矩陣；最後只把 IDs 留在各向量上方。IDs 用來查找 embedding，模型後續處理的是向量。Token 到 ID、ID 到向量是不同的轉換，圖上的小格僅表示向量維度。

**轉場：** 但理解一句話，不能只看每個 token 本身。

## 09 · attention · Attention

**3:20–4:05 · 45 秒**

Transformer 用 attention 讓目前位置參考相關的上下文。畫面以一張較大的 causal map 為主，右側保留 human 這個 query 對四個已知位置的權重；三次手動狀態依序切換 heads；亮度是教學示意，不是模型實測。對本場的 causal decoder，位置只能讀取自身與前面的 token。畫面持續以 human 為目前位置：Q 比對自己與之前位置的 K，得到權重後整合對應的 V。矩陣每個橫列表示 query，欄表示 key；藍框標示 human 的 query 橫列，右上斜線格禁止讀取未來。示意矩陣加入後續位置，讓遮罩的範圍更清楚。Q、K、V 先介紹為查詢、鍵與值，稍後再看它們如何帶來資料搬移。

**轉場：** 讀過問題後，模型還不會一次吐出整篇答案。

## 10 · generation · 逐 Token 生成

**4:05–5:00 · 55 秒**

模型產生下一個 token 的分數，轉為機率後按策略選出一個 token；greedy 與 sampling 都是可能的選擇。將新 token 加入上下文，重複執行，直到 EOS、長度限制或其他停止規則。這裡示範標準自回歸生成，不包含 speculative decoding 等多 token 技術。

完整 prompt 的 prefill 產生第一個輸出 token 所需的 logits；後續 decode 延續生成。五個步驟依序選出 Our、shared、connections、句點、EOS。畫面只保留本輪的三個候選機率與輸出句子。候選標籤持續可見，取樣出的單一輸出字從右側取樣口沿曲線落入句子，途中繞過已生成的文字。若提早推進，前一個字從當前位置收束落位，不會突然跳到終點。由講者口述：新 token 加回上下文後，下一輪重新計算分布。最後一步 EOS 另置，不併入文字回答。支援 streaming 時，文字可以邊生成邊回傳，不必等 EOS。分布數字是示意，並未執行模型推論。

**轉場：** 這個重複迴圈，會在什麼樣的硬體上發生？

## 11 · gpu-title · GPU Architecture

**章節轉場**

以 Webb First Deep Field 作短暫的章節呼吸，接著切到 GPU 架構。影像只作宇宙視覺主題，不用它類比實體 GPU 結構。停留時間併入 GPU 段落。

## 12 · gpu · GPU

**5:00–5:35 · 35 秒**

本場以 NVIDIA CUDA GPU 為例。GPU 由多個 SM 組成。先看整顆 GPU，再把鏡頭推向選中的 SM；周圍 SM 隱去；放大後能看見 scheduler、CUDA cores、Tensor Cores、registers與shared/L1的位置，第三步再突出運算元件。放大後保留左側 GPU 定位縮圖，指明這顆 SM 原來所在的位置。CUDA cores 處理一般算術；Tensor Cores 加速矩陣乘加。不要把一個 request 對應成一個 CUDA core；模型的一次運算會展開成大量平行工作。

**轉場：** 硬體要平行執行，程式也得把工作拆開。

## 13 · warp · Thread / Warp / Block

**5:35–6:10 · 35 秒**

CUDA 的 threads 組成 blocks，blocks 組成 grid。每個 block 在一個 SM 上執行，同一個 SM 可容納多個 blocks，受資源限制。從Grid選中Block 4，放大後把64個示意threads分成兩個32-thread warps，再放大Warp 0。左側Grid定位保留，讓聽者知道現在看的物件來自哪裡。NVIDIA 的 warp 是 32 threads 的執行群組；不是一個 core，也不代表所有 GPU 廠商都使用相同寬度。同一 block 的 threads 可以共享資料與同步。

**轉場：** 平行工作之外，資料放在哪裡一樣重要。

## 14 · hierarchy · Memory hierarchy

**6:10–7:00 · 50 秒**

從每個 thread 使用的 registers，看到 SM 內的 shared memory／L1，再到多個 SM 共用的 L2，最後是容量大的 global memory。資料中心 GPU 常使用 HBM；其他 GPU 可能使用 GDDR。模型 weights、activations、KV cache 的大部分資料會落在 global memory。

這是概念層級圖，不是所有存取都固定經過同一條路；shared memory 和 L1 在多代架構中共用可配置片上資源。Registers 使用過多也可能降低能同時駐留的工作數。記住一件事：計算很快，搬資料也有成本。

**轉場：** 第一個系統問題：如何讓 GPU 有足夠的工作可做？

## 15 · batch-title · Continuous Batching

**章節轉場**

Cartwheel Galaxy 作為章節開場。問題保持簡短：「如何讓硬體持續有工作？」接著進入權重重用與獨立 requests 的圖解。停留時間併入 batching 段落。

## 16 · batch · Batching

**7:00–8:05 · 65 秒**

同一請求的 token 有前後依賴，不同使用者的請求則可以一起計算。Batching 把多個 requests 的工作組合，增加平行度，也讓同一份模型權重服務更多 token，攤薄權重讀取成本。它不代表把不同人的上下文混在一起，每個序列仍有自己的狀態。

吞吐量是單位時間完成多少工作；單一使用者的延遲是等待多久。更大 batch 不保證每個人的回答都更快，排程還要考慮服務目標與記憶體容量。

**轉場：** Batch 可以一起開始，卻不一定一起結束。

## 17 · static · Static batching

**8:05–9:55 · 110 秒**

以 A／B／C 分別需要 10／30／50 個輸出 tokens 為例，D／E 需要 40／20 個，先留在佇列。第一步 t = 0 同時開始，第二步 t = 5 看見三個 requests 每輪推進。第三步到 t = 10，A 完成，B、C 各完成10 tokens；第四步仍停在 t = 10，強調 A 後方的空槽與 D 前面的阻擋。這個 static batch 要等到 C 在 t = 50 結束，才接納下一批。

數字是解釋排程的教學工作量，不是實測效能。不同 iteration 的實際耗時不必相等，這裡比較的是接納新請求的邊界。已完成的 request 是否能先回應，也依系統實作；此圖重點是不能將新工作補進同批空位。

**轉場：** 模型本來就一輪一輪執行，為什麼一定要等整個 request？

## 18 · continuous · Continuous batching

**9:55–12:00 · 125 秒**

切頁第一步仍是剛才的 t = 10，保留佇列與空槽，只交接政策。第二步才讓 D 從右側佇列移入 A 留下的空槽，沒有倒帶。A 的已完成區段留在時間軸上，B、C 的狀態與已生成內容保留；新的排程政策從這個 iteration 邊界接手。先讓跨頁變形完成，再指著同一條時間刻度解釋「排程單位由 request 改成 iteration」。

第三步到 t = 30，B 完成，E 從佇列接上 B 的空槽；D 已完成的 20／40 tokens 不會歸零。最後到 t = 50，C、D、E 都完成，連同先前的 A、B，五個請求全部結束。沿著 D、E 的移動講述補位，讓觀眾看到每次接納新工作都保留其他請求的進度。

Orca 在 OSDI 2022 提出 iteration-level scheduling，搭配 selective batching；後來常以 continuous／in-flight batching 描述這類動態組批方式。它減少空位等待，改善利用率與吞吐。實際系統仍需安排新請求的 prefill、KV 容量與延遲預算；圖中是核心機制的簡化示意。

**轉場：** 填滿 GPU 之後，仍可能有另一種等待：等待資料。

## 19 · flash-title · FlashAttention

**12:00–12:20 · 20 秒**

Pillars of Creation 作為 FlashAttention 開場。先不急著解釋演算法，只留下問題：同樣的 attention，為什麼換一種計算方式就能更快？答案要從計算與搬移的相對成本開始。

**轉場：** GPU 的效能，會被不同的天花板限制。

## 20 · bottlenecks · Compute-bound

**12:20–12:55 · 35 秒**

只顯示一顆持續忙碌的 compute chip。資料包沿輸入埠持續抵達；口述 compute-bound 的意思是運算吞吐成為主要限制，可從運算量、精度、kernel 效率與硬體算力著手。畫面不再與 memory-bound 並列。

**轉場：** 如果同一顆晶片開始等資料呢？

## 21 · memory-bound · Memory-bound

**12:55–13:30 · 35 秒**

保留相同晶片形狀，改成資料到達之間有空檔，compute cells 只短暫啟動。Memory-bound 指頻寬成為主要限制；可以減少搬移、提高重用或改善頻寬。不要說升級 GPU 沒用；精確說法是只增加 FLOPS、沒有改善頻寬，幫助有限。這裡忽略 launch latency、通訊等其他限制。

**轉場：** Roofline 把兩種上限放到同一張圖。

## 22 · roofline · Roofline

**13:30–15:00 · 90 秒**

先讀座標：橫軸 arithmetic intensity，是每搬移一 byte 做多少 FLOPs；縱軸是達成的 FLOPs/s。斜線是記憶體頻寬 B 乘上 intensity I，水平線是硬體的峰值計算效能 Ppeak，因此 P ≤ min(Ppeak, B × I)。兩線交界是 ridge point，I = Ppeak / B。

先指左側：工作量中的資料搬移比例高。第二步沿橫軸向右，以「同樣 FLOPs、減少 HBM bytes」提高 I；這與稍後 FlashAttention 的優化方向一致。第三步靠近水平上限，指出單靠增加 I 也不能超越 Ppeak。這是上限模型，不是保證實測達到；圖上位置是概念示意，不帶特定 GPU benchmark 數值。

**轉場：** 接著把 attention 的資料搬移放進這個框架。

## 23 · standard · Standard attention

**15:00–16:30 · 90 秒**

Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V。QKᵀ 形成 N×N 分數矩陣，softmax 後再乘 V。傳統分開執行各算子的實作，往往把大型中間結果寫到 HBM，再讀回來做下一步。序列長度加倍，這塊中間矩陣元素數變成四倍。

依序指向 scores、寫入與讀回三個狀態，而不是逐項推導公式。問題不只是乘法多，也可能是龐大中間結果反覆穿越記憶體層級。後面的「不儲存」不代表 attention 的所有配對計算消失。

**轉場：** 能不能算出答案，卻從未把這張大表完整寫出去？

## 24 · tiling · Tiling

**16:30–18:20 · 110 秒**

FlashAttention 把 Q、K、V 切成 tiles，將能放進快速片上 SRAM 的部分帶進來。逐塊計算 scores、softmax 相關狀態與輸出累積，融合原本分開的操作，避免把完整 N×N 中間矩陣 materialize 到 HBM。

固定一組 Qᵢ，四次依序掃描可見的 Kⱼ/Vⱼ，片上顯示當前 tile 與 mᵢ/ℓᵢ/oᵢ，左側 HBM 縮圖交代資料來源。第五個畫面保留SRAM脈絡，顯示 Oᵢ 寫回；下一組 Q 要重設自己的摘要。跟著同一塊資料完成載入、計算、合併，再換下一塊；不要只說「變小塊所以更快」，關鍵是小塊留在快速記憶體內重用、減少 HBM I/O。Q/K/V 仍需讀取、輸出仍需寫回，HBM 並沒有消失。

**轉場：** 但 softmax 的分母需要整列資料，怎麼能只看一塊？

## 25 · softmax · Online softmax

**18:20–19:50 · 90 秒**

Online softmax 不必先保存整列 scores，而是持續維護三種狀態：目前最大值、指數和，以及加權輸出累積值。下一塊出現更大最大值時，舊累積值要按新基準重新縮放，然後加入新塊貢獻；最後完成正規化。

五步先介紹 m／ℓ／o 的三個短標籤，再合併三塊，最後正規化。摘要旁保留當前 tile 的 scores及V，旁邊用「舊累積×α＋新貢獻」提示合併方式，讓聽者能看見輸入與狀態的關係；完整推導留在這裡供講述。先口述「每塊各做 softmax，分母是否相同」這個問題。一次 tile 合併會更新全部三項摘要：scores 為 [1, 2]、[3, 0]、[2, 4]，對應 V 為 [2, 4]、[1, 3]、[5, 2]。第 1 塊 m=2、ℓ≈1.368、o≈4.736；第 2 塊 m=3、ℓ≈1.553、o≈2.892；第 3 塊 m=4、ℓ≈1.707、o≈3.740，最後 O=o/ℓ≈2.192。這裡 o 表示尚未除以分母的加權輸出累積，O 才是正規化後結果。實際 head 的 V/o/O 是向量，圖採單一維度以方便講解。

用畫面上的 α 口述兩次重新縮放；數字不是要觀眾心算，而是讓「新 max 會使舊累積重新縮放」成為可觀察的變化。不要把 ℓ/o 在某一步變小誤解成丟掉先前資料。Exact 指數學上等價的 dense attention，不是近似或捨棄注意力連線；浮點運算順序不同仍可能造成微小數值差異。

**轉場：** 我們省下的究竟是什麼？

## 26 · flash-result · FlashAttention 的取捨

**19:50–21:00 · 70 秒**

對照三件事：dense attention 的漸近計算量仍是 O(N²d)；不用儲存完整 N×N 中間矩陣；HBM 讀寫量減少。效益主要來自 IO-aware 的演算法與 kernel 實作，而不是把 attention 換成近似版本。

連回 Roofline：減少 HBM bytes，能提高對該層記憶體計算的有效 arithmetic intensity。不是保證任何序列長度、GPU、dtype 都有同一倍速，也不宣稱整個模型必然從 memory-bound 變成 compute-bound。

**轉場：** 算得更有效率之後，另一種記憶體還會一直長大。

## 27 · paged-title · PagedAttention

**21:00–21:15 · 15 秒**

以 NGC 604 的 Webb 影像開啟章節。FlashAttention 關心計算過程的 I/O；PagedAttention 關心生成過程的 KV cache 如何存放與共用。接下來會看到一個熟悉的作業系統概念。

**轉場：** 先看模型為什麼需要「記住」先前的計算。

## 28 · kv · KV cache

**21:15–22:10 · 55 秒**

生成新 token 時，attention 需要先前 tokens 的 K 與 V。將它們快取，可以避免每一步都重新計算整段前綴。新的 token 繼續把自己的 K/V 加入 cache，於是 cache 隨序列長度成長。

這是計算重用，不是把整段 attention 的答案都保存，也不代表後續步驟不需要讀取先前 K/V。KV cache 的大小與 layers、KV heads、head dimension、dtype、token 數及同時 requests 數有關。

**轉場：** 一段看起來不長的對話，可能佔多少空間？

## 29 · kv-scale · KV cache 的容量

**22:10–23:15 · 65 秒**

這是一個**假設性 MHA 教學模型**，不是特定產品的記憶體報告：32 layers、32 KV heads、head dimension 128，K/V 用 BF16，每元素 2 bytes。每個 token 的 KV 為 2 × 32 × 32 × 128 × 2 = 524,288 bytes = 512 KiB。4,096 cached tokens 就是 2 GiB；16 個同長 request 合計 32 GiB。

式子的第一個 2 是 K 和 V，最後的 2 是 bytes／element。這只計 K/V 張量，不含模型權重、activations、metadata、padding；未做 prefix sharing、KV 壓縮或跨 GPU 分片。GQA／MQA 使用較少 KV heads，結果會不同。畫面第一步只顯示 2 GiB 與單一 request 的 token 數，第二步只顯示 32 GiB 與 16 requests；每個 request 佔 2 GiB，總計 32 GiB。讓大數字停留一下。

**轉場：** 容量已經很珍貴，連配置方式都不能浪費。

## 30 · fragmentation · Fragmentation

**23:15–24:25 · 70 秒**

連續配置有三種浪費：為不確定的最終長度預留太多，實際沒用完；可用空間分散，湊不成需要的連續區域；相同 prompt 的多個序列各存一份相同 K/V。分別指向圖上的空白尾部、散落空洞與重複前綴。

內部碎片與未來尚未使用的 reservation 可分開描述：前者最終可能永遠不用，後者即使日後會用到，當下仍無法借給別人。這是早期或採連續配置的 serving 管理方式，不是所有現代系統的必然行為。

**轉場：** OS 已經教過我們，邏輯連續不等於實體連續。

## 31 · kv-cut · KV blocks

**24:25–24:45 · 20 秒**

只看一條被切成固定大小 blocks 的 KV strip。L0、L1、L2 是同一個 request 的連續 logical blocks；每個 block 16 tokens 是本例的配置單位。先說明切塊，再前進到映射表。

## 32 · block-table · Block table

**24:45–25:05 · 20 秒**

一頁只放一張 table。先指出 L0→P7，再揭示 L1→P2、L2→P10。Logical index 連續，physical index 不必相鄰。不要把這個機制誤稱為直接使用 OS 缺頁中斷。

## 33 · paging · Physical blocks

**25:05–25:45 · 40 秒**

PagedAttention 將 KV cache 切成固定 token 數的 blocks。每個 request 有 block table，記錄 logical block 到 physical block 的對應。依序讀取的上下文，可以放在不連續的實體位置；kernel 根據映射找到相應 K/V，完成 attention。

左側保留block table，右側是physical memory bank；依當前logical block，沿連線查到對應位置。三個手動狀態分別讓 L0、L1、L2 落入 P7、P2、P10。這是受 virtual memory／paging 啟發的 KV 管理與 attention 機制，不是直接把 OS 的 page table 或缺頁中斷搬過來。論文由 vLLM 團隊於 2023 年提出。

**轉場：** 有了 block table，新的 token 不再需要預留整條長序列。

## 34 · growth · 按需配置

**25:45–26:50 · 65 秒**

以當前 physical block 為主，P7 填滿後縮至左側作參照。沿四個狀態追蹤同一個 request A：14 tokens 時仍有兩格可用；16 tokens 剛好填滿；第三步鏡頭改看從 free pool 取出的 P2（此時尚未寫入），口述更新 L1→P2；第四步才寫入第17個 token 的 KV。P2 對應從 16 開始的 token indices（0-based），配置會使 free pool 少一塊。先填當前 block，滿了才配置另一個 physical block，並更新 mapping。圖中採 16 tokens／block 作示例；實際大小是系統設計與配置的選項。這樣避免替未知的最終長度一次預留巨大連續空間。

最後一個 block 仍可能未滿，所以不是零浪費。Request 完成或取消時，系統可回收不再被引用的 blocks，供新請求使用；若還有其他序列共用，須等引用解除後再釋放。

**轉場：** 回到完整的 P7，現在讓另一個 request B 指向相同前綴。

## 35 · sharing · Prefix sharing

**26:50–28:00 · 70 秒**

當多個生成序列共用相同的已計算前綴，可以讓 block tables 指向相同 physical blocks。前頁 P7 縮圖放回主圖，P2 則縮到右側，延續 request A 的第17個 token。A/B 是 P7 的引用埠，右側 ×1→×2 是引用數；第三步再揭示 B 的私有 P10 縮圖。共享建立後，refcount 從 1 增至 2；只有引用降為 0 的 block 才可回收。後續 token 分歧時，各自延伸；對仍被共用且需要修改的 block，使用 copy-on-write 保留正確性。分享的是相同前綴所對應的 K/V，不是文字任意一段相同就一定可共用。

收束因果：更少碎片與重複，能容納更多 requests；更多可用的 batch 工作量，有機會提高吞吐。PagedAttention 管配置與存取，continuous batching 管排程，兩者相互支援。

**轉場：** 現在重新按下那一次 Enter。

## 36 · systems-title · A Systems Perspective

**章節轉場**

Stephan’s Quintet 收束三個技術章節，回扣同一個 request。下一頁逐步走過 Tokenize、Schedule、Prefill、Decode、Complete。停留時間併入系統全貌段落。

## 37 · systems · 一次請求，系統的視角

**28:00–28:35 · 35 秒**

上方持續保留Tokenize→Scheduler→GPU→Streaming流程。下方五個狀態依序顯示prompt tokens、queue、prompt KV、本輪新增 KV、free pool。用五次推進追蹤開場的問題：第一步 tokenize 與 queue；第二步 scheduler 與 continuous batching；第三步 prefill、FlashAttention 與 PagedAttention 管理的 KV；第四步 decode 與 streaming，迴圈回到 scheduler；第五步 EOS / 長度上限，解除引用並回收不再共用的 blocks。畫面中的 request 沒有其他共用引用，因此最後全部回到 free pool。

整個過程可持續 detokenize 與 streaming；完成不是第一個回傳文字的時點。具體系統中 tokenize 與 admission／排程的邊界可能不同。圖上示範 FlashAttention 對 prefill 的典型用途，不表示它只能用於 prefill。

**轉場：** 同一請求的前半段與後半段，工作形狀也不同。

## 38 · phases · Prefill

**28:35–28:45 · 10 秒**

只顯示一個 KV cache。Prefill 平行處理已知 prompt，建立五組 K/V，並產生第一個輸出 Our。足夠工作量時常偏 compute-bound。下一頁才顯示 Decode，避免左右比較兩套圖。

## 39 · decode · Decode

**28:45–29:00 · 15 秒**

三次手動推進是同一個 request 的 t₁、t₂、t₃。輸出 Our / shared / connections 依序回到下一輪輸入；文字走 cache 外側的回傳路徑，不穿過 K/V 標籤。每輪只增加一格 KV。淡色是既有資料，藍色是本輪新增，空格只表示尚未寫入。小 batch decode 常受頻寬限制，實際瓶頸仍取決於工作量與硬體。

**轉場：** 這些機制背後，就是我們學過的系統基礎。

## 40 · takeaway · ML Systems

**29:00–29:40 · 40 秒**

畫面第一步保留三個技術名稱與一句回扣，第二步在右側逐項補上對應的三門基礎，技術名稱持續可見。以下三個問題全部由講者口述：誰先算？每輪重新排程，用 continuous batching 補入新請求。資料怎麼搬？FlashAttention 在片上完成分塊，減少 HBM 存取。記憶體怎麼放？PagedAttention 按需配置 KV blocks，重用相同前綴。

第二步顯示對應課程：作業系統、計算機組織、虛擬記憶體。這些基礎沒有退場，它們讓相同的模型能服務更多人。

回應開頭的問題：AI 的進步不只來自模型本身，也來自讓模型運作的整個系統。這就是 ML Systems 的價值。

**轉場：** 讓最後一句落下，不再加新概念。

## 41 · closing · System Is All You Need

**29:40–30:00 · 20 秒**

以 Unsplash 的海岸極光回應開場 NASA Webb 的宇宙觀測影像，讓標題形成回環。「讓相同的模型，服務更多人」是這場演講的落點。口述收尾：「下一次看見一個 token 出現在螢幕上，希望你也看見它背後的整個系統。」停頓，致謝，進入提問。

## 42 · sources · References

**Q&A／延伸閱讀，不計入 30 分鐘主講**

四組入口：NVIDIA CUDA／GPU performance 文件、Orca、FlashAttention、PagedAttention。詳細連結、計算假設與本次對原稿做的精確性修訂整理在 [SOURCES.md](./SOURCES.md)。若有人問實測加速比，說明本簡報沒有進行效能 benchmark，請依論文工作負載與對照基線解讀數字。

再推進一步顯示八張圖片的來源與使用規範，包含六張宇宙章節影像。封面是 NASA Webb Cosmic Cliffs，署名 NASA, ESA, CSA, STScI，屬 NIRCam 紅外觀測合成影像。結尾為 Oskar Kadaksoo / Unsplash 的海岸極光攝影。兩張素材均從原圖縮製為 4096px，只做裁切、縮放與明暗遮罩。
