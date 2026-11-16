# Version 20 · 快速入軌與提早降速

先查閱 Apple WWDC23 的 keyframe 分軌旋轉及速度連續性示範；具體採用方式見 `APPLE_MOTION_REFERENCES.md`。TypeScript、66 項單測通過。436 個時間取樣檢查逐一入場、從第一個入軌起完整 360°、減速角速度單調下降至每圈 12 秒、切線接續與效果清理。另錄製實際播放並檢查中途切頁。

---

# Version 19 · 放慢入場節奏

飛行、間隔及環繞週期同步延長為 1.5 倍，保留相同路徑與速度接續。TypeScript、66 項單測通過；331 個時間取樣確認逐一入場、待入場隱藏、八個切線接點與清理後的位置連續。

---

# Version 18 · 逐一切線入軌

TypeScript、66 項單測、正式／測試建置與四項相關 Chrome 回歸通過。221 個時間取樣確認同時最多只有一個圖標飛入、待入場圖標隱藏、來源頁無繪製。八個入軌點的前後速度誤差低於 1.5%、方向誤差低於 .015 radians，清理後位置不跳動。已目視八張依序入場圖；詳見 `REVISION_V18.md`。

---

# Version 17 · 轉色與入軌

TypeScript、66 項單測及正式／測試建置通過。25 項既有 Chrome 回歸通過；最後微調軌跡後重跑換頁、開場與 reduced motion 三項亦通過。八個中間幀確認背景連續變深、八個圖標由右上方入場、終點回到原軌道，以及來源頁全程隱藏。過程圖已目視；見 `REVISION_V17.md`。

---

# Version 16 · 開場、圖標與填充連續性

43 頁、108 狀態。TypeScript、66 項單測、正式／測試建置及 25 項建置版 Chrome 回歸通過。新增檢查 D 起始零寬度填充的五個中間幀；八個圖標皆同向同速。全部靜態狀態無 SVG 文字碰撞或瀏覽器錯誤，p2 展開五個過程畫面已目視。詳見 `REVISION_V16.md`；以下保留歷史。

---

# Version 15 · 動畫問題回歸

43頁、108狀態。66項單測、TypeScript與兩種建置通過；既有20項建置版Chrome回歸與新增4項針對本次問題的回歸全部通過。全狀態渲染無SVG文字碰撞、瀏覽器錯誤。細節見REVISION_V15.md；以下保留歷史。

---

# Version 14 · 開場與教學圖解

43頁、107狀態。TypeScript、66項單測、正式／測試建置、20項建置版Chrome回歸通過。全部靜態狀態重新渲染，SVG文字碰撞與瀏覽器錯誤為0。新增chapter造成七組向前淡出；agent環繞為刻意持續的ambient動畫，驗證器將它與可結束的換頁效果分開處理。詳細對照見OPENING_V14.md；原始圖與檢查位於output/playwright/sia-opening/。以下保留先前版本紀錄。

---

# Draw On、章節淡出與中斷連續性 · 2026-11-16 · version 13

42頁、101狀態。圖解改參考WWDC25 SF Symbols 7的Draw On／Whole Symbol（2:19）。scene無父層位移或縮放，以輪廓→填色→標籤構成；新配置P2同樣原位描繪。依新要求，只有六個章節尾頁向前進入星空時，來源連續淡出240ms，之後完全隱藏，新章節標題才開始。其餘邊界與反向仍立即隱藏來源。

