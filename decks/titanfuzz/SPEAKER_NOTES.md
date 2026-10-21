# TitanFuzz 講稿與問答

11 頁、20 個放映狀態，講述約 9 分 30 秒。只有第 5 頁的方法十步需要頁內推進；第 10 頁圖表進場自動播放。灰色補充說明與 CI 已移入講稿，台上由講者補充。

## 01 封面 · 0:10

「大家好，我是羅晨恩。今天介紹 TitanFuzz，以及我的 PyTorch 重現研究與 DeepREL 比較。」

## 02 TitanFuzz 之前，如何測試 DL framework？ · 0:45

「在引入 TitanFuzz 之前，先看傳統測試框架的流程：產生測試、交給框架執行，再檢查崩潰或結果差異。生成測試有兩個常見層次：API-level 以 API 呼叫為單位；Model-level 以完整模型為單位。接下來分別看這兩種方法的限制。」

此頁是方法分類與流程示意；CPU/GPU 是差異測試的一種設定，不代表所有傳統方法都使用相同 oracle。

## 03 API-level fuzzing 的限制 · 0:40

「先看原論文比較的 API-level 方法。建立輸入、呼叫單一目標 API，再檢查結果。像 FreeFuzz 會從既有程式挖掘有效輸入，變異 shape、dtype 與值。它可以探索很多參數，但前後的 API 執行序列不一定會改變，所以可能錯過跨 API 互動。」

一次顯示。此處描述原論文比較的方法與生成範圍，不宣稱所有 API-level 方法都只能測孤立呼叫。

## 04 Model-level fuzzing 的限制 · 0:40

「完整模型可以串接多個 API，但替換一層仍要維持前後 shape 相容。有的方法需要人工描述 API 限制，有的方法沿用預設模型與生成規則。這些方法能測序列，但模型層與規則限制了 API 及組合多樣性。」

一次顯示。圖為概念示意，Conv2d／ReLU／Linear 表示模型層的串接與相容條件，不是可直接執行的完整模型。

## 05 TitanFuzz 方法流程 · 3:00

- **步驟 0，全圖：**「以一段 torch.mm 程式走一次流程。左邊是原方法架構，右邊用同一段程式說明。」
- **步驟 1，生成：**「原方法由 Codex 依目標 API 產生有效起點，加入 seed bank。」
- **步驟 2，選擇：**「seed 的結構分數是 D 加 U 減 R：偏好較深的資料流與更多不同 API，扣除相同輸入的重複呼叫。先取高分 seeds，再依分數抽樣；不是 coverage 回饋。」
- **步驟 3，遮蔽：**「這一輪選 argument mutation。保留變數和目標 API，只遮蔽參數。」
- **步驟 4，補齊：**「InCoder 假設補成 a, b[:, :1]，取 b 的第一欄，shape 是 3×1。」
- **步驟 5，篩選：**「執行後得到 2×1，保留。另一個 a, b.T 維度不相容，被淘汰。」
- **步驟 6，回存：**「有效且不重複的程式回到 seed bank，成為下一輪起點。」
- **步驟 7，策略回饋：**「每種 mutation 的成功與失敗計數初始都是 1。各從 Beta 分布抽一個 theta，選最大的。這輪執行後，分別加上有效與無效數量，更新下一輪選擇。成功要求有效且不重複。」
- **步驟 8，差異驗證：**「同一份輸入和程式，拿 CPU 與 GPU 比較。差異只是警告，還要按規格判讀。」
- **步驟 9，全圖：**「整個循環擴大程式探索，也產生待驗證的差異。」

公式出處：原論文 §3.2.4 式 (3)、§3.2.2 Algorithm 2。D 是資料流圖最長路徑的邊數，U 是不同 library API 數，R 是相同輸入的重複 API 呼叫。原方法保留最高分 N 個 seeds，再以 softmax 分數抽樣；N 預設為 10。這是搜尋策略，不是模型訓練 loss。

`<SPAN>` 是教學遮蔽符號；程式與候選是機制示意，非本次模型實測輸出。CPU/GPU 必須共用相同輸入資料，不能各自抽取不同隨機 tensor。其他 mutation 可遮蔽 Prefix、Suffix 或 Method。

## 06 我的研究問題 · 0:30

「探索更廣，測試一定會更好？相同主動搜尋預算下，TitanFuzz 是否探索更多框架程式碼與運算子？每個 API 固定 50 個候選名額，又能得到多少可執行的測試？這是兩個不同面向，探索較廣不一定產出較高。」

標題與兩欄置中，一次顯示，無頁內動畫。

## 07 DeepREL · 0:45

「這次研究的比較基準是 DeepREL，它屬於 API-level fuzzing。它會推測並驗證 API 關係，借用已有的有效輸入，再做輸入變異與結果比較。這讓我們可以比較 TitanFuzz 的程式生成搜尋，和以 API 關係引導的測試。」

畫面只保留定位與原理。備用：DeepREL 區分數值等價與執行狀態等價，後者比較成功／失敗狀態。AdaptiveAvgPool3d 與 AdaptiveMaxPool3d 的有效輸入可借用，不表示輸出數值相同。有限樣本的關係驗證不是形式證明。來源為 DeepREL 原論文 §3–4。

