# TitanFuzz 講稿與問答

目標：9 分 30 秒，預留 30 秒。頁內按右鍵推進；換頁使用右鍵或 Page Down。

## 01 封面 · 0:10

「大家好，我是羅晨恩。今天介紹 TitanFuzz，用大型語言模型測試深度學習框架，以及我的 PyTorch 重現研究與 DeepREL 比較。」

## 02 研究問題 · 0:30

- **步驟 0：**「更好的測試有不同意思。這次先看兩項：相同搜尋預算下，能探索更多框架程式碼嗎？固定 50 個候選名額，能得到多少可執行的測試？」
- **步驟 1：**「接著再看結果是否可信：CPU 與 GPU 不同，是否真的違反規格？程式正常結束，是否真的代表檢查通過？探索指標本身不能回答這兩題。」

轉場：「先看產生一個可執行測試為什麼不容易。」

## 03 API 組合限制 · 0:45

- **步驟 0：**「a 是 2×3，b 是 3×2，dtype 都是 float32。這裡先把 b 轉置，再送進矩陣乘法。」
- **步驟 1：**「轉置後 b.T 是 2×3，內部維度變成 3 對 2，所以程式無法執行。呼叫語法正確，不代表輸入組合有效。」
- **步驟 2：**「改回 b，內部維度相符，得到 2×2。這只是 shape；dtype 與後續 API 也各有條件。LLM 的價值在於利用程式上下文，提出更多可能成立的組合。」

這是教學示意，不是報告中的實測失敗案例。

## 04 TitanFuzz 架構 · 1:05

- **步驟 0：**「先看全貌：紫色是生成模型與起始程式，琥珀色是搜尋，青綠色是篩選與回存，珊瑚色是差異驗證。原方法先把目標 API 與提示詞交給 Codex，建立 seed bank，也就是有效測試程式池。」
- **步驟 1：**「搜尋控制器選一個 seed，再選 mutation，決定要遮蔽哪一段。Seed 的選擇機率受到結構分數影響。」
- **步驟 2：**「遮蔽後交給 InCoder。它同時參考前後文，補齊成新的候選程式。」
- **步驟 3：**「候選先執行。無效的淘汰；有效的評分後回存。注意兩條回饋：下方回傳程式，上方虛線更新 mutation 的成效，影響下次選擇。」
- **步驟 4：**「有效程式還要做 CPU/GPU 差異驗證。產生的是待判讀警告，不是已確認的 bug；稍後會用 topk 說明為什麼。」

補一句：「這個搜尋分數評估程式結構，coverage 是我們另行量測的結果。」不要在這頁展開 bandit 推導。

## 05 一次完整 mutation · 1:15

- **步驟 0，約 10 秒：**「先從可執行的 torch.mm(a, b) 開始，結果 shape 是 2×2。」
- **步驟 1，約 10 秒：**「只把 arguments 換成遮蔽標記，前面的變數與後面的程式都保留。」
- **步驟 2，約 15 秒：**「假設模型補成 a, b[:, :1]，第二個輸入只取第一欄，現在是 2×3 乘 3×1。」
- **步驟 3，約 20 秒：**「候選成功執行，得到 2×1，可以保留。若補成 a, b.T，則回到剛才的維度錯誤，會被淘汰。補齊後還需要執行篩選。」
- **步驟 4，約 20 秒：**「兩種選擇分開處理：Thompson Sampling 學習哪種 mutation 較常產生有效且不重複的程式，同時保留探索；seed 分數則偏好更深的依賴、更多 API 種類，扣除相同輸入的重複呼叫。其餘 mutation 可遮蔽呼叫前、呼叫後或方法部分。今天只完整示範 argument。」

重要：畫面中的補齊內容是人工編寫的機制示意，不聲稱 InCoder 曾在這次實驗實際生成它。`<SPAN>` 是教學遮蔽符號，需補齊後才是 Python 程式。

## 06 實驗設定 · 1:00

- **步驟 0：**「從六類 API 各抽五個，共 30 個。每個 API 有十個配對重複種子：同一 API 與同一種子下，兩工具各執行一次，所以是 300 組配對、600 個工具執行單位。工具的先後順序也做平衡。每次給 60 秒主動搜尋預算。」
- **步驟 1：**「TitanFuzz 沿用演化搜尋，使用本地 InCoder-1B；DeepREL 使用原生關係驗證和參數變異，找不到接受的關係時可以提早結束。」
- **步驟 2：**「本次先用 Codex CLI 協助撰寫 90 個 seeds，再按 API 規格檢查。這部分、模型載入與重播都在搜尋計時之外。兩工具資源配置政策相同，但 DeepREL 的序列化可能重建數值、丟失非連續 strides，所以我們控制的是起始 metadata，並非每次完全相同的實際 tensor。」