- TypeScript、66項單元測試、正式及測試Vite建置、git diff --check通過。開發版19項Chrome回歸通過；補齊CSS batching progress凍結後，最終建置版20項全部通過。
- 全82個正反邊界／574個取樣幀：六組允許的來源淡出在0／40／120ms嚴格遞減、240ms結束，280ms後opacity=0且visibility=hidden；其他來源全程隱藏。新章節標題在來源淡出期間opacity=0。目的slide與scene始終opacity=1，根節點transform=none、clip-path=none，前頁clone數0。
- 每個技術scene自身transform=none，沒有父層animation；圖解子樹實際有動畫。Draw On檢查實際strokeDashoffset由正數至0、fill晚於stroke、標籤沒有transform，0／100／250／550ms的SVG外框完全對齊。P2在0／120／320／840ms中心與尺寸固定。
- 中途token飛行切入章節時，來源glyph首幀transform與切換前一致；快速再切頁會取消來源淡出，不會殘留可見舊層。CSS batching進度條在120ms切章節時，同樣保持當下transform，不先跳到100%。
- 101靜態狀態、505動畫取樣重新擷取，執行錯誤、SVG文字碰撞與來源繪製規則違反均為0。另擷取六個章節淡出及六個圖解進場，共60張0／120／240／400／650ms過程圖並目視。
- 全101狀態正向與反向、8章節、64次快速操作、重新載入恢復、1024×768與390×844的reduced motion／觸控／正常動畫核心配對，共441個檢查點通過。app console錯誤／警告、HTTP失敗、殘留outgoing／surface與過慢收尾均為0。
- 16段1600×900實時錄影，每段90–92個RAF取樣，中位約16.7ms、p95及最大間隔最高16.8ms，無大於25ms的間隔。這是本機Chrome觀測。

原始紀錄與錄影：已忽略的output/playwright/sia-draw/，包括audit.json、motion-all.json、storyboard.json、runtime.json、ux-playback.json與ux-playback.mp4。以下保留前版歷史。

---

# 章節銜接與取消側向進場 · 2026-11-16 · version 12

42頁、101狀態。具體Apple來源與採用方式見APPLE_MOTION_REFERENCES.md。六張章節目的影像平面以720ms展開，內層照片推鏡仍為1.055×→1×／1150ms／mass 2.1；章節標題兩行整組進場，移除分詞遮罩。通用主圖改24px垂直收束，新配置P2以圖心原位展開。

- TypeScript、66項單元測試、Vite正式與測試建置及git diff --check通過。開發版16項動畫回歸通過；最後修正P2後，建置版最終17項Chrome回歸全部通過。
- 全部82個正反換頁／574個取樣幀：來源opacity=0、visibility=hidden，目的slide根節點與scene保持opacity=1，根節點transform=none、clip-path=none，前頁clone數為0。每個技術scene自身的所有進場keyframes水平位移為0；每個技術標題詞組都有動畫。
- 六章節逐一檢查：標題只有一個動畫，兩行沒有各自的動畫；照片內層的起終尺度與1150ms維持原值。24張章節0／160／320／720ms畫面已目視，標題均在舞台範圍內，沒有裁字。
- 42頁／101靜態狀態、505動畫中間幀重新擷取。最後P2修正後重新擷取完整505幀；執行錯誤、SVG文字碰撞與來源殘留檢查失敗均為0。P2另以0／120／320／840ms檢查表面中心，全程偏移小於.1px。
- 完整101狀態正向與反向、8章節跳轉、64次快速操作、重新載入恢復，以及1024×768／390×844的reduced motion、觸控和正常動效核心切換，共441個檢查點通過。app console錯誤／警告、HTTP失敗、殘留outgoing／surface、過慢收尾均為0。
- 六章節的進入與離開，加一個一般換頁，共13段1600×900實時錄影。每段90–92個RAF取樣，中位約16.7ms、p95最高16.8ms，無大於25ms的間隔。這是本機Chrome觀測。

原始紀錄與錄影位於已忽略的output/playwright/sia-depth/：audit.json、motion-all.json、section-review.json、runtime.json、ux-playback.json、ux-playback.mp4。下方保留前版歷史。

---

# 全頁換頁覆蓋修復 · 2026-11-16 · version 11

修正上一輪漏套用的路徑：shared-objects分支原先跳過通用pageLayers；一般技術標題也未採用文字揭示。現在所有頁面共用同一換頁入口，技術頁／References／takeaway的標題詞組都執行420ms揭示，間隔55ms；封面／結語逐行揭示。開場專屬分鏡與Section圖片動畫保留。

