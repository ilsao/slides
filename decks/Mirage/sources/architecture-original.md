# Three-Layer Training Framework Correctness Testing Architecture

## Layer 1 — State Transition Sampler & MR Selector

### 1. Canonical Program Generation

**定義：**

- $\mathcal U$：待測的 API Pool。
- $u\in\mathcal U$：選定的 Target API。
- $P_0$：由 LLM 生成、包含 Target API 的 Canonical Training Program。

**流程：**

1. 從 $\mathcal U$ 選取 Target API $u$。
2. 利用 LLM 生成 **Canonical Program** $P_0$，使用合法且預設的 training configuration，作為後續 State Exploration 與 Program Generation 的起點。
3. 驗證 $P_0$ 可以正常執行，且 Target API 確實被呼叫；若測試 backward correctness，亦須確認相關 backward path 被執行。
4. $P_0$ 作為預設 Source Program，但不強制所有 MR 都以 $P_0$ 作為比較基準。

### 2. Target Training State Sampling

**定義：**

- $\sigma$：Concrete Training State，包含 model parameters、gradients、optimizer state、scheduler state、AMP state、RNG state、DataLoader state，以及必要的 tensor metadata 與 execution context。
- $\alpha$：State Abstraction Function，將 concrete state $\sigma$ 映射為可供測試與 coverage tracking 的 abstract state。
- $m$：本輪預計採樣的 Target State 數量。
- $i$：Target State 的索引，$1\le i\le m$。
- $\phi_i$：第 $i$ 個 Target State Predicate，用來判斷 abstract state 是否符合指定條件。

**流程：**

1. 根據 Target API、目前 coverage feedback 與預期測試價值，採樣 $m$ 個 Target State Predicates：
    
    $$
    \phi_1,\phi_2,\ldots,\phi_m
    $$
    
2. 每個 $\phi_i$ 描述希望觸發的 training state 條件，而非要求特定 tensor 或 optimizer state 等於精確數值。
3. 採樣時考慮：
    - Target API 的合法 training contexts。
    - State dimensions 之間的依賴與限制。
    - 尚未探索的 API × State 組合。
    - 預期 coverage gain 與 generation cost。
4. 對需要跨 program 比較的 MR，保留其所要求的初始條件與語意輸入；允許的差異由 MR 定義。

### 3. Valid State Transition Planning

**定義：**

- $\sigma_0$：Canonical Program 的初始 concrete training state。
- $k_i$：第 $i$ 條 transition sequence 的 action 數量。
- $t$：Transition index，$1\le t\le k_i$。
- $a_t^{(i)}$：第 $i$ 條 sequence 的第 $t$ 個合法 transition action，例如 `backward()`、`optimizer.step()`、`zero_grad()` 或 checkpoint restore。
- $\tau_i=(a_1^{(i)},\ldots,a_{k_i}^{(i)})$：第 $i$ 個 State Transition Action Sequence。
- $\sigma_t^{(i)}$：第 $i$ 條 sequence 執行前 $t$ 個 actions 後的 concrete state，其中 $\sigma_0^{(i)}=\sigma_0$。

**流程：**

1. 對每個 $\phi_i$，規劃由初始 state 到 target state 的合法 transition sequence：
    
    $$
    \sigma_0
    \xrightarrow{a_1^{(i)}}
    \sigma_1^{(i)}
    \xrightarrow{a_2^{(i)}}
    \cdots
    \xrightarrow{a_{k_i}^{(i)}}
    \sigma_{k_i}^{(i)}
    $$
    
2. 規劃的 actions 必須滿足 training framework 的合法操作條件與執行順序，並以達成以下條件為目標：
    
    $$
    \boxed{
    \phi_i\left(\alpha(\sigma_{k_i}^{(i)})\right)
    =\mathrm{True}
    }
    $$
    
3. 每個 target state 必須指定其對應的 execution checkpoint，例如 Target API 執行前、backward 前或 optimizer step 後。
4. 若無法找到合法且可達的 transition sequence，則重新採樣、調整 target predicate，或標記為 unresolved。
5. 此階段只負責規劃候選 transition sequence，實際 State Reachability 由 Layer 3 驗證。

### 4. Metamorphic Relation Selection

**定義：**