## 08 Experiments · 0:50

「本次使用 PyTorch 2.6.0、Python 3.11，六類各抽五個 API，共 30 個。每個 API 做十次配對重複，兩工具各跑一次，所以是 300 組配對、600 次搜尋。90 個 seeds 由 Codex CLI 協助撰寫並先依規格驗證。TitanFuzz 使用本地 InCoder-1B，每個 shard 分配一張 H200、八個 CPU 核心，每次最多 60 秒主動搜尋。」

配置表一次顯示。計時不含種子準備、模型載入、獨立重播；DeepREL 找不到接受的關係時可提早結束。工具先後順序平衡。兩工具控制的是起始 metadata；DeepREL 序列化可能重建數值或丟失非連續 strides，因此不宣稱每次實際 tensor 完全相同。Codex CLI 的底層模型未記載，不視為原論文 Codex 的完全重現。

## 09 Metrics · 1:00

「每個 API、每次搜尋最多不放回抽樣 50 個候選，再獨立重播。新增 Python 覆蓋是有效程式觸及的 PyTorch 原始碼行；ATen 是內部運算子名稱。兩者都去重，再扣掉共同 seeds 已觸及的 baseline。有效產出是有效程式數除以固定的 50，必須成功執行且呼叫目標 API。即使只選到 20 個且全成功，有效產出仍是 40%。」

三欄一次顯示。有效產出兼含候選供給與可執行性，不等於 valid/selected 候選成功率；正常結束也不保證 assertion 可信。Python 覆蓋不等於 C++／CUDA 覆蓋，ATen 名稱數不等於 bug 數。

## 10 實驗結果 · 1:00

進場約兩秒自動展開三張圖，不需要手動推進。

「藍色是 TitanFuzz，青綠色是 DeepREL。每 API、每次重複的結果取平均，各 API 等權。新增 Python 覆蓋多 19.31 行，ATen 多 4.33 種；固定名額的有效產出是 50.69% 對 68.42%，少 17.73 個百分點。原分析也提供工具差值的 95% CI。這次設定支持平均探索增加，但有效產出下降。」

三圖單位與尺度獨立，只能在同圖比較長度。均值為 Python 22.75／3.44、ATen 17.54／13.21、有效產出 50.69%／68.42%。差值 CI 依序 [7.15, 40.31] 行、[0.35, 8.09] 種、[−24.92, −10.48] 個百分點。分層配對階層 bootstrap 細節見備用問答。

## 11 Thanks for listening · 0:10

畫面以置中的 Allura 花體英文收尾，上方 TitanFuzz 與下方細線呼應封面。

「探索指標不是 bug 數，警告與 assertions 仍需驗證。以上是我的報告，謝謝大家。」

## 備用講稿：方法補充、分布、規格與 assertion

### 移除的歷史案例

「這是原論文 Fig. 1(a) 的歷史案例。含負值 tensor 經過 log，產生 NaN，再進 matrix_exp。當時 GPU 路徑沒有正確傳播 NaN；但如果直接建立同樣含 NaN 的中間 tensor，卻不能重現同一個同步問題。關鍵是執行序列，而不只是傳入的值。」

備用口述。來源：TitanFuzz §1–2、Fig. 1(a)。不能稱為本次重現發現，也不能推論目前版本仍有此缺陷。圖為機制重繪，不是能保證重現的最小程式。

### API-level 與 Model-level 的口頭補充

API-level 頁面的圖保留「建立輸入 → 單一目標 API → 檢查」。可口述 shape、dtype、values 的參數變異，FreeFuzz 挖掘有效輸入，以及跨 API 序列不一定改變的限制。Model-level 頁面只保留模型圖與「形狀限制／人工規格／預設結構」三個關鍵詞，細節由講者說明。

### 方法頁刪除的旁註

所有範例都是機制示意，不是模型實測輸出。資料流深度以最長路徑的邊數計算；seed fitness 是結構分數，不是 coverage 回饋。Thompson Sampling 的成功要求有效且不重複。有效變體回存；CPU/GPU 比較共用輸入，差異必須經規格判讀。公式出處仍是 §3.2.4 式 (3) 與 §3.2.2 Algorithm 2。

以下保留原第 8–10 頁的研究限制與證據，不在放映、章節選單或首頁縮圖中呈現。

### 分布與逐 API 差異

每工具 300 次執行；新增 Python 覆蓋為零的次數分別為 TitanFuzz 189、DeepREL 239，兩者中位數皆零。TitanFuzz 單次最大 1,602 行，平均受長尾影響。每 API 的十次平均比較為 25 個較高、3 個相同、2 個較低。這是描述性計數，不是 25 個顯著勝出，也不能把兩種彙整層級混用。

### 誤報與規格判讀

本次抽樣重播的 50 次 mismatch 全來自 TitanFuzz 的 torch.topk，按 AST 合併為 37 個。報告已逐一審查，全由允許的同值索引或輸出順序解釋。不是只靠一個例子猜測，也不能外推整個框架的誤報率。

