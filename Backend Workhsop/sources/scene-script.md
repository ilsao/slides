# Backend Workshop — Slides & Speaker Notes

> 16:9｜180 分鐘｜Apple 發布會啟發的深色極簡風格  
> 本文件是投影片製作腳本；完整程式與課後查閱內容請搭配 [Notion 講義](https://app.notion.com/p/sdc-nycu/Backend-Workshop-3dc7dadd804080cab18bc4f2017f8fe3)。

## Design System

- **Canvas**：16:9，背景以 `#050505` 為主；章節頁可使用深藍黑 `#07111F`。
- **Type**：無襯線字體；中文建議 PingFang TC／Noto Sans TC，英文與程式碼建議 SF Pro／SF Mono。標題 48–72 pt，正文至少 28 pt，程式碼至少 22 pt。
- **Color**：主文字 `#F5F5F7`、次文字 `#A1A1A6`；HTTP 使用藍 `#2997FF`、Validation 使用紫 `#BF5AF2`、Database 使用青綠 `#30D158`、Error 使用珊瑚紅 `#FF6961`。
- **Layout**：每頁只有一個視覺焦點；保留至少 15% 四周留白；每張卡片不超過三行主要文字。
- **Motion**：只使用淡入、8–16 px 位移、遮罩揭露、局部高亮與跨頁平滑接續。一般動畫 0.35–0.6 秒，章節轉場 0.8 秒。
- **Code**：深灰編輯器卡片，不顯示多餘工具列；當下講解行保持全亮，其餘程式碼降至 35% 亮度。
- **Accessibility**：資訊不能只靠顏色區分；圖形同時使用文字標籤，動畫結束後須留下完整可讀狀態。

---

## 01 — 從一次點擊開始

**建議時間：2 分鐘｜累計：2 分鐘**

**畫面內容**

- 全黑畫面中央只顯示一顆大型圓角按鈕：`報名 Backend Workshop`
- 下方以極淡小字顯示：`What happens after the click?`

**講者筆記**

- 不先解釋課綱，直接請學員想像自己正在社團網站報名課程。
- 問：「按下去之後，資料去了哪裡？」先接受「送到後端」「寫進資料庫」等直覺回答，不急著修正。
- 說明今天的目標不是背框架語法，而是能完整說出這次點擊背後發生的事。

**動畫／轉場**

- 按鈕由 96% 輕微放大到 100% 並淡入。
- 模擬游標點擊，按鈕短暫壓下；一個藍色光點從按鈕右側飛出，接到下一頁。

---

## 02 — 一個點擊，穿過五個世界

**建議時間：3 分鐘｜累計：5 分鐘**

**畫面內容**

`Client → HTTP → FastAPI → SQL → Database`

- 五個詞橫向排列，中央以細線連接。
- Client 為白色；HTTP 藍色；FastAPI 紫色；SQL 與 Database 青綠色。

**講者筆記**

- 先只顯示 Client，延續上一頁飛出的光點。
- 逐步揭露五個世界，簡短定義它們：畫面發出意圖、HTTP 搬運訊息、FastAPI 接住請求、SQL 表達資料操作、Database 保存結果。
- 告訴學員這條線是整堂課的地圖；稍後每學完一段，都會回來點亮其中一段。

**動畫／轉場**

- 光點沿線由左到右移動，每經過一站才顯示名稱。
- 最後鏡頭拉遠，整條資料流縮至畫面上方，作為下一頁的細線進度指示。

---

## 03 — 今天結束時，你會看懂整條鏈

**建議時間：3 分鐘｜累計：8 分鐘**

**畫面內容**

中央大字：`Read it. Design it. Build it.`

下方依序出現三組成果：

- 看懂 Request / Response
- 設計 RESTful CRUD API
- 用 FastAPI + Pydantic + SQLite 實作

**講者筆記**

- 將講義的學習目標收斂成三件可觀察的能力。
- 強調「看懂」先於「實作」：知道資料在哪裡、誰負責什麼，才不會只是在複製程式碼。
- 預告課堂有短練習與示範，但完整範例都在 [Notion 講義](https://app.notion.com/p/sdc-nycu/Backend-Workshop-3dc7dadd804080cab18bc4f2017f8fe3)，不用急著抄投影片。

**動畫／轉場**

- 三個英文動詞逐字淡入；每次說到一個成果，對應動詞下方出現一條細光線。

---

## 04 — 三小時的路線

**建議時間：2 分鐘｜累計：10 分鐘**

**畫面內容**

以一條水平時間軸呈現：

`Python → Web → FastAPI → Break → REST → Database → Wrap-up`

**講者筆記**

- 快速交代今天的節奏與 10 分鐘休息時間。
- Python 是暖身；主要篇幅在 Web、FastAPI 與 Database。
- REST 放在寫出可運作 API 之後討論，目的是讓學員從「它能跑」進一步走到「它設計得好」。

**動畫／轉場**

- 時間軸由左向右繪出；每一站以同一尺寸圓點呈現，避免像傳統 agenda 的密集條列。

---

## 05 — Before we begin

**建議時間：3 分鐘｜累計：13 分鐘**

**畫面內容**

三張大型狀態卡：

- `Python 3.10+`
- `.venv activated`
- `fastapi[standard] installed`

底部小字：`fastapi dev main.py`

**講者筆記**

- 請學員快速確認 Python 版本、虛擬環境與套件狀態。
- 說明虛擬環境只是隔離本專案的 Python 套件；Windows 啟用指令與 macOS／Linux 不同，細節看講義。
- 若個別安裝失敗，先與鄰座共看或記錄問題，不讓全班節奏卡在單一環境。

**動畫／轉場**

- 三張卡依序由下方滑入；確認一項後，卡片右上角出現細線勾號。

---

## 06 — Python：我們只需要這些

**建議時間：3 分鐘｜累計：16 分鐘**

**畫面內容**

四個大字分佈於四象限：

`Function`　`Type Hint`　`list / dict`　`Exception`

**講者筆記**

- 說明這不是完整 Python 複習，而是先校準後面會頻繁看到的語法。
- 問學員哪一項最不熟，作為講解時的速度參考。
- 指出這四項稍後會分別對應 route function、資料模型、JSON 結構與 HTTP error。

**動畫／轉場**

- 四個詞依順時針順序淡入，最後向中央收攏成下一頁的程式碼卡片。

---

## 07 — Function 是一段契約

**建議時間：4 分鐘｜累計：20 分鐘**

**畫面內容**

```python
def find_course(
    courses: list[CourseData],
    course_id: int,
) -> CourseData:
    ...
```

右側只放三個標籤：`Input`、`Type`、`Output`

**講者筆記**

- 先讀函式名稱，再讀參數，最後讀回傳型別；示範如何不看實作也能猜到它的責任。
- `list[CourseData]` 是一組課程，`course_id: int` 是查找條件，箭頭表示預期回傳一筆課程。
- 強調 Type Hint 幫助人與工具理解，但 Python 執行期不會因此自動拒絕所有錯誤資料；這為後面的 Pydantic 埋下伏筆。

**動畫／轉場**

- 依講解順序高亮函式名稱、兩個參數、回傳箭頭。
- 最後將 `Type Hint ≠ Runtime Validation` 以紫色小字浮現。

---

## 08 — JSON 看起來，就像 Python dict

**建議時間：3 分鐘｜累計：23 分鐘**

**畫面內容**

左右並排：

```python
{"id": 1, "title": "Backend Workshop"}
```

```json
{"id": 1, "title": "Backend Workshop"}
```

中央細字：`Python object ⇄ JSON text`

**講者筆記**

- 說明兩者視覺相似，但本質不同：左邊是 Python 記憶體中的物件，右邊是跨網路傳輸的文字格式。
- `list` 對應 JSON array，`dict` 對應 JSON object；稍後 FastAPI 會協助序列化與反序列化。
- 提醒不要把「Python dict」與「JSON」當成完全相同的東西。

**動畫／轉場**

- 先顯示左側，中央箭頭伸展後顯示右側；往返動畫只播放一次。

---

## 09 — 找不到時，不要假裝成功

**建議時間：2 分鐘｜累計：25 分鐘**

**畫面內容**

```python
raise ValueError(f"Course {course_id} not found")
```

下方大字：`Failure is also information.`

**講者筆記**

- 說明 Exception 是函式表達「無法正常完成」的方法，不只是程式壞掉。
- 連回 `find_course`：查不到課程是一個可預期分支，呼叫端可以捕捉並決定如何回應。
- 預告 Web API 也必須用正確 status code 清楚表達失敗。

**動畫／轉場**

- 程式碼正常淡入；說到找不到時，`not found` 轉為珊瑚紅，背景不閃爍。

---

## 10 — 誰是 Client？誰是 Server？

**建議時間：3 分鐘｜累計：28 分鐘**

**畫面內容**

左側：手機／瀏覽器輪廓，標示 `Client`  
右側：簡化伺服器方塊，標示 `Server`

中央暫時留白。

**講者筆記**

- Client 是主動提出請求的一方，Server 是持續等待並回應的一方；角色由這次互動決定，不單純等於某種硬體。
- Browser、手機 App 都能當 Client；FastAPI 程式在這個案例中扮演 Server。
- Backend 指 Server 端負責驗證、權限、商業規則與資料存取的程式，不等同整台機器。

**動畫／轉場**

- Client 與 Server 從畫面兩側淡入；中央留白維持一秒，再出現問號，引出下一頁。

---

## 11 — 中間發生的事，叫做 HTTP

**建議時間：4 分鐘｜累計：32 分鐘**

**畫面內容**

```text
Client  ── Request ──▶  Server
Client  ◀─ Response ──  Server
```

底部：`GET /courses/1 → 200 + JSON`

**講者筆記**

- HTTP 是雙方都理解的訊息格式與互動規則。
- 一次互動由 Request 和 Response 組成；通常由 Client 主動開始。
- 用 `GET /courses/1` 說明：「我要讀取編號 1 的課程」；Server 執行邏輯後回傳狀態與資料。
- 強調 response 不是只有 JSON，還包含 status code 與 headers。

**動畫／轉場**

- Request 線先由左向右畫出；停頓後 Response 線由右向左畫回。
- 同一個藍色光點沿路徑移動，維持全場視覺語言一致。

---

## 12 — 三層，各自做好一件事

**建議時間：4 分鐘｜累計：36 分鐘**

**畫面內容**

三張垂直排列的大卡：

1. `Frontend` — 畫面與互動
2. `Backend` — 驗證與商業規則
3. `Database` — 保存與查詢資料

**講者筆記**

- 用報名流程逐層說明責任：Frontend 收集選擇；Backend 判斷課程、身分、重複報名與名額；Database 保存關係。
- 強調不能只靠前端阻擋重複報名，因為 Client 傳來的內容不可信任。
- Database 不負責顯示成功訊息；Frontend 也不應直接連 Database。分工能讓各層獨立演進。

**動畫／轉場**

- 每講一層才點亮一張卡；其餘卡維持 30% 亮度。
- 最後三卡縮小成橫向架構圖，作為後續頁面的左上角小型導覽。

---

## 13 — 拆開一個 Request

**建議時間：4 分鐘｜累計：40 分鐘**

**畫面內容**

```http
POST /courses HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"title": "Backend Workshop", "capacity": 30}
```

右側四個標籤：`Method`、`Path`、`Headers`、`Body`

**講者筆記**

- Method 描述意圖，Path 指向 resource，Headers 提供訊息的 metadata，Body 承載要送出的資料。
- `Content-Type` 告訴 Server 應如何解讀 body；`Host` 指出目標主機。
- 說明不是所有 request 都有 body，例如一般 GET 通常透過 path 或 query 描述查詢。

**動畫／轉場**

- 以遮罩一次只顯示一個區塊；右側標籤用細線連到對應位置。
- 全部揭露後停留兩秒，讓學員自行重新讀一遍。

---

## 14 — Method 是動詞

**建議時間：4 分鐘｜累計：44 分鐘**

**畫面內容**

中央固定顯示 `/courses`，外圍依序出現：

- `GET` 讀取
- `POST` 建立
- `PUT` 完整取代
- `PATCH` 部分更新
- `DELETE` 刪除

**講者筆記**

- Resource 相同，操作意圖由 Method 表達。
- 特別區分 PUT 與 PATCH：PUT 表達完整取代，PATCH 表達局部修改；本工作坊使用 PATCH 更新容量。
- POST 也能觸發動作，但在今天的 CRUD 情境中主要用於建立 resource。
- 快問快答：取得清單、建立課程、只改容量，各應使用哪個 method？

**動畫／轉場**

- `/courses` 全程不動；五個 method 像環狀選單逐一淡入。
- 問答時只顯示情境，答案經點擊後以藍色高亮。

---

## 15 — Status Code 是結果摘要

**建議時間：4 分鐘｜累計：48 分鐘**

**畫面內容**

三個巨大數字縱向排列：

- `2xx` — 成功
- `4xx` — Request 或狀態問題
- `5xx` — Server 未預期錯誤

右側小型例子：`200`、`201`、`204`、`400`、`404`、`409`、`422`、`500`

**講者筆記**

- 先教分類，再教個別 code，避免把它變成背誦題。
- `201 Created` 適合建立成功；`204 No Content` 成功但沒有 response body。
- `404` 是目標 resource 不存在；`409` 是與現況衝突；`422` 常見於 FastAPI 驗證失敗。
- 強調不要所有情況都回 200，也不要把正常輸入錯誤變成 500。

**動畫／轉場**

- 三個分類依序由模糊變清晰；例子在右側按分類聚集。
- 錯誤類別以色彩與文字標籤雙重區分。

---

## 16 — Response 也有結構

**建議時間：4 分鐘｜累計：52 分鐘**

**畫面內容**

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /courses/3

{"id": 3, "title": "Backend Workshop", "capacity": 30}
```

**講者筆記**

- 與 Request 頁使用同一版型，讓學員比較兩者結構。
- `201` 告訴 Client 建立成功；`Location` 指出新 resource 的位置；body 帶回 Server 產生的 `id`。
- 補充 Response 的 `Content-Type` 描述的是 response body，不是 request body。
- 問學員：如果刪除成功並回 `204`，畫面中的哪一部分應消失？答案是 body。

**動畫／轉場**

- 從上一頁的 `201` 數字平滑移動到 status line。
- `Location` 與 body 中的 `id: 3` 同時高亮，建立視覺關聯。

---

## 17 — API 是一份雙方都遵守的契約

**建議時間：3 分鐘｜累計：55 分鐘**

**畫面內容**

中央契約卡：

```text
GET /courses/1

存在 → 200 + Course JSON
不存在 → 404
```

**講者筆記**

- API 不是某一段程式碼，而是兩個軟體溝通的規則。
- 契約至少說明 method、path、輸入位置與格式、成功 response、失敗 response。
- Frontend 與 Backend 可在契約確定後平行工作，這是 API 設計的實際價值。
- 轉場：接著用 FastAPI 把這份契約變成真的 Server。

**動畫／轉場**

- Frontend 與 Backend 卡片從兩側靠近，中央契約卡像磁吸一樣定位。
- 最後只留下契約卡，變形成下一頁的程式碼視窗。

---

## 18 — FastAPI：先讓 Server 回話

**建議時間：3 分鐘｜累計：58 分鐘**

**畫面內容**

```python
from fastapi import FastAPI

app = FastAPI(title="Course API")

@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Hello, backend!"}
```

**講者筆記**

- `app` 是 FastAPI application；decorator 將 `GET /` 綁定到 `root()`。
- 收到相符 request 時，FastAPI 呼叫函式，並把回傳的 dict 序列化成 JSON。
- 執行 `fastapi dev main.py` 後，development server 持續等待 request。
- 此頁只建立最小成功循環，不急著加入資料模型。

**動畫／轉場**

- 程式碼分三段揭露：import、app、route。
- 講到 decorator 時，用細光框同時包住 `@app.get` 與 `root()`。

---

## 19 — Route 決定交給誰

**建議時間：3 分鐘｜累計：61 分鐘**

**畫面內容**

三個 request 從左側進入：

- `GET /`
- `GET /courses`
- `GET /courses/1`

右側分流到三個 function：`root()`、`list_courses()`、`get_course()`

**講者筆記**

- Route 是配對規則；Endpoint 常指對外的 method + path 及其處理程式。
- Method 與 Path 必須一起看，只有 path 相同不代表同一個 endpoint。
- 用郵件分揀作比喻：route 看信封資訊決定交給哪個處理函式。

**動畫／轉場**

- Request 卡逐一滑入，分流線只在卡片移動時亮起。
- 最後保留 `GET /courses/1`，放大進入下一頁。

---

## 20 — Path Parameter：你要哪一筆？

**建議時間：4 分鐘｜累計：65 分鐘**

**畫面內容**

```python
@app.get("/courses/{course_id}")
def get_course(course_id: int) -> dict:
    ...
```

下方對照：

`/courses/1 → course_id = 1`  
`/courses/abc → 422`

**講者筆記**

- `{course_id}` 是 route 中的動態片段；名稱要與 function parameter 對上。
- `course_id: int` 讓 FastAPI 嘗試把 URL 文字轉為整數。
- `abc` 無法轉成整數，request 尚未進入函式就被拒絕並回 422。
- 這是第一次看到型別資訊成為 runtime behavior。

**動畫／轉場**

- URL 中的 `1` 平滑移動到參數值位置。
- 第二個例子中 `abc` 在進入 function 前被紫色 validation gate 擋下。

---

## 21 — Query Parameter：你想怎麼找？

**建議時間：5 分鐘｜累計：70 分鐘**

**畫面內容**

```python
@app.get("/courses")
def list_courses(q: str | None = None) -> list[dict]:
    if q is None:
        return courses
    return [c for c in courses if q.lower() in c["title"].lower()]
```

下方：`GET /courses?q=database`

**講者筆記**

- Path parameter 識別特定 resource；query parameter 用來篩選或調整呈現。
- `q` 可以不存在，所以型別是 `str | None`，預設也是 `None`。
- 示範先取得全部資料，再依標題過濾；指出這只是記憶體版本，資料庫版本會把條件交給 SQL。
- 可現場改變 `q`，讓學員預測回傳結果後再展示。

**動畫／轉場**

- 先顯示完整清單，再從 URL 飛入 `q=database`；不相符卡片降低亮度並移出。
- 程式碼只高亮當下走到的分支。

---

## 22 — Type Hint 還不夠

**建議時間：5 分鐘｜累計：75 分鐘**

**畫面內容**

中央依序出現三筆輸入：

```json
{"title": "System Design", "capacity": 50}
{"title": "", "capacity": 0}
{"title": 123, "capacity": "many"}
```

右側大字：`What is valid?`

**講者筆記**

- 請學員判斷三筆資料是否應接受，並追問「規則寫在哪裡」。
- 只有說 `capacity` 是 int，不足以表達必須大於 0、不得超過 500。
- 空標題雖是 string，仍不符合業務可接受的資料形狀。
- 引出 Pydantic：把資料結構與限制寫成可執行、可產生文件的模型。

**動畫／轉場**

- 每筆輸入獨立出現；投票後才顯示勾號或叉號及原因。
- 三張卡最後疊合，變成下一頁的模型卡。

---

## 23 — Pydantic：讓規則可以執行

**建議時間：5 分鐘｜累計：80 分鐘**

**畫面內容**

```python
CourseTitle = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=100),
]

