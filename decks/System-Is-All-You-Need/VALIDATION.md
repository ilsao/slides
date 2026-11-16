# Validation

驗證日期：2026-11-16（Asia/Taipei）。此紀錄對應本輪完整審查後的 34 頁、84 個狀態。

## 建置與回歸

- `npm run typecheck`：通過。
- `npx vite build`：正式 Vite 建置通過，NASA Webb 與 Unsplash 兩張高解析影像、講者備註與來源文件正常打包。
- `npm test`：11 個 test files、63 個 tests 通過。
- `tests/browser/live-transition.spec.ts`：5 個 Chrome browser regression cases 通過，涵蓋中斷姿勢、反向導航、reduced-motion、章節透視保持與快速章節切換清理。使用本機 preview server 與已安裝 Chrome，沒有新增套件或修改共用瀏覽器設定。
- `git diff --check`：通過。

## 全套動態巡覽

Playwright 驅動 Chrome headless，逐狀態等待動畫收尾後檢查：

- 正常動效 84 個狀態全部向前，再完整倒退 84 個狀態。
- 8 個章節跳轉、64 次快速交錯按鍵；重新整理後保留 growth 的第 2 個狀態。
- 1024 × 768、390 × 844 各走過全部 84 個 reduced-motion 狀態；每個尺寸另測 3 次觸控導覽及 3 組核心跨頁動效的正反操作。
- 主紀錄含 373 個去重檢查點。最後三項圖解微調後，另做 22 個 Tiling／Sharing 前進、倒退、快速打斷、動畫中縮放、切換減少動態效果及恢復偏好的檢查。
- console errors／warnings、page errors、HTTP 失敗皆為 0；無殘留 outgoing layer 或暫時 morph surface。舞台位於 viewport 內，無水平溢出。圖片等待 decode 後均正常。

完整本機紀錄位於 `output/playwright/runtime-audit.json`（含 followup）。

## 靜態與目視

- 84 個靜態狀態逐一檢查可見文字邊界與 morph keys：無文字超出舞台，無重複 keys，技術圖解無文字碰撞。
- 封面、兩個章節標題及結尾的緊行距觸發文字 line-box 交集；已目視確認實際字形不碰撞，不把同一標題的 line-box 交集當成內容遮擋。
- 已目視全部 84 個狀態的分組總覽，並放大全尺寸檢查 GPU、warp、memory hierarchy、batching、standard／tiled attention、online softmax、Roofline、KV 容量／paging／growth／sharing、系統全流程、prefill／decode、開場／結語與影像署名。
- 針對目視發現再次修正 Roofline 原生下標、Tiling 寫回線接點、R01–R16 紋理、shared physical block 外框與箭頭、decode 欄名、KV 回收圖例。
- 最終 review 載入時瀏覽器錯誤／警告為 0；照片均成功載入。
- review 的逐頁總覽、全部步驟、單狀態放大、前後步驟切換與手機寬度檢查通過。

截圖及檢查腳本只保留於已忽略的 `output/playwright/sia-review/` 與 `output/playwright/sia-tech-review/`。

## 內容核對與限制

- 34 頁的順序與原大綱一致，時間配置維持 2 + 3 + 23 + 1 + 1 分鐘；References 作 Q&A 延伸。
- KV 算例為假設性 MHA 模型：2 × 32 × 32 × 128 × 2 × 4096 = 2 GiB；16 requests 合計 32 GiB，僅計 KV 張量。
- Online softmax 的三組摘要與最後 O ≈ 2.192 已按完整精度計算。示例與限制記錄於 `SOURCES.md`。
- Orca、FlashAttention、PagedAttention、GPU performance 與 NASA 影像使用第一手來源；沒有加入無基線的倍速宣稱。
- 這是 Chrome 功能、狀態及目視驗證，不是 Safari／Firefox 驗證，也不是跨裝置 FPS benchmark。手機維持投影舞台等比例縮放。
- 本輪沒有部署或建立 commit；既有未提交的共用播放器改動予以保留。