### 漏報與 assertion

index_select 取矩陣第 2、0 欄，正確結果應為 [[3,1],[6,4]]。生成程式若只是呼叫 torch.equal，卻忽略 False，仍能正常結束。修正應先獨立確認 expected，再用會失敗的 assertion；只補 assert 卻沿用錯誤 expected 仍不夠。torch.testing.assert_close 是簡報修正示意，未回頭修改或重跑研究；浮點容差需按規格選擇，topk 同值索引也不能套用唯一索引預期。

## 備用問答

### 原論文與本次重現有何差異？

原論文使用 Codex 生成起始程式，測試 PyTorch 1.12 與 TensorFlow 2.10。本次聚焦 PyTorch 2.6.0／Python 3.11；以 Codex CLI 0.163.0 協助撰寫三種 seeds（float32、float64、stack/slice 形成的非連續 tensor），共 90 個，先按規格驗證。CLI 的底層模型未在所核對的報告中記載，因此不能宣稱與原 Codex 模型一致。

### 配對與抽樣怎麼做？

從 60 個 API 的 sampling frame 中，依 element-wise、reduction/statistics、shape、indexing、linear algebra、neural-network 六類各抽五個，抽樣種子 20261019。十個重複種子為 2026101901–2026101910。兩工具按 `(API, repetition seed)` 配對，不把 600 個工具執行單位說成 600 組獨立配對。使用完成一組要求重跑替代後的完整資料集；保留原始基礎設施失敗記錄的資訊見來源 bundle。

### 60 秒含哪些成本？

主比較是主動 fuzzing 搜尋預算，不含種子準備、模型載入與獨立重播。搜尋包含產生候選與搜尋中的驗證，DeepREL 無接受關係時可提早結束。兩工具每 shard 都分配 H200 一張、八個 CPU 核心。這不是端到端成本相等的宣稱，也不是以相同 tokens 數比較。

### 信賴區間怎麼算？

原分析使用 10,000 次 stratified hierarchical bootstrap，種子 20261020。在六類各自對五個 API 有放回抽樣，再在抽到的 API 內對十個重複有放回抽樣；兩工具共用配對抽樣索引。六類等權、類內 API 等權。取 TitanFuzz − DeepREL 差值分布的 2.5% 與 97.5% 分位數。CI 是差值區間，不是單一工具的均值誤差棒。方法依 `overview/gen_fig_overview.py` 與報告 Table 1 核對。

### 為什麼不直接說有效率下降？

固定名額產出 `valid/50` 與候選成功率 `valid/selected` 的分母不同。缺額會降低前者。因此這次結果只能支持固定 50 名額的有效產出下降；若要討論無效生成比例，需另看候選成功率。Python 覆蓋只量到 Python 原始碼，不等同完整 C++／CUDA 覆蓋。

### 分布與 API 計數的資料來源？

`evidence/api_tradeoffs.csv` 每列是工具在該 API 的十次平均。新增 Python 覆蓋行數為 25／3／2；新增 ATen 名稱為 26／0／4；有效產出為 4／0／26（TitanFuzz 高／相同／低）。`runs.csv` 每工具 300 列，新增行數為零者分別 189 與 239；兩者中位數皆零；TitanFuzz 最大值 1,602。來源雜湊與摘要在 `evidence/provenance.json`，差值區間在 `evidence/hierarchical_effects.csv`。

### 警告審查與 AST 數的限制？

`specification_review.json` 對抽樣重播中全部 37 個不同 AST 的 topk 警告做事後審查，50 次出現全部由規格允許行為解釋，沒有未解決項。這不是全生成 corpus 的審查，也不能量測漏報率。AST 去重只消除結構重複，不代表每個 AST 對應一種語義或根因。

## 來源

- 主要報告：`/Users/asciibase64/Desktop/Gaspar/NYCU/Software Testing/Midterm Study/114550195_tool_study.pdf`，§1.1、§2、§2.2、Table 1、§3.3、§4。
- 重現證據：同目錄 `report_bundle/runs.csv`、`overview/api_tradeoffs.csv`、`hierarchical_effects.csv`、`specification_review.json`、`reproduction/titanfuzz_worker.py`、`overview/gen_fig_overview.py`。
- TitanFuzz：Yinlin Deng, Chunqiu Steven Xia, Haoran Peng, Chenyuan Yang, Lingming Zhang. **Large Language Models Are Zero-Shot Fuzzers: Fuzzing Deep-Learning Libraries via Large Language Models**. ISSTA 2023, pp. 423–435. [論文 DOI](https://doi.org/10.1145/3597926.3598067)。
- DeepREL：Yinlin Deng, Chenyuan Yang, Anjiang Wei, Lingming Zhang. **Fuzzing Deep-Learning Libraries via Automated Relational API Inference**. ESEC/FSE 2022. [論文 DOI](https://doi.org/10.1145/3540250.3549085)。
- [PyTorch topk 規格](https://docs.pytorch.org/docs/stable/generated/torch.topk.html)。本次研究的規格審查另以安裝的 PyTorch 2.6 文件核對，詳原始 review JSON。