class CourseCreate(BaseModel):
    title: CourseTitle
    capacity: int = Field(gt=0, le=500)
```

**講者筆記**

- `BaseModel` 定義資料模型；`Field` 與 `StringConstraints` 加上更精確的限制。
- `strip_whitespace=True` 先移除首尾空白，避免只有空格的標題通過。
- `gt=0, le=500` 直接表達容量範圍，違反時由 FastAPI 回傳結構化的 422。
- 強調模型同時服務 runtime validation、編輯器提示與 API 文件。

**動畫／轉場**

- 先只顯示型別，再逐項長出限制；每個限制旁短暫顯示自然語言翻譯。

---

## 24 — 同一個 Course，需要三種形狀

**建議時間：5 分鐘｜累計：85 分鐘**

**畫面內容**

三張並排模型卡：

- `CourseCreate`：title、capacity
- `CourseUpdate`：title?、capacity?
- `Course`：id、title、capacity

**講者筆記**

- 建立時 Client 必須提供標題與容量，但不應自行指定 Server 產生的 id。
- PATCH 只改部分欄位，所以 update model 的欄位可省略。
- Response 要包含 id，因此輸出 model 與輸入 model 不完全相同。
- 分開模型能明確表達每個 endpoint 的契約，避免用一個全部 optional 的萬用模型。

**動畫／轉場**

- 從共同的 title、capacity 卡開始複製成三張；id 從 Server 方向滑入 `Course`。
- 問號以文字 `optional` 同時標示，避免只靠符號理解。

---

## 25 — 建立一門課

**建議時間：5 分鐘｜累計：90 分鐘**

**畫面內容**

```python
@app.post("/courses", response_model=Course, status_code=201)
def create_course(payload: CourseCreate, response: Response) -> Course:
    global next_course_id
    course = Course(id=next_course_id, **payload.model_dump())
    courses[course.id] = course
    next_course_id += 1
    response.headers["Location"] = f"/courses/{course.id}"
    return course