## 07 指標定義 · 1:10

- **步驟 0：**「每 API、每次執行，從候選中不放回抽樣最多 50 個，另行重播。只有成功執行且有呼叫目標 API 的，算有效程式。這不等於 assertion 可信。」
- **步驟 1：**「第一項是新增觸及的 PyTorch Python 原始碼行，去除重複，也扣除共同 seeds 已觸及的行。不是測試程式寫了幾行。」
- **步驟 2：**「第二項是新觸及的 ATen 運算子名稱。ATen 是 PyTorch 內部的 tensor 運算層，每個名稱只計一次，同樣扣除 baseline。」
- **步驟 3：**「第三項固定用有效程式數除以 50。只產生 20 個且全部成功，候選成功率是 100%，但固定名額產出只有 40%。所以這個指標一起反映候選供給與可執行性。」

## 08 結果與分布 · 1:25

- **步驟 0：**「這裡每個 API 等權，藍色是 TitanFuzz、青綠色是 DeepREL。新增 Python 覆蓋平均多 19.31 行。」
- **步驟 1：**「ATen 名稱平均多 4.33 種。三張圖的單位與尺度各自獨立，長度只能在同一張圖內比較。」
- **步驟 2：**「固定 50 名額的有效產出，TitanFuzz 是 50.69%，DeepREL 是 68.42%，差距為負 17.73 個百分點。下方 CI 是兩工具差值的區間，使用分層配對階層 bootstrap。」
- **步驟 3：**「現在切到分布，這裡的長條代表『新增覆蓋為零』的執行比例，和上一個畫面的平均值不同。每工具都有 300 次執行；TitanFuzz 有 189 次為零，DeepREL 有 239 次，因此兩者中位數都是零。TitanFuzz 單次最高達 1,602 行，平均值受到長尾影響。右側改以每個 API 的十次平均比較，有 25 個較高、3 個相同、2 個較低。平均優勢不等於每次或每個 API 都同樣受益。」

高／相同／低是描述性比較，不是顯著性計數。不要把「25 個平均較高」說成「25 個顯著勝出」。

## 09 誤報與漏報 · 1:35

- **步驟 0：**「TitanFuzz 重播共出現 50 次 mismatch，全都來自 torch.topk，按 AST 合併後有 37 個不同程式結構。」
- **步驟 1：**「先看誤報風險。同值的 5 可以選不同索引，sorted=False 的順序也可能不同。這裡不是只靠一個例子猜測：報告已對全部 37 個 AST 做規格判讀，均符合允許的同值索引或輸出順序。這個結果只限本次警告集合，不能推成整個框架的誤報率。」
- **步驟 2：**「現在切換到另一種問題：index_select 從矩陣取第 2、0 欄。生成程式用錯誤 expected 呼叫 torch.equal，但忽略 False，所以仍可正常結束。」
- **步驟 3：**「修正時先按欄位選取規則獨立推導 [[3,1],[6,4]]，再用會拋出錯誤的 assertion 檢查。只有加 assert，卻沿用錯誤 expected，也不夠。」
- **步驟 4：**「所以規格定義什麼算錯，assertion 則確保錯誤真的會被攔下。」

`torch.testing.assert_close` 是這次簡報提供的修正示意，不能聲稱已回頭修改或重新執行原始實驗。對浮點運算仍須依規格選擇合理容差；topk 同值索引不可套用唯一索引的嚴格相等預期。

## 10 結論 · 0:35

- **步驟 0：**「這次設定下，TitanFuzz 的平均探索較廣，但不同 API、不同執行差異很大，固定名額產出也較低。差異警告與生成的 assertions 都需要另外驗證。」
- **步驟 1：**「我的優先順序是先補強規格檢查與 assertions，確保判定可信，再評估 coverage 回饋和有效生成。這樣才能判斷增加的探索，是否帶來真正有用的測試。」

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

## 本輪放映調整

- 全簡報仍為 10 頁、9:30；現有 34 個放映狀態。架構頁多 10 秒，mutation 最後一步少 10 秒。
- 第 6、7 頁切換內容，第 8 頁最後一步改看分布，第 9 頁依誤報、漏報、總結三個場景講述；換場後先用一句話重新定位觀眾。
- 影片式自動播放未啟用。動畫由講者按鍵觸發，約 0.32–0.65 秒，不增加等待步驟。
- 頁尾只放對應方法的原論文引用。本次實驗、判讀及教學示意不引用自己的報告；本文件的來源區只供內部追溯。
