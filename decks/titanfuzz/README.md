# TitanFuzz

11 頁繁體中文研究報告、20 個放映狀態，版本 9。預覽：`/titanfuzz?start=1`。

以 `114550195_tool_study.pdf` 的 PyTorch 2.6.0 重現研究為主軸；背景與搜尋公式依 TitanFuzz 原論文，DeepREL 定位依其原論文。不能將本次研究視為原論文全部實驗的重跑。

## 頁面與節奏

| 頁 | ID | 內容 | 狀態 | 時間 |
| --- | --- | --- | --- | --- |
| 1 | cover | 置中封面 | 1 | 0:10 |
| 2 | testing-before | 傳統 DL framework 測試導入 | 1 | 0:45 |
| 3 | api-level | API-level 流程與限制 | 1 | 0:40 |
| 4 | model-level | 模型層串接與三個關鍵詞 | 1 | 0:40 |
| 5 | method | TitanFuzz 方法與搜尋公式 | 10 | 3:00 |
| 6 | question | 探索更廣，測試一定會更好？ | 1 | 0:30 |
| 7 | deeprel | API-level 比較基準 | 1 | 0:45 |
| 8 | experiment | Experiments | 1 | 0:50 |
| 9 | metrics | Metrics | 1 | 1:00 |
| 10 | results | 結果圖 | 1 | 1:00 |
| 11 | closing | Thanks for listening | 1 | 0:10 |

合計約 9:30。以版本 8 的頁碼為準，原第 2 頁組合示例與第 5 頁歷史案例已移除；第二頁改為傳統測試導入。灰色旁註、統計與研究限制保留於 [SPEAKER_NOTES.md](./SPEAKER_NOTES.md)；證據檔不變。

## 視覺與播放

- 保留黑底、柔白文字、TitanFuzz 藍 `#a6b4ff` 與 DeepREL 薄荷 `#9bdeca`。1600×900 畫布；中文使用思源黑體 TW，英文統一 Helvetica Neue（標題、正文、程式與數字），結尾保留 Allura 花體。
- 研究問題保持白色置中標題與置中兩欄；背景、DeepREL、Experiments、Metrics 均一次顯示，沒有頁內動畫。
- 方法保留十步與原生 SVG 連續鏡頭。在選 seed 與 mutation 回饋步驟替換右側說明為原生 MathML，分別呈現 FitnessFunction 與 Thompson Sampling，保留核心變數定義，其他說明移入講稿。Thompson Sampling 的兩條公式以共用 MathML 表格對齊關係符號；非聚焦元件與文字以淺灰色顯示。
- 第 10 頁進場後 500／920／1340 ms 開始三組圖表，長條各展開 650 ms；數字與差值淡入。回到此頁會重播一次，無循環或手動揭露。
- 換頁沿用 440 ms 轉場。靜態縮圖與減少動態效果模式直接呈現完成狀態，不播放動畫。
- 本次 report 頁面不再顯示左下引用；原論文引用仍保留。
- 方向鍵／空白鍵推進步驟，Page Down／Page Up 整頁切換，O 開啟章節選單，F 全螢幕。
- 首頁九宮格使用新版頁面，封面保留正中央。章節與頁眉依頁面 ID 設定，避免順序變動造成錯配。

`deck.tsx` 管理內容，`Method.tsx` 管理方法流程，`mathml.d.ts` 補足 React 的原生 MathML 型別，`styles.css` 限定此簡報，`motion.ts` 提供專屬轉場。未修改共用播放器。版本 9 保留可識別的既有頁面 ID，舊進度的步驟歸零。`architecture/titanfuzz.json` 保留原始拓撲參考。

## 證據與來源

- 結果數值與 CI 保持原樣：Python 22.75／3.44，差值 +19.31 [7.15, 40.31]；ATen 17.54／13.21，差值 +4.33 [0.35, 8.09]；有效產出 50.69%／68.42%，差值 −17.73 [−24.92, −10.48] 個百分點。
- 三圖為每 API／run 平均，各 API 等權、獨立尺度。CI 是 TitanFuzz − DeepREL 的差值區間，使用 10,000 次分層配對階層 bootstrap；詳細統計與分布移入講稿。CI 與灰色解釋已從結果畫面移除；主要數值、差值及座標單位保留。
- Python 原始碼行與 ATen 名稱都先去重、扣除共同 seed baseline。有效產出固定分母 50，不能混同候選成功率或 bug 數。
- 60 秒只計主動搜尋；準備、載入、獨立重播及 metadata 可比性限制保留於講稿。Codex CLI 底層模型未記載，不能視為與原 Codex 相同。
- [TitanFuzz §1–3、Fig. 1(a)、Algorithm 2、式 (3)](https://arxiv.org/html/2212.14834v4)。歷史案例已從放映移除，只留於備用講稿。
- [DeepREL 原論文](https://www-cs.stanford.edu/~anjiang/papers/FSE22DeepREL.pdf)。畫面只介紹其為本次 API-level 比較基準，關係細節保留於講稿。

本地 [逐 API 彙整](./evidence/api_tradeoffs.csv)、[差值區間](./evidence/hierarchical_effects.csv)、[來源雜湊與摘要](./evidence/provenance.json) 保留，未重跑或變更研究數據。

## 驗證

`npm run typecheck`、36 個測試（既有 32 個及新增 4 個）與 `npx vite build` 均通過。新增測試涵蓋 20 狀態前後導覽、舊版本進度恢復、預覽 ID 與減少動態效果。瀏覽器核對 11 頁／20 狀態、方法十步、原生 MathML、文字邊界、三圖自動入場、章節選單、靜態九宮格與減少動態效果。新版截圖位於 `output/playwright/titanfuzz-v9/`。

## 附帶字型

- 思源黑體 TW：Adobe 官方 [Source Han Sans](https://github.com/adobe-fonts/source-han-sans)，`release/Variable/WOFF2/OTF/Subset/SourceHanSansTW-VF.otf.woff2`，完整台灣字集。
- [Allura](https://github.com/google/fonts/tree/main/ofl/allura)：Google Fonts 官方版本。
- 字型與 SIL Open Font License 位於 `public/fonts/`，播放不依賴外部字型服務。