```

**講者筆記**

- 沿資料流讀程式：body 進入 `CourseCreate` 驗證，Server 配發 id，資料寫入記憶體，回傳 `Course`。
- `response_model` 約束輸出形狀，`201` 表示建立完成，`Location` 告知新 resource 的位置。
- `model_dump()` 將 Pydantic model 轉成 dict，再展開給 `Course`。
- 提醒目前只是教學用 in-memory store，restart 後仍會消失。

**動畫／轉場**

- 右側同步顯示一張資料卡，隨程式執行依序長出輸入欄位、id、Location。

---

## 26 — 更新與刪除：把失敗說清楚

**建議時間：5 分鐘｜累計：95 分鐘**

**畫面內容**

左右雙欄：

```python
changes = payload.model_dump(
    exclude_unset=True,
    exclude_none=True,
)
```

```python
if course is None:
    raise HTTPException(
        status_code=404,
        detail="Course not found",
    )
```

底部：`DELETE success → 204 No Content`

**講者筆記**

- PATCH 只取出實際提供且非 `None` 的欄位，再覆蓋既有資料。
- 找不到課程時用 `HTTPException` 回 404，不再用 `{ "error": ... }` 搭配 200 假裝成功。
- DELETE 成功後沒有內容可回，使用 204；若 resource 不存在仍是 404。
- 點出成功與失敗都是 API 契約的一部分。

**動畫／轉場**

- 左欄先示範只留下 `capacity`；右欄再示範 404 分支。
- `204` 出現時，代表 body 的卡片以淡出方式完全消失。

---

## 27 — 程式碼，自己長出文件

**建議時間：5 分鐘｜累計：100 分鐘**

**畫面內容**

- 以仿 Swagger UI 的簡化畫面顯示 `GET /courses`、`POST /courses`、`PATCH /courses/{course_id}`。
- 中央放大 `POST /courses` 的 Request body 與 Response 區塊。

**講者筆記**

- FastAPI 根據 route、type hint 與 Pydantic model 產生 OpenAPI，再由 Swagger UI 呈現。
- 示範 `/docs` 的 Try it out：先送合法 body，觀察 201、response body 與 Location header。
- 再送空 title、capacity 0，觀察 422 與錯誤位置；請學員指出是哪條 model 規則造成。
- 收束：同一份型別與限制同時驅動驗證、文件與開發體驗。

**動畫／轉場**

- 使用實際操作時不加動畫；若採錄影或截圖，依序框選 endpoint、body、Execute、response。
- 頁尾顯示 `Break — 10 min`，再切入休息頁。

---

## 28 — Break

**建議時間：10 分鐘｜累計：110 分鐘**

**畫面內容**

中央大字：`10:00`

下方：`回來後：從「能跑」走向「設計得好」`

**講者筆記**

- 開啟倒數計時並明確告知回來時間。
- 保留上一章的五段資料流，已點亮至 FastAPI；SQL 與 Database 維持暗色。

**動畫／轉場**

- 僅使用平滑倒數，不播放循環裝飾動畫。

---

## 29 — 它能跑。但它好懂嗎？

**建議時間：3 分鐘｜累計：113 分鐘**

**畫面內容**

左右對比：

```text
POST /createCourse
GET  /getCourse?id=3
```

```text
POST /courses
GET  /courses/3
```

**講者筆記**

- 兩組 API 都可能被實作到能運作，差別在介面是否一致、可預測。
- 請學員觀察：左邊把動作塞進 path，右邊讓 method 表達動作、path 表達 resource。
- 引出 REST 是一種 API 架構風格，不是額外套件，也不是只有固定 URL 表格。

**動畫／轉場**

- 左側先出現並保持灰色；右側逐行改寫，重複部分用跨頁接續效果維持位置。

---

## 30 — REST：URL 放名詞，Method 放動作

**建議時間：4 分鐘｜累計：117 分鐘**

**畫面內容**

中央大字：`Resource over Action`

下方三個 resource 球體：`courses`、`members`、`enrollments`

**講者筆記**

- Resource 是系統中可被識別與操作的對象；今天有課程、社員與報名關係。
- URL 表示哪一類或哪一筆 resource；HTTP method 表示要做什麼。
- 一致的設計讓陌生使用者看到 `/courses/3` 就能推測它的意義。
- 說明 REST 還包含多項約束，今天聚焦 resource、uniform interface 與 stateless。

**動畫／轉場**

- 動詞 `create/get/delete` 先散落在畫面，接著吸附到 GET／POST／DELETE；名詞留在 resource 球體上。

---

## 31 — Collection 與 Item

**建議時間：4 分鐘｜累計：121 分鐘**

**畫面內容**

```text
/courses       Collection
/courses/3     Item
```

下方逐步形成 endpoint：

`GET /courses`　`POST /courses`　`GET /courses/3`　`PATCH /courses/3`　`DELETE /courses/3`

**講者筆記**

- Collection path 指向整組課程；加上 id 後指向單筆課程。
- 讓學員用「Method + Path」讀出五個 endpoint 的意圖。
- 強調 URL 不需要重複 `get`、`create` 等動詞，因為 Method 已提供語意。

**動畫／轉場**

- `/courses` 固定在中央，`/3` 以可插拔片段接上。
- Method 卡依照 collection 與 item 自動分成兩組。

---

## 32 — Path、Query、Body：各有位置

**建議時間：4 分鐘｜累計：125 分鐘**

**畫面內容**

```text
PATCH /courses/12?notify=true
```

三條標示線：

- `12` → 識別 resource
- `notify=true` → 調整行為
- `{ "capacity": 35 }` → 要提交的資料

**講者筆記**

- Path 放必要的 resource identity；query 放篩選或可選行為；body 放較完整的輸入資料。
- 用 `GET /courses?q=backend&min_capacity=20` 複習查詢條件。
- 指出這是設計慣例而不是語法限制；一致性會降低使用者猜測成本。

**動畫／轉場**

- URL 先完整出現，再用三個焦點框依序局部放大。
- Body 從畫面下方滑入，與 URL 保持明顯空間區隔。

---

## 33 — Stateless：每次 Request 都要能獨立理解

**建議時間：5 分鐘｜累計：130 分鐘**

**畫面內容**

三張獨立信封卡，每張都包含：

`Method + Path + Headers + Body`

中央大字：`No missing context.`

**講者筆記**

- Stateless 表示 Server 處理一個 request 時，不應依賴「上一個 request 說過但這次沒帶」的對話狀態。
- Request 必須攜帶足以理解與處理它的資訊，例如識別目標、驗證憑證與輸入資料。
- 澄清 stateless 不等於系統沒有資料；課程與報名仍保存在 Database，限制的是 request 之間的隱含 session context。
- 好處是 request 更容易被不同 Server instance 處理與重試。

**動畫／轉場**

- 三張信封分別送往三個相同 Server 節點，每張都可獨立完成。
- 不畫黏在特定節點上的連線，以視覺化呈現 stateless。

---

## 34 — 設計 Enrollment API

**建議時間：5 分鐘｜累計：135 分鐘**

**畫面內容**

題目卡：`社員 7 報名課程 3`

下方保留三個待揭露區：

- Method + Path
- 成功結果
- 重複報名結果

建議答案：

```text
POST /courses/3/enrollments
Body: {"member_id": 7}
Success: 201 Created
Duplicate: 409 Conflict
```

**講者筆記**

- 給學員 60–90 秒先獨立寫出契約，再與鄰座比較。
- 討論 enrollment 可視為 course 底下的子 resource；本課採 `POST /courses/3/enrollments`。
- 重複報名不是 Server crash，而是與現況衝突，所以回 409。
- 接著追問：Server 要如何確認 member、course 與重複關係？答案會帶向 Database。

**動畫／轉場**

- 題目先出現；倒數結束後，三個答案區按順序揭露。
- `member 7` 與 `course 3` 變成兩個資料節點，延伸進下一頁。

---

## 35 — 記憶體不是永久住所

**建議時間：3 分鐘｜累計：138 分鐘**

**畫面內容**

左側：`courses = {...}` 發亮  
中央：`Server restart`  
右側：空白資料卡

下方大字：`Persistence changes everything.`

**講者筆記**

- 目前 FastAPI 範例把資料存在 process 記憶體；重啟後資料消失。
- 多個 Server process 也會各自持有不同副本，彼此看不到更新。
- Database 提供有組織、可持久保存與查詢的資料；DBMS 是實際負責讀寫與約束的軟體。

**動畫／轉場**

- 模擬 restart 時只讓資料卡淡出，不使用爆炸或故障特效。
- 青綠色 Database 圓柱從黑暗中緩慢浮現。

---

## 36 — Database 與 DBMS，不是同一件事

**建議時間：4 分鐘｜累計：142 分鐘**

**畫面內容**

```text
FastAPI ── SQL ──▶ SQLite DBMS ── read/write ──▶ workshop.db
        ◀──────────── Rows ─────────────────────