- 82個正反換頁新增直接覆蓋檢查：每個技術頁的scene本身都有動畫，每個技術標題存在非空詞組且所有詞組都有動畫。沒有只用「頁面上某處有animation」代替覆蓋檢查。
- 同一入口先啟動父層，再量測FLIP。矩陣→tile及P7/P2主圖／縮圖的首幀位置、中途反向與快速切換回歸通過。
- 15項Chrome回歸在開發版與建置版通過；66項單測、TypeScript、正式／測試建置及git diff --check通過。
- 42頁全部101靜態狀態與505動畫中間幀重新擷取，無SVG文字碰撞／執行錯誤；82個邊界共574幀，根節點與scene保持不透明，來源隱藏，無前頁clone。
- 完整正反巡覽、8章節、64次快速操作與1024／390px檢查共441個檢查點通過，無console錯誤／警告、HTTP失敗、殘留outgoing／surface或過慢收尾。

原始紀錄位於已忽略的output/playwright/sia-universal/。下方保留先前版本驗證歷史。

---

# Apple參考、文字揭示與開場 · 2026-11-16

目前為42頁、101狀態、version 10。先查閱Apple WWDC23的18:15 snappy示範、20:34／21:07阻尼對照、WWDC18 Music Now Playing示範及Keynote Build In文件，再實作。具體來源與分鏡見 APPLE_MOTION_REFERENCES.md。

- 移除標題下灰色敘述的DOM與takeaway灰色thesis；保留圖解內必要標籤。普通換頁改為32px／500ms標題、56px／700ms主圖，主圖critical damping、無尺度起伏。
- Section照片的原始動畫程式保持1.055×→1×、1150ms、mass 2.1。只改文字：每詞組420ms，間隔65ms，完整章節標題約0.65秒內完成。
- 02–05重做為大字ChatGPT／快速提問、Agents三拍接力、深色兩行問題、Model展開System四拍開場。已目視靜態與500ms中途畫面，並另錄六段實時播放。
- TypeScript、66項單測、15項建置版Chrome回歸、Vite正式與測試建置通過。82個正反換頁／574個中間幀的目的根節點與主圖保持不透明；來源opacity=0、visibility=hidden，無前頁clone。
- 42頁全部101個靜態狀態、505個動畫取樣：執行錯誤與SVG文字碰撞均為0。完整正反巡覽、快速切換與大小螢幕共441個檢查點通過，console錯誤／警告、HTTP失敗、殘留surface／outgoing、過慢收尾均為0。
- 六段開場／Section實時錄影各91–92個RAF取樣，中位16.7ms、p95最高16.8ms，沒有超過25ms的間隔。這是本機Chrome的觀測。

原始紀錄與錄影：已忽略的 output/playwright/sia-apple/，包含audit.json、motion-all.json、runtime.json、ux-playback.json、ux-playback.mp4。下方為先前版本歷史。

---

# 教學參考重畫與重量動效 · 2026-11-16

目前為42頁、101個手動狀態，deck version 9。先檢視3Blue1Brown、Hugging Face、NVIDIA、Tri Dao與vLLM的教學圖／動圖，再重畫SVG。來源與逐頁改圖對照見 `TEACHING_REFERENCES.md`；References頁也提供已打包的下載連結。

## 圖解與動效

- 07–09 補完整請求路徑、文字／ID／向量對應，以及有token標籤的Q/K/V heatmap；12–16 補SM功能分區、Grid/Block/Warp包含關係、低延遲／大容量方向及各request的下一token。
- 20–25 用HBM→SM供給路徑、Q/K→scores→softmax×V→O、片上tile計算與scores/V數值，交代資料從哪裡來、在哪裡運算、結果去哪裡。
- 28–39 補token與KV欄位對應、當前Q與輸出、logical blocks的token範圍、table到physical blocks的連線、logical引用與refcount，以及持續可見的系統流程。
- 普通進場採不同質量的阻尼響應：標題48px／620ms；主圖96px水平、8px垂直、1.2%尺度變化／880ms，延遲70ms起動；細節從190ms開始。章節照片從1.055×緩慢推回1×。主圖的位置超越小於1%，沒有反覆彈跳。
- SVG共享物件與camera接續切換前的位置及速度。前頁立即排除繪製，slide根節點與主圖保持不透明；沒有前頁clone、全頁fade或全頁clip。