## 追加：切換閃爍的中間幀驗證

先前的全套巡覽主要在動畫收尾後檢查 DOM、圖片與資源清理，不能據此判定轉場過程沒有閃爍。本次依使用者回報，改為固定動畫時間與逐幀取樣，直接重現並修正問題。

- **重現證據：** Request → Tokens 與深色 Stage → Request，在 0 ms 時來源頁、目的頁標題、目的頁 scene 的有效 opacity 同為 0；40 ms 時 scene 只有 0.33，畫面先空白再浮現。Static → Continuous 與 Standard → Tiling 的標題也在 0 ms 被重設為 0，新圖解說明另有延遲入口。
- **來源層檢查：** `visibility: hidden` 會被 `stage-viewport` 的 inline `visibility: visible` 覆蓋，不能可靠排除重建的舊頁。本 deck 改以來源層靜態 `opacity: 0` 排除舊頁，不使用會在取消時還原的來源 fade。
- **修正：** 無共享物件的頁面同步交接完整內容；標題、背景與圖解說明不再於每次 remount 重播入口 fade。共享物件仍使用 before-mutation capture 與 FLIP，保留同頁／跨頁、反向與中斷時的幾何連續性。此次未修改共用 Stage／Player。
- **固定時間檢查：** 五組轉場（Request → Tokens、Stage → Request、Continuous → FlashAttention 章節、Static → Continuous、Standard → Tiling）各檢查 0、40、100、200、340、500、800 ms，共 35 個中間幀狀態。修正後目的頁 title／scene／layer 有效 opacity 均為 1，來源層為 0 或已移除；同時目視比對修正前後截圖。
- **自然播放檢查：** 額外使用 `requestAnimationFrame` 取樣至少 60 幀，涵蓋 Standard → Tiling 的變形過程與清理結束。所有取樣幀保持標題與 scene 可見，目的頁 DOM identity 不變，來源頁沒有閃回，且確實觀察到動畫從執行中到清理完成。
- **回歸結果：** `tests/browser/live-transition.spec.ts` 現為 9 個 Chrome cases，全部通過；包含上述中間幀、快速正反向切換、共享物件中斷姿勢、reduced-motion 與清理。27 個 motion／snapshot 單測及 `npm run typecheck` 通過。瀏覽器測試使用本機 Vite 與已安裝 Chrome。

修正前後時間序列位於 `output/playwright/flicker/before.json`、`after.json`；截圖為同目錄的 `before-*.png`、`after-*.png`。這些結果證實已重現路徑的空白幀與舊頁閃回已排除，不代表其他瀏覽器、GPU 或螢幕更新率的效能基準。


## 追加：高解析影像與首頁拼貼

- 封面原圖 14575 × 8441、結語原圖 7872 × 5251，分別縮製為 4096 × 2372 與 4096 × 2732。瀏覽器 naturalWidth 均確認為 4096，沒有使用放大圖。
- 1920 × 1080、deviceScaleFactor = 2 下，封面實際輸出寬 3840 pixels，仍小於原生圖片寬度。已目視封面、結語、影像署名頁及桌面／手機首頁拼貼。
- 透過攔截圖片請求延遲回應，確認播放器等待圖片 decode 完成才出現。之後於封面、結語與來源間快速跳轉，圖片皆已載入，沒有殘留 outgoing layer、page error 或 HTTP 失敗。
- 首頁以 3 × 3 實際投影片填滿封面區，第一頁固定在中心。1440／900／700／390／320px 檢查完整置中及無水平溢出；最終照片套用後再驗 390px，中心誤差小於 0.01px、中央封面完整可見，點擊進入第一頁。
- 最終 `npm run typecheck`、`npm test`（63 tests）、`npx vite build` 與 `git diff --check` 通過。圖片與 UI 檢查紀錄位於 `output/playwright/sia-images/final-check.log`；Retina 截圖為同目錄 `cover-retina.png`。