```

**講者筆記**

- Database 是有組織的資料集合；DBMS 是管理、查詢與驗證資料的軟體。
- 在本課中 SQLite 是 DBMS，`workshop.db` 是儲存資料的檔案。
- FastAPI 不直接修改檔案位元，而是用 SQL 與 SQLite 溝通，再把查到的 rows 轉成 API response。
- SQLite 已包含在 Python 標準函式庫，適合本次單機教學。

**動畫／轉場**

- SQL 以青綠光點向右移動，Rows 再返回；動畫完成後保留雙向箭頭。

---

## 37 — Table 是一種資料形狀

**建議時間：4 分鐘｜累計：146 分鐘**

**畫面內容**

```text
courses
┌────┬──────────────────┬──────────┐
│ id │ title            │ capacity │
├────┼──────────────────┼──────────┤
│ 1  │ Backend Workshop │ 30       │
│ 2  │ Database Training│ 25       │
└────┴──────────────────┴──────────┘
```

周圍標籤：`Table`、`Row`、`Column`、`Schema`

**講者筆記**

- Table 保存同一類 entity；每個 row 是一筆實體，每個 column 是一項屬性。
- Schema 是資料設計圖，定義有哪些 table、column、data type 與 constraint。
- 對照 Pydantic：兩者都描述資料形狀，但 Pydantic 守在 API 邊界，Database constraint 守在持久層。

**動畫／轉場**

- 空白網格先出現，再依序加入 column header 與 rows。
- 說到每個名詞時，只高亮對應範圍。

---

## 38 — Constraint 是資料最後一道防線

**建議時間：5 分鐘｜累計：151 分鐘**

**畫面內容**

五個門禁標誌：

- `PRIMARY KEY` — 唯一身分
- `FOREIGN KEY` — 指向存在的資料
- `NOT NULL` — 不可缺值
- `UNIQUE` — 不可重複
- `CHECK` — 必須符合條件

角落補充：`DEFAULT` — 沒提供時使用預設值

**講者筆記**

- Primary Key 唯一識別一個 row；Foreign Key 維持 table 之間的參照完整性。
- Email 可用 UNIQUE 防止重複，capacity 可用 CHECK 限制 1–500。
- Pydantic 通過不代表資料必然安全，因為可能還有其他程式直接寫 Database；constraint 是最後一道共同防線。
- DEFAULT 與其他 constraint 性質稍有不同，它補值而不是拒絕資料。

**動畫／轉場**

- 測試資料卡逐一通過或被門禁擋下；失敗時顯示文字原因，不只改變顏色。

---

## 39 — 報名不是一個欄位，而是一個關係

**建議時間：4 分鐘｜累計：155 分鐘**

**畫面內容**

中央 ERD：

```text
MEMBERS  1 ─── *  ENROLLMENTS  * ─── 1  COURSES
```

Enrollment 卡內顯示：`member_id`、`course_id`、`status`

**講者筆記**

- 一個 member 可報多門 course，一門 course 也可有多位 member，因此是 many-to-many。
- 以中介 table `enrollments` 將它拆成兩個 one-to-many 關係。
- `(member_id, course_id)` 作 composite primary key，可直接阻止同一社員重複報同一堂課。
- 兩個 foreign key 確保報名不會指向不存在的社員或課程。

**動畫／轉場**

- 先顯示 Members 與 Courses 的多對多連線，再於中央展開 Enrollments，將一條線拆成兩條。

---

## 40 — SQL 的 CRUD

**建議時間：5 分鐘｜累計：160 分鐘**

**畫面內容**

四個大型 keyword 依序橫排：

`INSERT`　`SELECT`　`UPDATE`　`DELETE`

下方分別對應：`Create`、`Read`、`Update`、`Delete`

**講者筆記**

- SQL 是與關聯式 DBMS 溝通的語言，CRUD 是最基本的四類資料操作。
- 快速展示每種 statement 的最小例子，重點放在意圖而非背語法。
- UPDATE 與 DELETE 通常必須搭配 WHERE；若漏掉，可能影響整張 table。
- 正式 SELECT 應列出需要的 columns，避免不必要傳輸或將未來新增的敏感欄位一起回傳。

**動畫／轉場**

- 四個 keyword 每次只點亮一個，背景同步呈現 row 新增、讀取、變更、消失的簡單狀態動畫。

---

## 41 — JOIN：把關係重新組成答案

**建議時間：4 分鐘｜累計：164 分鐘**

**畫面內容**

```sql
SELECT m.name, c.title, c.capacity, e.status
FROM enrollments AS e
JOIN members AS m ON m.id = e.member_id
JOIN courses AS c ON c.id = e.course_id
WHERE c.id = ?
ORDER BY m.id;
```

右側結果卡：`王小明｜Backend Workshop｜30｜enrolled`

**講者筆記**

- 從想回答的問題開始：「這堂課有哪些人報名？」需要三張 table 的欄位。
- `FROM enrollments` 以關係表為起點，兩次 JOIN 依 foreign key 找到 member 與 course。
- `WHERE c.id = ?` 限定目標課程；`ORDER BY` 讓結果順序穩定。
- `?` 是參數 placeholder，值另外傳入，避免自己拼接 SQL 字串。

**動畫／轉場**

- 三張迷你 table 先分開；JOIN 行被高亮時，對應 columns 以細線連接。
- 最後只保留選出的四個欄位，合成結果卡。

---

## 42 — Python 安全地執行 SQL

**建議時間：3 分鐘｜累計：167 分鐘**

**畫面內容**

```python
connection = sqlite3.connect(DATABASE_PATH)
connection.row_factory = sqlite3.Row
connection.execute("PRAGMA foreign_keys = ON")

