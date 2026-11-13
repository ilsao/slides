# Mirage — Final Project Proposal

7 頁，15 個放映狀態；主講約 5–8 分鐘。第 4 頁共 9 個狀態：每一層依序為黑底聚焦 → 全頁黑底詳細說明 → 白底總覽。

## 01 / Mirage（30 秒）

這份 final project 探索 tensor representation 與 training state 對深度學習框架正確性的影響。核心問題是：數值、模型與輸入盡量相同時，改變底層表示或訓練狀態，能否觸發原本不容易測到的 correctness bugs？

## 02 / 測試空間（55 秒）

依提案整理，現有測試方法包括 API／input fuzzing、model architecture 與 API interaction，以及 gradient injection。這不是完整文獻分類，也不宣稱既有工作完全沒測過 layout 或 state。我的想法是把 representation 與 training state 提升成主要探索維度。Representation 包含 layout、storage、aliasing 等；state 包含 autograd、checkpoint、compile 等，完整清單只保留在本筆記。

## 03 / 核心觀察（55 秒）

畫面中兩個矩陣的邏輯值完全相同，stride 卻不同。以 A.T.contiguous().T 可建立相同邏輯值、不同 stride 的表示。測試應在符合 transformation 前提時，比較 loss、gradient 等指定結果是否符合預期。不是任意兩個表示或狀態都能直接比較；需要 MR 定義合法比較關係。

## 04 / 三層流程（120–150 秒，9 個狀態）

第一層挑選 API、建立 canonical baseline，採樣目標狀態、規劃 state transitions 並選適用 MR。第二層以 baseline 為基礎，用 LLM 生成狀態變體程式。第三層先驗證 API 確實執行、狀態可達、MR 前提成立，再比較 loss、gradient 或更新後參數。最後把 coverage 與 correctness feedback 回傳採樣器。沒有適用 MR 時保留 coverage，不將任意數值差異當成 bug。

放映時每層先聚焦，再展開說明三個要點，最後收回白底總覽。無需另行口述「目前步驟」。

實作細節僅供問答：generator 可用 training skeleton 與 incremental filling，逐步注入 transition 並修復程式。MR 先依 API 特性、preconditions 與可觀察輸出篩選，再考慮 coverage gain 與成本。這些都屬待實作架構。

## 05 / 發現歸屬（35 秒）

必須清楚說明：這個案例是透過研究流程搭配 Codex 探索、驗證並回報。Mirage 自動化三層框架尚未實作完成，不能把此案例當作框架自動發現 bug 的實驗結果。它是繼續研究這個測試空間的初步動機。

## 06 / PyTorch bug（65 秒）

這是 issue #204407 回報的 conj().imag → slogdet → backward 路徑。對 Z = [[−4i,−i],[−2i,−3i]]，A = Im(conj Z) = [[4,1],[2,3]]。Forward 是 ln|det A|。因為 det A = 10，預期值為 ln(10) ≈ 2.3026，issue 回報的實際值相符；但 issue 的 actual imaginary gradient 是 [[−0.3,0.1],[0.2,−0.4]]，解析解是 [[−0.3,0.2],[0.1,−0.4]]。兩個非對角元素互換，顯示只看 forward loss 會漏掉此案例。

數值出自公開 issue；製作投影片時沒有重新執行 PyTorch。解析梯度另以 central finite difference 檢查。完整 reproducer 保存於 sources/pytorch-204407.json 與原始 issue。

## 07 / 結尾（10 秒）

謝謝聆聽。以 tensor representation 與 training state 作為新的探索軸，是這份 proposal 的核心。接下來進入 Q&A。

# 問答備註（不放映）

## 後續評估備註（不放映）

先實作 PyTorch 單機 eager 的小型原型，聚焦 layout／view／materialization 與 forward／backward。固定 API pool、seeds、初始條件及時間／token 預算，比較隨機合法探索與 coverage 引導。用有效 coverage、可重現且經獨立核對並去重的 bug，以及每個有效測試的成本評估成效。MR ranking 與 incremental filling 的 ablation 可在預算允許時加入。所有評估都屬規劃，尚無量測結果。

研究問題：相同預算下，這套探索方法能否增加有效 coverage，並找到更多 correctness bugs？

## A1 / Tensor representation

Layout: stride、contiguity、storage offset。Storage: identity、新配置與 clone、shared／independent aliasing。Placement: CPU/GPU、pinned/pageable。Materialization: direct save、pack/unpack、offload、recompute。Metadata: view/base、version counter、grad history；lazy conjugate/negative metadata 是可再細分的表示維度。Pinned memory、device movement 或 recomputation 都不是無條件數值等價，需相應 MR。

## A2 / Training state

完整空間涵蓋 autograd、activation checkpointing、offloading、compile、graph lifecycle、optimizer state 與 distributed state。Concrete state 也包括 parameters、gradients、scheduler、AMP、RNG、DataLoader 與必要 tensor metadata/context。測試的是指定 checkpoint 上 φ(α(σ)) 是否成立，不是只看結束時的 loss。

## A3 / MR contract

正式契約：Pre_M(e_a,e_b) ∧ In_M(e_a,e_b) ⇒ Out_M(Obs_M(e_a),Obs_M(e_b))。e=(P,c)，c 包含參數、資料、RNG 及必要環境。通常用 P₀/Pᵢ；不適合時建立其他合法 program pair。範例候選：對 pure slogdet 路徑，把 a 替成 a.clone()；輸入非奇異、相同 leaf 值與配置、無相關 inplace/alias side effects、保留 differentiable clone，對齊 loss 與相對同一語意 leaf 的 gradient。依 dtype/operation 設 tolerance。這是候選 MR，不是 issue 中額外報告的測試結果。detach().clone() 不保留原有梯度路徑。

## A4 / Analytic gradient

Z = [[−4i,−i],[−2i,−3i]]，A = Im(conj Z) = [[4,1],[2,3]]，det A=10。L=log|det A|。對 invertible real A，dL/dA=A⁻ᵀ=[[0.3,−0.2],[−0.1,0.4]]。令 Z=X+iY，A=−Y，所以 dL/dY=−A⁻ᵀ=[[-0.3,0.2],[0.1,-0.4]]。實值 loss 不依賴 X，依 PyTorch 的 complex autograd convention，這對應 z.grad.imag。轉置症狀本身不能證明根因。

## A5 / Sources and limits

- 架構內容來自使用者 brief 與附檔，保存於 sources/architecture-original.md。
- Bug: https://github.com/pytorch/pytorch/issues/204407 ，snapshot 2026-11-13。
- Lazy conjugate: https://docs.pytorch.org/docs/2.15/generated/torch.conj.html 。
- Differentiable clone: https://docs.pytorch.org/docs/2.15/generated/torch.clone.html 。
- slogdet semantics: https://docs.pytorch.org/docs/2.15/generated/torch.linalg.slogdet.html 。
- 本次未執行 PyTorch；未聲稱 GPU reproduction、confirmed root cause、修復、完整 framework 或比較實驗已完成。