## 實際驗證

- TypeScript、66項單元測試、15項Chrome動態回歸、Vite正式及測試建置、`git diff --check`通過。新增的3項物理響應單測檢查起點、速度接續與受控收束。
- 全部42頁／101個靜態狀態，以及101個狀態各0/220/500/900/1400ms的505個動畫中間幀均重新擷取。SVG文字碰撞、瀏覽器執行錯誤、主圖不透明檢查失敗均為0。已目視全套頁面、全部改圖狀態與重點大圖，修正KV箭頭穿字、固定Q選取位置、Warp起點及標籤對比。
- 全部82個正反換頁，各取0/40/120/280/520/800/1400ms，共574個邊界中間幀。目的頁根節點與主圖opacity=1，根節點transform=none、clip-path=none；前頁opacity=0、visibility=hidden，clone數0。開發版與建置版回歸均通過。
- 101狀態正向與101狀態反向、8個章節跳轉、64次快速交錯操作、重新載入恢復；1024×768與390×844各101個reduced-motion狀態，加上觸控及縮小舞台核心變形，共441個檢查點通過。執行錯誤、console警告、HTTP失敗、殘留outgoing／surface、過慢收尾均為0。
- 最後的KV連線、K/V載入起點與Prefill逐欄建立微調後，重跑全套靜態／動畫取樣、66項單測、15項建置版回歸與建置。另以1600、1024、390px在正常／reduced motion下對KV、Tiling、Systems、Prefill正反巡覽120個檢查點；固定Q位置檢查25次，教學參考下載HTTP 200，均通過。
- 八段1600×900本機Chrome實時錄影：GPU放大、matrix→tile、growth→sharing、token生成、static→continuous、補入請求、decode迴圈、普通換頁。每段91個requestAnimationFrame取樣，中位幀間隔16.7ms、p95最高16.8ms，沒有超過25ms的間隔。這是此測試環境的觀測，不代表其他瀏覽器或裝置的效能保證。

原始紀錄與預覽位於已忽略的 `output/playwright/sia-grounded/`：`audit.json`、`motion-all.json`、`runtime.json`、`followup.json`、`ux-playback.json`、`ux-playback.mp4`，以及研究用原圖截圖、全套PNG與接觸表。最後的局部微調未變更全域重量動效；其後使用針對性巡覽與完整回歸驗證。

以下保留先前版本的驗證歷史；目前規格、頁碼與時序以上方為準。

---

# 聚焦與脈絡平衡版 · 2026-11-16

目前為42頁、101個手動狀態，deck version 8。技術頁恢復一句短提示，按需要保留局部參照；Online softmax 補上最大值、指數和、加權累積的短標籤。完整講解仍保存在講者備註。

## 動效與畫面

- 普通進場改為短距離水平位移：標題0ms起／320ms、主圖40ms起／420ms、語意細節110ms起／260ms。slide根節點及主圖全程opacity=1，不作整頁淡入淡出。前頁在CSS及callback中立即隱藏。
- 共享SVG物件使用切換前實際可見的矩形接續。矩陣→tile、P7/P2主圖↔縮圖皆檢查首幀幾何；反向與動畫中途切換不會跳回預設起點。
- Token從右側取樣口沿曲線落位，避開既有文字；快速推進時前一字由當前姿勢落位。Batch時間指標、進度與請求進場同步。GPU放大時移除鏡頭外幾何，減少巨大SVG繪製範圍。

## 實際驗證