- $\mathcal M$：Metamorphic Rule Library。
- $M\in\mathcal M$：選定的 Metamorphic Rule。
- $P$：任意 Training Program。
- $c$：Execution Configuration，包含初始參數、輸入資料、RNG 設定及執行環境等必要資訊。
- $e=(P,c)$：一個 Training Execution Case。
- $e_a,e_b$：一組待比較的 Execution Cases，分別為 Source Case 與 Follow-up Case。
- $\operatorname{Pre}_M$：MR 的 Preconditions，描述適用的 training contexts 與 execution constraints。
- $\operatorname{In}_M$：MR 的 Input Relation，描述兩個 executions 必須滿足的 program 與 input 關係。
- $\operatorname{Obs}_M(e)$：依 MR 指定的 semantic checkpoints，從 execution $e$ 擷取的 observables。
- $\operatorname{Out}_M$：MR 的 Output Relation，描述兩個 executions 的 observables 應滿足的關係。

**流程：**

1. **Applicability Filtering**：根據 Target API、Canonical Program、State Transition Sequence，以及 MR 的 Preconditions、Input Relation 和所需 observables，靜態篩選候選 MR。
2. **MR Ranking**：依據以下因素排序：
    - 預期 coverage gain。
    - 尚未探索的 API × MR 組合。
    - MR 的預測適用性。
    - Generation 與 execution cost。
3. **Fallback**：若不存在適用 MR，保留合法的 State Transition Sequence，交由其他 correctness oracle 或 coverage-only testing 處理，避免犧牲 API Coverage。
4. 此階段的 MR Applicability 只是靜態預測，最終由 Layer 3 動態驗證。

---

## Layer 2 — Training Program Generator

### 1. Training Loop Skeleton Construction

1. 給定 Target API $u$、Canonical Program $P_0$、採樣得到的 Target State Predicates、Transition Sequences 與選定的 MR。
2. 利用 LLM，以 $P_0$ 為基礎，建立可重用的 **Training Loop Skeleton**。
3. 保留基本 training semantics，並標記可注入 State Transitions 的位置：
    - Forward / Loss Computation。
    - Backward / Gradient Accumulation。
    - Optimizer / Scheduler Update。
    - AMP / Gradient Scaling。
    - Checkpoint / Restore。
    - Distributed Training Operations。

### 2. Incremental State Transition Injection

**定義：**

- $P_i$：為第 $i$ 個 Target State Predicate 生成的 Training Program。

**流程：**

1. 利用 LLM（可使用 smaller LM），以 Training Loop Skeleton 為基礎，按照 $\tau_i$ 逐步注入 State Transition Actions，產生 $P_i$。
2. 採用 **Incremental Filling**：
    - 每次注入部分 transition actions。
    - 驗證目前 program 的語法與執行合法性。
    - 根據 execution feedback 修復生成錯誤。
    - 保留 Target API 的相關執行路徑。
3. Program Generation 必須遵守選定 MR 的：
    - Preconditions。
    - Input Relation。
    - Initial Condition Constraints。
    - Semantic Checkpoint Requirements。
4. State Transition 的成功不代表 MR 一定適用，生成時必須避免任意修改不被 MR 允許的 training semantics。

### 3. MR-Compatible Program Pair Construction

1. 對於適合使用 Canonical Baseline 的 MR，以 $P_0$ 作為 Source Program，使用生成的 $P_i$ 作為 Follow-up Program。
2. 對於不適合直接比較 $P_0$ 的 MR，允許建立其他合法的 Source / Follow-up Program Pair。
3. 為兩個 programs 分別設定 Execution Configuration，形成 MR 所需的 execution pair $(e_a,e_b)$。
4. 確保兩個 executions 滿足預期的 Input Relation，且具有可比較的 semantic checkpoints。

### 4. Generated Program Validation

1. 對每個生成的 program 進行初步檢查：
    - 語法與 runtime execution 是否合法。
    - Target API 是否確實被執行。
    - Transition Actions 是否按照合法順序執行。
    - 是否具備到達 Target State 的必要條件。
    - 是否保留選定 MR 的靜態 constraints。
2. 若生成失敗，利用 feedback 進行 incremental repair。
3. 若 program 合法，但選定 MR 不再適用，則重新選擇 MR 或保留為 coverage-only test。
4. 將生成的 programs、execution configurations、target state predicates 與 MR specifications 交給 Layer 3 進行動態驗證。

---

## Layer 3 — Inspector & Correctness Oracle

### 1. Runtime State & API Execution Validation