row = connection.execute(
    "SELECT id, title, capacity FROM courses WHERE id = ?",
    (course_id,),
).fetchone()
```

**講者筆記**

- 建立 connection 後啟用 `sqlite3.Row`，即可用 column name 讀值。
- SQLite 的 foreign key enforcement 需對每個 connection 明確啟用。
- SQL 與參數分開傳給 `execute`；不要用 f-string 把外部輸入直接拼進 SQL。
- `fetchone()` 取得一筆，`fetchall()` 取得全部符合 rows。

**動畫／轉場**

- SQL 中的 `?` 與右側參數 tuple 以同色外框連接，但保持為兩個獨立區塊。

---

## 43 — Transaction：一起成功，或一起失敗

**建議時間：3 分鐘｜累計：170 分鐘**

**畫面內容**

```python
with connection:
    connection.execute(...)
    connection.execute(...)
```

下方大字：`All or nothing.`

**講者筆記**

- 多個相關寫入若只成功一半，資料會進入不一致狀態。
- `with connection:` 在這個 sqlite3 範例中形成 transaction 範圍：正常結束就 commit，發生例外則 rollback。
- `IntegrityError` 代表資料違反 constraint，應被捕捉並轉成合理的應用層錯誤，而不是忽略。
- 連回報名案例：建立 enrollment 時，foreign key、composite key 與 transaction 一起守住一致性。

**動畫／轉場**

- 兩個寫入方塊被同一個外框包住；成功時一起出現勾號，失敗時一起回到原狀。

---

## 44 — 現在，再看一次那個點擊

**建議時間：3 分鐘｜累計：173 分鐘**

**畫面內容**

完整資料流：

```text
Click
  → POST /courses/3/enrollments
  → FastAPI Route
  → Pydantic Validation
  → Business Rules
  → Parameterized SQL
  → SQLite Constraints
  → 201 / 409 / 404