- TypeScript、63項單元測試、15項Chrome動態回歸、Vite正式與測試建置、`git diff --check`通過。瀏覽器回歸同時在開發與建置版本執行；測試透過公開導航取得頁數與步驟，不依賴開發伺服器的原始碼import。
- 全部42頁／101個靜態狀態與505個動畫中間幀重新擷取。目視檢查全套接觸表與重點大圖；SVG文字碰撞、執行錯誤及不透明主圖檢查失敗皆為0。
- 全部82個正反換頁，各取0/40/120/280/520/800/1400ms，共574個邊界中間幀。目的slide根節點與主圖opacity=1，根節點transform=none、clip-path=none；來源opacity=0、visibility=hidden，前頁clone數0。
- 101狀態正向與101狀態反向巡覽、8個章節跳轉、64次快速交錯操作、重新載入恢復；1024×768與390×844各101個reduced-motion狀態，加上觸控及縮小舞台的核心正反變形，共441個檢查點通過。執行錯誤、console警告、HTTP失敗、殘留outgoing／surface、超時收尾均為0。
- 八段實時播放在1600×900本機Chrome以requestAnimationFrame取樣並錄影：GPU放大、matrix→tile、growth→sharing、token生成、static→continuous、補入請求、decode迴圈、普通換頁。各段約90–92個畫面；幀間隔中位數16.7ms、p95最高16.8ms，沒有超過25ms的取樣間隔。這是目前測試環境的觀測，沒有代表其他瀏覽器或裝置的FPS保證。

原始紀錄與預覽位於已忽略的 `output/playwright/sia-balanced/`：`audit.json`、`motion-all.json`、`runtime.json`、`ux-playback.json`、`ux-playback.mp4`，以及全套PNG與接觸表。最後的softmax短標籤與機率條曲線微調後，已重跑靜態、動畫取樣、型別／單元測試及建置。

以下為先前版本的驗證歷史；頁碼、時序與目前規格以上方為準。

---

# 單一物件精簡版 · 2026-11-16

目前為42頁、101個手動狀態，deck version 7。說明文字移到講者備註；新增 Memory-bound、KV blocks、Block table、Decode 四頁，其他流程透過單一物件與鏡頭／手動狀態接續。

## 實際完成的檢查

- TypeScript、63項單元測試、12項Chrome瀏覽器回歸、Vite正式建置、`git diff --check` 通過。
- 逐頁擷取42頁的全部101個靜態狀態；執行錯誤與文字碰撞皆為0。目視檢查全套頁面與動畫接觸表，修正SM世界座標字距、縮放後的局部揭示位移，以及句點穿過已生成文字的路徑。
- 全部82個正反換頁，在0/40/120/280/520/800/1400ms檢查，共574個邊界中間幀。目的slide根節點始終opacity=1、transform=none、clip-path=none；前頁opacity=0且visibility=hidden，沒有前頁clone。
- 全部101個狀態在0/220/500/900/1400ms檢查，共505個動畫中間幀。前頁暫留、整頁淡入淡出、SVG文字碰撞、瀏覽器執行錯誤皆為0。
- 完整巡覽101狀態正向與101狀態反向；8個章節跳轉、64次快速交錯操作、重新載入狀態恢復；1024×768與390×844各101個reduced-motion狀態及觸控／縮小舞台的核心變形，共441個檢查點通過。執行錯誤、console警告、HTTP失敗、殘留outgoing與臨時surface均為0。
- 專屬回歸涵蓋：單一主要圖解、技術區沒有解說段落、roofline沿折線正反移動、每輪分布不同且只有一個抽樣字、GPU鏡頭與字距、static最後一步及continuous的t=10延續、快速反向姿勢、16格block與B分支時序、Prefill/Decode拆頁，以及六張高解析章節照片。

檢查使用本機Chrome；沒有跨瀏覽器FPS基準。可重現的原始檢查紀錄與預覽位於已忽略的 `output/playwright/sia-focus/`：`audit.json`、`motion-all.json`、`runtime.json` 與全套PNG／接觸表。

下方保留先前版本驗證歷史，頁數與時序以本節為準。

---

# 宇宙章節與分層進場 · 2026-11-16

