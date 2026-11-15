# Validation

驗證日期：2026-11-16（Asia/Taipei）。

- `npm run build`：TypeScript 與 Vite production build 通過。
- `npm run test`：既有 9 個 test files、36 個 tests 通過。
- Chrome 實際瀏覽：34 頁聯絡表逐組目視檢查；83 個最後／中間靜態狀態做 DOM 字框檢查，無文字超出投影片邊界或文字間碰撞。這是字框幾何檢查，並非宣稱所有形狀相交皆為錯誤。
- 章節選單、下一步、上一步、重新整理恢復進度：實際操作通過。
- 首頁已顯示新簡報與 34 頁資訊。來源頁腳在預覽模式不產生連結，避免首頁播放連結內嵌另一個連結；DOM 確認 nested anchors 為 0。
- 動態排程演示以 t=0/10/30/50 推進，請求 A10/B30/C50/D40/E20 為示意，未宣稱實測效能。
- 靜態檢視使用與播放完全相同的 React renderer；所有 step 狀態可獨立重現。Reduced motion 由共用播放器與 scoped CSS 關閉動畫。
- 技術複核修正：每次只顯示一個新 token、context 與候選分布同步、每個 tile 都包含完整三階段運算、online softmax tile 計數、單序列 decode 的非絕對措辭。
- KV 算式已獨立驗算：2 × 32 × 32 × 128 × 2 × 4096 = 2,147,483,648 bytes = 2 GiB；16 個請求為 32 GiB。僅計 KV 張量。

本機預覽直接使用開發伺服器；沒有部署到外部網站，也沒有建立 commit。