1. 執行 Layer 2 生成的 Training Programs，並收集 runtime execution traces 與必要的 training states。
2. 驗證：
    - Target API $u$ 確實執行。
    - 必要的 backward path 確實執行。
    - State Transition Actions 合法完成。
    - Target State Predicate $\phi_i$ 在指定 checkpoint 成立。
3. 對實際執行時觀察到的 concrete state $\sigma$，確認：
    
    $$
    \boxed{
    \phi_i(\alpha(\sigma))=\mathrm{True}
    }
    $$
    
4. 若 Target API 或 Target State 未成功觸發，將案例標記為 invalid / generation failure，而不是 correctness violation。

### 2. Metamorphic Correctness Testing

1. 對選定的 MR $M$，使用合法的 execution pair $(e_a,e_b)$ 進行測試。
2. 一個 sound MR 必須滿足以下 correctness property：若兩個 executions 符合 Preconditions 與 Input Relation，則在正確的 framework 實作下，其 observables 應滿足 Output Relation。
    
    $$
    \boxed{
    \begin{aligned}
    &\operatorname{Pre}_M(e_a,e_b)
    \land \operatorname{In}_M(e_a,e_b)\\
    &\Rightarrow
    \operatorname{Out}_M\left(
    \operatorname{Obs}_M(e_a),
    \operatorname{Obs}_M(e_b)
    \right)
    \end{aligned}
    }
    $$
    
3. Inspector 必須先動態驗證 Preconditions 與 Input Relation。只有兩者成立、executions 有效且 checkpoints 可以對齊時，才檢查 Output Relation。
4. Observables 依 MR 需求選擇，例如：
    - Loss。
    - Gradients。
    - Model Parameters。
    - Optimizer Internal State。
    - Scheduler / AMP State。
    - Checkpoint-Restored State。
5. Observable Comparison 必須遵守 MR 指定的 Semantic Checkpoint Alignment，不要求兩個 programs 執行相同數量的 operations。
6. 對數值等價的 MR，使用依據 dtype、operation 與預期數值誤差設定的 tolerance；其他 MR 則使用其指定的 Output Relation。

### 3. Correctness Verdict & Failure Validation

依據 Runtime Validation 與 MR Testing，將結果分類為：

| Verdict | 條件 |
| --- | --- |
| Invalid | Program 無效、Target API 未執行或必要 Target State 未到達 |
| Inapplicable | MR Preconditions 或 Input Relation 不成立，或必要 checkpoints 無法對齊 |
| Pass | MR 適用，且 Output Relation 成立 |
| Suspected Failure | MR 適用，但 Output Relation 不成立 |

對 **Suspected Failure** 進一步執行：

1. **Reproduce**：確認失敗是否可重現。
2. **Minimize**：縮減 program、input 與 transition sequence。
3. **Validate**：重新確認 MR Preconditions、Input Relation 與數值比較條件。
4. **Confirm**：利用其他 correctness oracle 或獨立證據，確認是否為真正的 framework defect。

沒有 MR violation 不代表已證明 framework 正確。

### 4. Coverage & Feedback-Guided Sampling

收集以下 feedback：

| Metric | 定義 |
| --- | --- |
| API Coverage | 已實際執行的 Target APIs / API Pool |
| State Coverage | 已覆蓋的 Target State Predicates / 已採樣的 Target State Predicates |
| Transition Coverage | 已覆蓋的合法 Abstract State Transitions / 已知合法候選 Transitions |
| API × MR Coverage | 已完成有效 MR Testing 的 API × MR 組合 / 已知可行組合 |
| MR Applicability | 適用與不適用的 MR 測試比例 |
| Correctness Feedback | Suspected Failures 與 Confirmed Defects |
| Generation Cost | Program Generation 與 Execution 的時間及資源成本 |

其中，Coverage 的分母若使用已知可行的候選集合，不代表涵蓋所有理論上可能的組合。

**Feedback Loop：**

1. 將 Coverage、Correctness Feedback 與 Generation Cost 回傳 Layer 1。
2. 更新 State Sampling Strategy 與 MR Ranking Policy。
3. 優先選擇：
    - 尚未探索的 API × State × MR 組合。
    - 具有較高預期 coverage gain 的 training contexts。
    - 較可能觸發 correctness bugs 的 state transitions。
    - Generation 與 execution cost 合理的測試案例。
4. 重複執行三層架構，形成 **Feedback-Guided Training Framework Correctness Testing**。