```

**講者筆記**

- 回到開場的報名按鈕，請學員輪流說出每一站的責任。
- Client 表達意圖；route 接住 request；Pydantic 檢查形狀；business logic 判斷規則；SQL 讀寫；constraint 守住資料；status code 表達結果。
- 強調每一層都不是重複工作，而是在不同邊界承擔不同責任。

**動畫／轉場**

- 使用開場相同的藍色光點走完整條路；每到一站才顯示該站文字。
- 完成後所有節點同時全亮兩秒。

---

## 45 — 你現在擁有一張後端地圖

**建議時間：3 分鐘｜累計：176 分鐘**

**畫面內容**

三行大字：

- `Read the request.`
- `Protect the rules.`
- `Preserve the data.`

旁邊以小字對應：HTTP、Backend、Database

**講者筆記**

- 用三句話回顧整堂課，而不是重新列出所有名詞。
- 請學員現在再次回答「按下報名後發生什麼」，並鼓勵使用 method、route、validation、SQL、constraint、status code 等具體詞彙。
- 指出今天完成的是最小但完整的心智模型；框架與資料庫可以更換，這條責任鏈仍成立。

**動畫／轉場**

- 三句話分三次淡入；每句出現時，上一句移至上方並降低至 70% 亮度。

---

## 46 — Final Lab

**建議時間：2 分鐘｜累計：178 分鐘**

**畫面內容**

中央大字：`Final Lab — To be designed`

下方預留三個欄位：

- `Goal`
- `Deliverable`
- `Success criteria`

**講者筆記**

- 此頁是刻意保留的 placeholder，目前不現場派發未完成題目。
- 日後補題時應整合 API 契約、Pydantic validation 與 parameterized SQL，並提供明確成功條件。
- 若本次尚未補題，直接轉至下一頁，不占用額外實作時間。

**動畫／轉場**

- 不使用動畫；以低調虛線框清楚表示內容尚待補充。

---

## 47 — What’s next?

**建議時間：2 分鐘｜累計：180 分鐘**

**畫面內容**

中央顯示一條向遠方延伸的路徑，依序標記：

`Database Design → Migration → Auth → Testing → Production`

頁尾：`Client → HTTP → FastAPI → SQL → Database`

**講者筆記**

- 簡短說明下一階段：正規化與 ERD、schema migration、身分與權限、pytest、自動部署與監控。
- 建議學員先把今天的 Course API 改成真正的 SQLite persistence，再往 authentication 前進。
- 開放最後提問，並提醒完整程式碼與參考資料都在 [Notion 講義](https://app.notion.com/p/sdc-nycu/Backend-Workshop-3dc7dadd804080cab18bc4f2017f8fe3)。
- 以頁尾的完整心智模型作最後一句，與開場首尾呼應。

**動畫／轉場**

- 路徑由近到遠逐段亮起；最後所有標記淡出，只留下完整心智模型與一句 `Thank you.`