最新版本為38頁、96個手動狀態。四個新章節頁加在request、GPU、batching、systems之前；FlashAttention與PagedAttention既有章節頁更新為滿版宇宙影像。

- 16項Chrome回歸通過：包含74個正反換頁、每個7個固定時間取樣，共518個中間幀；slide根節點始終opacity=1、clip-path=none、transform=none，outgoing opacity=0，沒有前頁clone。圖解本身可局部揭示，沒有整頁淡入淡出。
- 分層時序：標題0ms、圖解110ms、細節250ms起每項相差22ms（有上限），使用連續緩出。共享圖解的幾何與SRAM框保留，文字細節獨立進場。章節圖片只作輕微縮放，保持不透明。
- 六張不同的NASA Webb宇宙影像均成功decode；五張本機寬4096px，一張3562px。來源為4833×4501、4537×4630、4685×4312、8423×14589、3562×3024、12654×12132的官方原始PNG，先裁16:9再縮製，未放大。
- 已目視六張章節頁、八圖署名頁與0/100/220/400/700/1200ms進場截圖。瀏覽器執行錯誤為0。
- TypeScript、63項單元測試、Vite正式建置、`git diff --check`通過。新圖片已包含於正式建置，講者備註與來源頁碼已同步。

完整巡覽：96狀態正向＋96狀態倒向、8個章節跳轉、64次快速交錯操作、1024×768與390×844各96個reduced-motion狀態、觸控操作與縮小舞台的核心變形，共421個檢查點通過。console errors/warnings、page errors、HTTP failures、殘留outgoing/surface均為0，沒有slow settle紀錄。

本機檢查紀錄與截圖：`output/playwright/sia-cosmos/`（已忽略）。下方為前幾輪驗證歷史，不代表目前的頁碼或進場時序。

---

# 前一輪：前頁暫留修復 · 2026-11-16

本輪依使用者的14項回饋調整為34頁、92個手動狀態，並依後續「前頁暫留」回報移除來源底圖與全頁遮罩。下方舊紀錄保留供追溯；目前實作以此節與 README 的新動效規則為準。

- TypeScript 型別檢查、63項單元測試、正式 Vite build、`git diff --check` 通過。
- Chrome 動態回歸14項通過，包含33個正向與33個反向換頁都有空間動畫、快速反向時的物件姿勢、取消清理、減少動態效果、每輪機率改變、token flight、28→29的 P7/P2 位置保持，30頁五階段揭示，以及快速推進時保留未完成揭示的畫面姿勢。
- 逐狀態檢查本輪14個重點頁：沒有瀏覽器執行錯誤或文字超出1600×900舞台。目視修正08 maps重疊與12金字塔標籤的引線。
- 前頁暫留已重現：原轉場在0ms仍有完整前頁clone，目的頁被100%遮罩；180ms仍有28.8%未揭開。現在移除整頁序列化、clone與遮罩，新頁背景及內容從0ms完整顯示，動畫只移動目的頁的標題、圖解與章節標籤。
- 66個正反換頁各檢查0/40/120/280/520/800/1200ms，共462個中間幀：前頁clone數為0，incoming僅有一張slide，opacity=1、clip-path=none、根節點transform=none，outgoing opacity=0。共享物件與章節透視動效保留。
- 清除09 token flight與回饋線已完成後的CSS fill effects，避免完成動畫長期留在 animation list。靜態預覽及 reduced-motion 直接顯示各狀態。

上一輪完整巡覽：92狀態正向＋92狀態倒向、8個章節跳轉、64次快速交錯按鍵、1024×768與390×844各92個reduced-motion狀態及觸控操作，共405個檢查點通過。console errors/warnings、page errors與HTTP failures均為0；完成後沒有殘留 outgoing layer 或 morph surface。

本次修復前後的固定時間紀錄與截圖位於已忽略的 `output/playwright/sia-no-retention/`；上一輪巡覽位於 `output/playwright/sia-motion-revision/`。Chrome 為本輪驗證瀏覽器；沒有跨瀏覽器效能基準。

---

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
