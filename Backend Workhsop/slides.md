# 完整授課腳本

總長 03:00:00。程式碼、講稿、步驟與投影片由同一份來源產生。所有跨頁統一 0.3 秒淡化；頁內動作由講者手動推進。

## 01 — Backend Workshop

穩定 ID：49｜00:00:00–00:00:20

- 開課前停留於此。正式開始時簡短介紹今天會使用 HTTP、FastAPI 與 SQLite。
- 下一頁從報名按鈕開始，先提問，再手動播放資料旅程。

步驟：開課：Backend Workshop

## 02 — 按下報名按鈕之後，發生什麼事？

穩定 ID：1｜00:00:20–00:01:37

- 先請學員想像自己正在社團網站報名課程，問：「按下去之後，資料去了哪裡？」
- 保留思考時間，再按報名按鈕或下一步。兩者都只推進一次。
- 請求先抵達 Server，檢查輸入與報名條件，再交給 Database 保存。
- 資料保存成功後才把確認訊息送回。這是概念示意，不是執行中的報名 API。
- 下一頁將旅程攤平成五個節點，逐一介紹 HTTP、FastAPI 與 SQL。

步驟：先想想：按下報名之後，資料去了哪裡？ → 按鈕送出報名請求 → Server 接收並處理 → Database 保存報名資料 → 確認訊息回到畫面

## 03 — 一次報名請求的處理流程

穩定 ID：2｜00:01:37–00:02:38

- 上一頁已看到報名成功；這裡從 Client 發出請求開始，拆解五個環節。
- 逐步介紹 HTTP 傳遞訊息、FastAPI 處理請求、SQL 表達操作、Database 保存結果。
- 這條路徑是整堂課的地圖，回顧時會再串接一次。

步驟：Client 發出請求 → HTTP 傳遞訊息 → FastAPI 處理請求 → SQL 操作資料 → Database 保存結果

## 04 — 本次課程的學習目標

穩定 ID：3｜00:02:38–00:03:32

- 將講義的學習目標收斂成三件可觀察的能力。
- 強調「看懂」先於「實作」：知道資料在哪裡、誰負責什麼，才不會只是在複製程式碼。
- 預告課堂有短練習與示範，但完整範例都在 [Notion 講義](https://app.notion.com/p/sdc-nycu/Backend-Workshop-3dc7dadd804080cab18bc4f2017f8fe3)，不用急著抄投影片。

步驟：看懂請求與回應 → 設計 API → 讀懂完整程式

## 05 — 今天的課程內容

穩定 ID：4｜00:03:32–00:04:10

- 一次說明今天的十三個主題，由左欄上到下，再接右欄上到下。
- 課程總覽之後確認環境，再從 Python、Web 與 REST 進入 FastAPI；休息後完成 CRUD，再學習資料庫、SQL、Transaction，最後回顧與問答。
- 畫面只保留總長 180 min；逐頁時間保留於教材來源。

步驟：今天的教學內容與順序

## 06 — 確認 Python 版本

穩定 ID：11001｜00:04:10–00:04:35

- macOS／Linux 使用 python3；Windows 可使用 py。
- 需要 Python 3.10 以上。
- 來源：Notion「Prerequisites」，區塊 1，第 1–1 行。

步驟：確認 Python 版本

~~~bash
python3 --version
~~~

## 07 — 建立專案與虛擬環境

穩定 ID：12001｜00:04:35–00:05:12

- 先建立資料夾，再建立 .venv。
- 來源：Notion「Prerequisites」，區塊 2，第 1–3 行。

步驟：建立並進入專案資料夾 → 建立虛擬環境

~~~bash
mkdir backend-workshop
cd backend-workshop
python3 -m venv .venv
~~~

## 08 — 啟用環境：macOS／Linux

穩定 ID：13001｜00:05:12–00:05:33

- 啟用後統一使用 python 執行指令。
- 來源：Notion「Prerequisites」，區塊 3，第 1–1 行。

步驟：啟用 macOS／Linux 虛擬環境

~~~bash
source .venv/bin/activate
~~~

## 09 — 啟用環境：Windows PowerShell

穩定 ID：14001｜00:05:33–00:05:55

- 在專案目錄執行 Activate.ps1。
- 來源：Notion「Prerequisites」，區塊 4，第 1–1 行。

步驟：啟用 PowerShell 虛擬環境

~~~powershell
.venv\Scripts\Activate.ps1
~~~

## 10 — 安裝 FastAPI

穩定 ID：15001｜00:05:55–00:06:24

- fastapi[standard] 包含課程使用的開發伺服器。SQLite 已在 Python 標準函式庫。
- fastapi[standard] 會一併安裝本課使用的開發伺服器；SQLite 已在 Python 標準函式庫。
- 來源：Notion「Prerequisites」，區塊 5，第 1–1 行。

步驟：在虛擬環境安裝 FastAPI

~~~bash
python -m pip install "fastapi[standard]"
~~~

## 11 — Python：型別、函式與資料結構

穩定 ID：6｜00:06:24–00:08:12

- 先複習 Function、Type Hint、list / dict 與 Exception。
- 接下來使用一般 dict 表示課程資料；Type Hint 提供閱讀與靜態分析資訊，執行期驗證稍後交給 Pydantic。

步驟：Function → Type Hint → list / dict → Exception

## 12 — Function

穩定 ID：7｜00:08:12–00:13:00

- courses: list[dict] 接收課程清單；course_id: int 接收要查找的 ID；-> dict 表示回傳一筆課程。Type Hint 本身不進行執行期驗證。
- 依序比較 id；找到便回傳整筆 dict。
- 迴圈結束仍沒找到時，拋出 ValueError。
- 來源：Notion「Function」，區塊 6，第 1–7 行。

步驟：參數與回傳型別 → 逐筆查找並回傳 → 找不到時拋出 ValueError

~~~python
def find_course(courses: list[dict], course_id: int) -> dict:
    for course in courses:
        if course["id"] == course_id:
            return course

    # Raise an exception if no matching course is found.
    raise ValueError(f"Course {course_id} not found")
~~~

## 13 — Python dict 與 JSON

穩定 ID：8｜00:13:00–00:15:02

- 說明兩者視覺相似，但本質不同：左邊是 Python 記憶體中的物件，右邊是跨網路傳輸的文字格式。
- `list` 對應 JSON array，`dict` 對應 JSON object；稍後 FastAPI 會協助序列化與反序列化。
- 提醒不要把「Python dict」與「JSON」當成完全相同的東西。

步驟：Python dict → JSON 文字

## 14 — 使用 list、dict 與 Exception

穩定 ID：9｜00:15:02–00:18:34

- list 儲存多筆課程；dict 儲存每筆的欄位。
- 查找 id=3 會拋出 ValueError；except 顯示錯誤。
- 來源：Notion「List, Dictionary, and Exception」，區塊 7，第 1–11 行。

步驟：以 list 與 dict 保存課程 → 呼叫查找函式 → 捕捉 ValueError

~~~python
courses = [
    {"id": 1, "title": "Backend Workshop", "capacity": 30},
    {"id": 2, "title": "Database Workshop", "capacity": 25},
]

try:
    # find_course returns a dict.
    course = find_course(courses, 3)
    print(course["title"])
except ValueError as error:
    print(error)
~~~

## 15 — 練習：篩選課程容量

穩定 ID：18001｜00:18:34–00:22:24

- 先留 45 秒作答，再展示參考解答。
- 保留容量大於等於 minimum_capacity 的課程，回傳 list[dict]。
- 來源：Notion「Exercise: Filter Courses」，區塊 8，第 1–8 行。

步驟：先作答，再揭露解答 → 清單、容量門檻與回傳型別 → 依容量條件組成新清單

~~~python
def filter_courses(
    courses: list[dict], minimum_capacity: int
) -> list[dict]:
    return [
        course
        for course in courses
        if course["capacity"] >= minimum_capacity
    ]
~~~

## 16 — Client 與 Server

穩定 ID：10｜00:22:24–00:24:19

- Client 是主動提出請求的一方，Server 是持續等待並回應的一方；角色由這次互動決定，不單純等於某種硬體。
- Browser、手機 App 都能當 Client；FastAPI 程式在這個案例中扮演 Server。
- Backend 指 Server 端負責驗證、權限、商業規則與資料存取的程式，不等同整台機器。

步驟：Client → Server → 請求與回應

## 17 — Client 與 Server 的一次往返

穩定 ID：11｜00:24:19–00:26:43

- HTTP 是雙方都理解的訊息格式與互動規則。
- 一次互動由 Request 和 Response 組成；通常由 Client 主動開始。
- 用 `GET /courses/1` 說明：「我要讀取編號 1 的課程」；Server 執行邏輯後回傳狀態與資料。
- 強調 response 不是只有 JSON，還包含 status code 與 headers。
- 此圖完整整合 Notion 區塊 9；節點、箭頭與欄位均可追溯。

步驟：Client 與 Server → 送出 HTTP Request → Server 執行業務邏輯 → 傳回 200 與 JSON

## 18 — Frontend、Backend 與 Database 的分工

穩定 ID：12｜00:26:43–00:29:07

- 用報名流程逐層說明責任：Frontend 收集選擇；Backend 判斷課程、身分、重複報名與名額；Database 保存關係。
- 強調不能只靠前端阻擋重複報名，因為 Client 傳來的內容不可信任。
- Database 不負責顯示成功訊息；Frontend 也不應直接連 Database。分工能讓各層獨立演進。
- 此圖完整整合 Notion 區塊 10；節點、箭頭與欄位均可追溯。

步驟：使用者與 Frontend → HTTP Request 到 Backend → SQL 到 Database → 資料與回應沿原路返回

## 19 — HTTP Request 的組成

穩定 ID：13｜00:29:07–00:31:54

- Method 描述意圖，Path 指向 resource，Headers 提供訊息的 metadata，Body 承載要送出的資料。
- `Content-Type` 告訴 Server 應如何解讀 body；`Host` 指出目標主機。
- 說明不是所有 request 都有 body，例如一般 GET 通常透過 path 或 query 描述查詢。
- Notion「HTTP Request and Response」的範例已整合在本頁內容中。

步驟：Method → Path → Headers → Body

## 20 — HTTP Method 與資料操作

穩定 ID：14｜00:31:54–00:33:49

- Resource 相同，操作意圖由 Method 表達。
- 特別區分 PUT 與 PATCH：PUT 表達完整取代，PATCH 表達局部修改；本工作坊使用 PATCH 更新容量。
- POST 也能觸發動作，但在今天的 CRUD 情境中主要用於建立 resource。
- 快問快答：取得清單、建立課程、只改容量，各應使用哪個 method？

步驟：GET / POST → PUT / PATCH → DELETE → 只改容量用哪個 Method？ → 答案：PATCH

## 21 — HTTP Status Code

穩定 ID：15｜00:33:49–00:35:45

- 先教分類，再教個別 code，避免把它變成背誦題。
- `201 Created` 適合建立成功；`204 No Content` 成功但沒有 response body。
- `404` 是目標 resource 不存在；`409` 是與現況衝突；`422` 常見於 FastAPI 驗證失敗。
- 強調不要所有情況都回 200，也不要把正常輸入錯誤變成 500。

步驟：2xx → 4xx → 5xx

## 22 — HTTP Response 的組成

穩定 ID：16｜00:35:45–00:38:32

- 與 Request 頁使用同一版型，讓學員比較兩者結構。
- `201` 告訴 Client 建立成功；`Location` 指出新 resource 的位置；body 帶回 Server 產生的 `id`。
- 補充 Response 的 `Content-Type` 描述的是 response body，不是 request body。
- 問學員：如果刪除成功並回 `204`，畫面中的哪一部分應消失？答案是 body。
- Notion「HTTP Request and Response」的範例已整合在本頁內容中。

步驟：Status line → Headers → Body → 204 應移除哪個部分？ → 答案：Body

## 23 — API 的請求與回應規格

穩定 ID：17｜00:38:32–00:40:27

- 先定義 Method、Path、輸入與成功／失敗回應。
- 接著比較 REST 的資源命名，再進入 FastAPI 實作。

步驟：Method 與 Path → 成功回應 → 失敗回應

## 24 — Path Parameter 與 Query Parameter

穩定 ID：23001｜00:40:27–00:43:55

- 先展示 GET /courses/12?include_enrollments=true，兩種參數都在同一個 URL 中。
- Path 中的 12 指定課程；? 後的 include_enrollments=true 調整回傳內容，要求包含報名資訊。
- 這是介面設計範例；本次 Course API 沒有實作 include_enrollments。後面的 q 是課程標題搜尋參數，會在首次出現時介紹。
- Notion「API」的範例已整合在本頁內容中。

步驟：完整 URL → Path Parameter：12 識別課程 → Query Parameter：是否包含報名資訊

## 25 — 比較兩種 API 路徑設計

穩定 ID：29｜00:43:55–00:47:24

- 兩組 API 都可能被實作到能運作，差別在介面是否一致、可預測。
- 請學員觀察：左邊把動作塞進 path，右邊讓 method 表達動作、path 表達 resource。
- 引出 REST 是一種 API 架構風格，不是額外套件，也不是只有固定 URL 表格。
- Notion「What is REST」的範例已整合在本頁內容中。

步驟：動作寫在 Path → Resource 與 Method

## 26 — REST：Resource 與 HTTP Method

穩定 ID：30｜00:47:24–00:49:44

- Resource 是系統中可被識別與操作的對象；今天有課程、社員與報名關係。
- URL 表示哪一類或哪一筆 resource；HTTP method 表示要做什麼。
- 一致的設計讓陌生使用者看到 `/courses/3` 就能推測它的意義。
- 說明 REST 還包含多項約束，今天聚焦 resource、uniform interface 與 stateless。

步驟：Resource → URL → Method

## 27 — Collection 與 Item

穩定 ID：31｜00:49:44–00:52:04

- Collection path 指向整組課程；加上 id 後指向單筆課程。
- 讓學員用「Method + Path」讀出五個 endpoint 的意圖。
- 強調 URL 不需要重複 `get`、`create` 等動詞，因為 Method 已提供語意。

步驟：Collection → Item → CRUD endpoints

## 28 — Stateless：獨立處理每個請求

穩定 ID：33｜00:52:04–00:54:24

- Stateless 表示 Server 處理一個 request 時，不應依賴「上一個 request 說過但這次沒帶」的對話狀態。
- Request 必須攜帶足以理解與處理它的資訊，例如識別目標、驗證憑證與輸入資料。
- 澄清 stateless 不等於系統沒有資料；課程與報名仍保存在 Database，限制的是 request 之間的隱含 session context。
- 好處是 request 更容易被不同 Server instance 處理與重試。

步驟：請求資訊完整 → 交給不同 Server → 仍可保存資料

## 29 — 建立第一個 FastAPI Endpoint

穩定 ID：18｜00:54:24–00:57:12

- FastAPI 是用 Python 建立 Web API 的框架。
- 匯入 FastAPI、建立 app、註冊 GET /，最後回傳 JSON。
- GET / → 200  ·  {"message": "Hello, backend!"}
- 來源：Notion「Your First FastAPI Application」，區塊 15，第 1–11 行。

步驟：匯入並建立 FastAPI → 用 decorator 宣告路由 → 回傳 dict，由 FastAPI 轉成 JSON

~~~python
from fastapi import FastAPI

# Create a FastAPI application instance and set the API title.
app = FastAPI(title="Course API")


# Define the GET / API endpoint.
@app.get("/")
def root() -> dict[str, str]:
    # Return data in JSON format.
    return {"message": "Hello, backend!"}
~~~

## 30 — 啟動開發伺服器

穩定 ID：26001｜00:57:12–00:57:49

- main.py 是目前的檔案；開啟 http://127.0.0.1:8000/ 查看回應。
- 開啟 http://127.0.0.1:8000/ 查看 API 回應。
- 來源：Notion「Your First FastAPI Application」，區塊 16，第 1–1 行。

步驟：啟動 main.py

~~~bash
fastapi dev main.py
~~~

## 31 — Route 與 Endpoint

穩定 ID：19｜00:57:49–01:02:27

- Endpoint 是對外提供的 API 操作，以 Method 與 Path 說明，例如 GET /courses/{course_id}。
- Route 是配對規則：收到符合 Method 與 Path 的請求時，交给 get_course 處理。FastAPI 的 decorator 建立這個配對。
- 例如 GET /courses/12：先配對路由，再把 course_id=12 傳入 get_course，最後把回傳資料序列化為 JSON。型別轉換會在後面的 Path 頁詳細說明。

步驟：Endpoint：對外提供的操作 → Route：請求與處理函式的配對規則 → GET /courses/12 如何進入函式

## 32 — 建立記憶體課程清單

穩定 ID：27001｜01:02:27–01:03:28

- 這是初版：list 裡放 dict。完整版會改為以 id 查找的字典。
- 來源：Notion「Routes and Endpoints」，區塊 17，第 1–4 行。

步驟：建立初始課程清單

~~~python
courses = [
    {"id": 1, "title": "Backend Workshop", "capacity": 30},
    {"id": 2, "title": "Database Training", "capacity": 25},
]
~~~

## 33 — GET /courses：完整的初版查詢

穩定 ID：27007｜01:03:28–01:06:01

- 這裡首次介紹 q：Query Parameter，用來搜尋課程標題，例如 GET /courses?q=database。
- q 省略時回傳全部資料；提供 q 時比對課程標題。
- 來源：Notion「Routes and Endpoints」，區塊 17，第 7–16 行。

步驟：宣告路由與 q 參數 → 沒有 q 時回傳全部課程 → 以關鍵字篩選並回傳清單

~~~python
@app.get("/courses")
def list_courses(q: str | None = None) -> list[dict]:
    # q is a query parameter.
    if q is None:
        return courses
    return [
        course
        for course in courses
        if q.lower() in course["title"].lower()
    ]
~~~

## 34 — 使用 Query Parameter 篩選資料

穩定 ID：21｜01:06:01–01:07:27

- q 是前面介紹過的標題搜尋條件。
- 不帶 q 時保留全部資料；q=database 時只留下 Database Training。

步驟：完整清單 → q 帶入函式 → 篩選結果

## 35 — GET 單筆課程：初版實作

穩定 ID：27019｜01:07:27–01:08:58

- 此版本找不到課程仍回 200 搭配 error，稍後會改成 HTTPException 404。
- 目前找不到課程仍回 200；稍後會改成 HTTP 404。
- 來源：Notion「Routes and Endpoints」，區塊 17，第 19–24 行。

步驟：路徑參數與 int 型別 → 找到課程便回傳 → 初版的錯誤 dict 仍回傳 200

~~~python
@app.get("/courses/{course_id}")
def get_course(course_id: int) -> dict:
    for course in courses:
        if course["id"] == course_id:
            return course
    return {"error": "Course not found"}
~~~

## 36 — Path Parameter 與型別轉換

穩定 ID：20｜01:08:58–01:10:24

- 先對照路由 /courses/{course_id} 與函式參數。
- 從 /courses/1 取出字串 1，再轉為整數，交給 get_course。
- 切換為 /courses/abc；FastAPI 無法轉為 int，回傳 422，函式本體沒有執行。
- 不要把型別錯誤與找不到資料混在一起：初版找不到 id 仍回 200；完整版才改成 404。

步驟：路由中的 course_id → 取出 URL 的 1 → 轉成整數並進入函式 → 把輸入換成 abc → 422：型別轉換失敗，函式不會執行

## 37 — 輸入資料需要哪些驗證？

穩定 ID：22｜01:10:24–01:12:38

- 請學員判斷三筆資料是否應接受，並追問「規則寫在哪裡」。
- 只有說 `capacity` 是 int，不足以表達必須大於 0、不得超過 500。
- 空標題雖是 string，仍不符合業務可接受的資料形狀。
- 引出 Pydantic：把資料結構與限制寫成可執行、可產生文件的模型。

步驟：先判斷輸入 → 合法資料 → 內容不符規則 → 型別不符

## 38 — Pydantic：匯入型別與驗證工具

穩定 ID：23｜01:12:38–01:15:04

- Annotated 將型別與限制組合；BaseModel 定義資料模型。
- 來源：Notion「Pydantic Validation」，區塊 18，第 1–7 行。

步驟：Annotated 結合型別與限制 → 匯入模型與欄位驗證工具

~~~python
# Combine a type with additional constraints.
from typing import Annotated

# BaseModel defines a Pydantic data model.
# Field adds constraints or metadata, such as ranges, defaults, and descriptions.
# StringConstraints defines string constraints, such as minimum length, maximum 
    length, and regex patterns.
from pydantic import BaseModel, Field, StringConstraints
~~~

## 39 — CourseTitle 與 CourseCreate

穩定 ID：28010｜01:15:04–01:19:14

- 標題去除前後空白，長度 1–100；容量大於 0 且不超過 500。
- 來源：Notion「Pydantic Validation」，區塊 18，第 10–20 行。

步驟：定義 CourseTitle 的字串限制 → 建立含 title 與 capacity 的模型

~~~python
CourseTitle = Annotated[
    str,
    # CourseTitle must contain 1 to 100 characters after trimming leading and 
        trailing whitespace.
    StringConstraints(strip_whitespace=True, min_length=1, 
        max_length=100),
]


class CourseCreate(BaseModel):
    title: CourseTitle
    # capacity must be an integer satisfying 0 < capacity <= 500.
    capacity: int = Field(gt=0, le=500)
~~~

## 40 — CourseUpdate：可省略的更新欄位

穩定 ID：28023｜01:19:14–01:23:04

- 此 API 約定省略或 null 代表不修改。
- Field 的 default、gt、le 與 description 都完整保留。
- 本 API 約定：省略欄位或傳入 null，都表示不修改。
- 來源：Notion「Pydantic Validation」，區塊 18，第 23–33 行。
- 完整版對應註解：StringConstraints(strip_whitespace=True, min_length=1, max_length=100),
- 完整版對應註解：Fields may be omitted; this example treats null as no change.

步驟：可省略的 title → 可省略且有範圍限制的 capacity

~~~python
class CourseUpdate(BaseModel):
    title: CourseTitle | None = Field(
        default=None,
        description="省略或 null 代表不修改",
    )
    capacity: int | None = Field(
        default=None,
        gt=0,
        le=500,
        description="省略或 null 代表不修改",
    )
~~~

## 41 — Course：回傳 Server 配發的 id

穩定 ID：28036｜01:23:04–01:24:10

- Course 繼承 CourseCreate，再加入 id。
- 來源：Notion「Pydantic Validation」，區塊 18，第 36–37 行。

步驟：回傳模型加入 id

~~~python
class Course(CourseCreate):
    id: int
~~~

## 42 — 建立、更新與回傳的資料模型

穩定 ID：24｜01:24:10–01:26:24

- 建立時 Client 必須提供標題與容量，但不應自行指定 Server 產生的 id。
- PATCH 只改部分欄位，所以 update model 的欄位可省略。
- Response 要包含 id，因此輸出 model 與輸入 model 不完全相同。
- 分開模型能明確表達每個 endpoint 的契約，避免用一個全部 optional 的萬用模型。

步驟：建立資料 → 部分更新 → 回傳資料

## 43 — 休息十分鐘

穩定 ID：28｜01:26:24–01:36:24

- 首次進入自動開始十分鐘倒數；離開與返回仍接續，時間到停在 00:00。可暫停或重設；重設後按開始才重新倒數。
- 回來後把模型與路由組成完整的 Course CRUD API，再進入 Database。

步驟：休息十分鐘

## 44 — 完整版 main.py：匯入與 app

穩定 ID：29001｜01:36:24–01:38:07

- 現在開始組成完整的 main.py。
- 前面三種模型沿用；完整原始碼的模型段落已在 Pydantic 頁逐一展示。
- 來源：Notion「Pydantic Validation」，區塊 19，第 1–6 行。

步驟：匯入型別、FastAPI 與 Pydantic → 建立 Course API

~~~python
from typing import Annotated

from fastapi import FastAPI, HTTPException, Path, Query, Response, 
    status
from pydantic import BaseModel, Field, StringConstraints

app = FastAPI(title="Course API", version="1.0.0")
~~~

## 45 — CourseId 與資料初始化

穩定 ID：29038｜01:38:07–01:39:50

- Path(ge=1) 限制課程 id 為正整數。
- courses 改為 dict[int, Course]，以 id 查找。next_course_id 從 3 開始。
- 來源：Notion「Pydantic Validation」，區塊 19，第 38–44 行。

步驟：CourseId 必須是正整數 → 用 id 對應 Course 物件 → 記錄下一個可用 id

~~~python
CourseId = Annotated[int, Path(ge=1, description="Course ID")]

courses: dict[int, Course] = {
    1: Course(id=1, title="Backend Workshop", capacity=30),
    2: Course(id=2, title="Database Training", capacity=25),
}
next_course_id = 3
~~~

## 46 — find_course：找不到便回 404

穩定 ID：29047｜01:39:50–01:41:04

- 與 Python 複習的查找函式比較：此處的例外會轉成 HTTP 404。
- 資料不存在時，由共用函式統一轉成 HTTP 404。
- 來源：Notion「Pydantic Validation」，區塊 19，第 47–51 行。

步驟：依 id 查找課程 → 不存在時拋出 HTTP 404 → 回傳找到的 Course

~~~python
def find_course(course_id: int) -> Course:
    course = courses.get(course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
~~~

## 47 — 完整版的根路徑

穩定 ID：29054｜01:41:04–01:41:45

- 完整版本的回應訊息改為 Course API is running。
- 來源：Notion「Pydantic Validation」，區塊 19，第 54–56 行。

步驟：根路徑回傳啟動訊息

~~~python
@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Course API is running"}
~~~

## 48 — GET 清單：路由與參數

穩定 ID：29059｜01:41:45–01:43:25

- q 限制長度 1–50；min_capacity 限制至少為 1。
- 先定義輸入；下一頁接續同一個函式本體。
- 來源：Notion「Pydantic Validation」，區塊 19，第 59–63 行。

步驟：路由與函式 → 搜尋字串 q → 容量限制與回傳型別

~~~python
@app.get("/courses", response_model=list[Course])
def list_courses(
    q: str | None = Query(default=None, min_length=1, max_length=50),
    min_capacity: int | None = Query(default=None, ge=1),
) -> list[Course]:
~~~

## 49 — GET 清單：排序、篩選與回傳

穩定 ID：29072｜01:43:25–01:46:24

- 沿用上一頁的 q 與 min_capacity，讀取排序後的課程。
- q 有值時以 casefold 比對；min_capacity 有值時篩選容量，最後回傳 result。
- 來源：Notion「Pydantic Validation」，區塊 19，第 64–75 行。

步驟：先依 id 排序 → 依 q 篩選標題 → 篩選容量並回傳

~~~python
    result = sorted(courses.values(), key=lambda course: course.id)

    if q is not None:
        keyword = q.casefold()
        result = [course for course in result if keyword in 
            course.title.casefold()]

    if min_capacity is not None:
        result = [
            course for course in result if course.capacity >= 
                min_capacity
        ]

    return result
~~~

## 50 — GET 單筆：共用查找與回應模型

穩定 ID：29078｜01:46:24–01:47:23

- CourseId 已在前面定義；找不到由 find_course 統一回 404。
- 來源：Notion「Pydantic Validation」，區塊 19，第 78–80 行。

步驟：宣告回應模型並共用查找函式

~~~python
@app.get("/courses/{course_id}", response_model=Course)
def get_course(course_id: CourseId) -> Course:
    return find_course(course_id)
~~~

## 51 — POST：建立課程

穩定 ID：25｜01:47:23–01:50:49

- body 先通過 CourseCreate，再配發 id、保存資料。
- 201 與 Location 告知新資源的位置；完整 decorators、headers 與 return 皆保留。
- 201 Created  ·  Location: /courses/3
- 來源：Notion「Pydantic Validation」，區塊 19，第 83–96 行。

步驟：POST 路由、輸入模型與 201 → 配發 id 並儲存 Course → 設定 Location 並回傳課程

~~~python
@app.post(
    "/courses",
    response_model=Course,
    status_code=status.HTTP_201_CREATED,
)
def create_course(payload: CourseCreate, response: Response) -> Course:
    global next_course_id

    # Convert payload to a `dict` and pass it to `Course`.
    course = Course(id=next_course_id, **payload.model_dump())
    courses[course.id] = course
    next_course_id += 1
    response.headers["Location"] = f"/courses/{course.id}"
    return course
~~~

## 52 — PATCH：驗證更新內容

穩定 ID：26｜01:50:49–01:53:02

- 先查找資料；不存在回 404。
- exclude_unset 與 exclude_none 只留下要修改的值；沒有修改內容回 400。
- 下一頁接續同一函式，合併、保存並回傳。
- changes 只保留本次提供且非 null 的欄位
- 來源：Notion「Pydantic Validation」，區塊 19，第 99–106 行。

步驟：路由與更新模型 → 查找現有課程 → 擷取提供的欄位並拒絕空更新

~~~python
@app.patch("/courses/{course_id}", response_model=Course)
def update_course(course_id: CourseId, payload: CourseUpdate) -> Course:
    stored_course = find_course(course_id)
    # Ignore omitted fields and fields whose value is None.
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)

    if not changes:
        raise HTTPException(status_code=400, detail="No fields to 
            update")
~~~

## 53 — PATCH：合併、儲存與回傳

穩定 ID：29108｜01:53:02–01:54:30

- 接續上一頁的 update_course 函式，沿用 stored_course 與 changes。
- 用 changes 覆蓋舊資料，重新驗證後寫回 courses 並回傳。
- 合併 stored_course 與 changes，驗證後保存並回傳 updated_course
- 來源：Notion「Pydantic Validation」，區塊 19，第 108–113 行。

步驟：合併舊資料並驗證 → 保存與回傳

~~~python
    updated_course = Course.model_validate(
        # Override stored_course values with changes.
        {**stored_course.model_dump(), **changes}
    )
    courses[course_id] = updated_course
    return updated_course
~~~

## 54 — DELETE：刪除課程

穩定 ID：29116｜01:54:30–01:56:42

- 先用 find_course 確認存在；不存在回 404。
- del 移除資料；回傳 204，沒有 Response Body。
- 204 No Content  ·  Response Body 為空
- 來源：Notion「Pydantic Validation」，區塊 19，第 116–124 行。

步驟：路由與無 Body 的回應 → 查找、刪除並回傳 204

~~~python
@app.delete(
    "/courses/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_course(course_id: CourseId) -> Response:
    find_course(course_id)
    del courses[course_id]
    return Response(status_code=status.HTTP_204_NO_CONTENT)
~~~

## 55 — 使用 curl 測試 Course API

穩定 ID：30001｜01:56:42–01:59:03

- GET 取得清單；q 與 min_capacity 篩選課程。
- -i 顯示 Response Headers；-X 指定 Method；-H 與 -d 傳入 JSON。
- POST 建立 API Design；PATCH 將課程 1 的 capacity 改為 35；DELETE 刪除課程 2。
- 請在自己的終端機執行；此頁只聚焦指令，不模擬送出或回應。
- 來源：Notion「Pydantic Validation」，區塊 20，第 1–15 行。

步驟：GET：取得課程清單 → GET：依標題與容量篩選 → POST：帶入 JSON 建立課程 → PATCH：將課程 1 的容量改成 35 → DELETE：刪除課程 2

~~~bash
curl http://127.0.0.1:8000/courses
curl "http://127.0.0.1:8000/courses?q=backend&min_capacity=20"

# -i: Show response headers.
# -X: Specify the HTTP method; the default is GET when this flag is omitted.
curl -i -X POST http://127.0.0.1:8000/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"API Design","capacity":40}'

curl -X PATCH http://127.0.0.1:8000/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"capacity":35}'

curl -i -X DELETE http://127.0.0.1:8000/courses/2
~~~

## 56 — 使用 Swagger UI 查看與測試 API

穩定 ID：27｜01:59:03–02:02:00

- 先執行 fastapi dev main.py，啟動自己的 FastAPI 伺服器。
- 在學員自己的電腦開啟 http://127.0.0.1:8000/docs，展開 POST /courses，再依序選 Try it out、貼上 Body、Execute。
- 先試 title=System Design、capacity=50，預期 201 Created；再試空 title 與 capacity=0，預期 422。兩個欄位都違反驗證規則。
- 兩份 JSON 與預期結果一次呈現，請學員到自己的 /docs 實際驗證。
- Notion「Swagger UI」的範例已整合在本頁內容中。

步驟：開啟 /docs，自行測試兩種 Request Body

## 57 — 記憶體儲存的限制

穩定 ID：35｜02:02:00–02:03:06

- 目前 FastAPI 範例把資料存在 process 記憶體；重啟後資料消失。
- 多個 Server process 也會各自持有不同副本，彼此看不到更新。
- Database 提供有組織、可持久保存與查詢的資料；DBMS 是實際負責讀寫與約束的軟體。

步驟：記憶體資料 → 重新啟動 → 持久儲存

## 58 — Database、DBMS 與資料檔案

穩定 ID：36｜02:03:06–02:04:32

- Database 是有組織的資料集合；DBMS 是管理、查詢與驗證資料的軟體。
- 在本課中 SQLite 是 DBMS，`workshop.db` 是儲存資料的檔案。
- FastAPI 不直接修改檔案位元，而是用 SQL 與 SQLite 溝通，再把查到的 rows 轉成 API response。
- SQLite 已包含在 Python 標準函式庫，適合本次單機教學。
- 此圖完整整合 Notion 區塊 23；節點、箭頭與欄位均可追溯。

步驟：Client 與 FastAPI → SQL 到 SQLite → 讀寫 workshop.db → Rows 與 JSON 傳回 Client

## 59 — Table、Column 與 Row

穩定 ID：37｜02:04:32–02:05:48

- Table 保存同一類資料；Column 是屬性；Row 是一筆資料。
- 第一筆的 id、title、capacity 三個儲存格都要一起高亮。
- 下一頁用 CREATE TABLE 對照欄位、型別與限制。

步驟：Table → Column：capacity → Row：完整第一筆

## 60 — Schema：用 SQL 定義資料表

穩定 ID：34001｜02:05:48–02:06:59

- 欄位名稱、型別與限制共同構成 Schema。
- 對照上一頁 courses 的 id、title 與 capacity。
- id → INTEGER / PRIMARY KEY   ·   title → TEXT   ·   capacity → INTEGER
- 來源：Notion「Schema, Table, Row, Column」，區塊 24，第 1–6 行。

步驟：CREATE TABLE 宣告資料表 → id：整數主鍵 → title：不可為 NULL 的文字 → capacity：整數欄位，結束定義

~~~sql
CREATE TABLE courses (
    -- PRIMARY KEY will be explained later.
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    capacity INTEGER NOT NULL
);
~~~

## 61 — 資料庫的鍵與限制條件

穩定 ID：38｜02:06:59–02:08:33

- Primary Key 唯一識別一個 row；Foreign Key 維持 table 之間的參照完整性。
- Email 可用 UNIQUE 防止重複，capacity 可用 CHECK 限制 1–500。
- Pydantic 通過不代表資料必然安全，因為可能還有其他程式直接寫 Database；constraint 是最後一道共同防線。
- DEFAULT 與其他 constraint 性質稍有不同，它補值而不是拒絕資料。

步驟：PRIMARY KEY → FOREIGN KEY → NOT NULL / UNIQUE → CHECK / DEFAULT

## 62 — 用關聯表表示課程報名

穩定 ID：39｜02:08:33–02:11:05

- 一個 member 可報多門 course，一門 course 也可有多位 member，因此是 many-to-many。
- 以中介 table `enrollments` 將它拆成兩個 one-to-many 關係。
- `(member_id, course_id)` 作 composite primary key，可直接阻止同一社員重複報同一堂課。
- 兩個 foreign key 確保報名不會指向不存在的社員或課程。
- 此圖完整整合 Notion 區塊 25；節點、箭頭與欄位均可追溯。

步驟：多對多 → 中介表 → 複合主鍵

## 63 — SQL 的 CRUD

穩定 ID：40｜02:11:05–02:11:53

- SQL 是與關聯式 DBMS 溝通的語言，CRUD 是最基本的四類資料操作。
- 快速展示每種 statement 的最小例子，重點放在意圖而非背語法。
- UPDATE 與 DELETE 通常必須搭配 WHERE；若漏掉，可能影響整張 table。
- 正式 SELECT 應列出需要的 columns，避免不必要傳輸或將未來新增的敏感欄位一起回傳。

步驟：INSERT → SELECT → UPDATE → DELETE

## 64 — INSERT：新增社員

穩定 ID：36001｜02:11:53–02:12:25

- 使用講義原本的 members 範例。注意資料值與 WHERE 範圍。
- 來源：Notion「SQL Basic」，區塊 26，第 1–3 行。

步驟：INSERT 指定欄位與新增的值

~~~sql
-- Create: Add a member.
INSERT INTO members (id, name, email)
VALUES (1, 'Alice', 'alice@example.com');
~~~

## 65 — SELECT：查詢社員

穩定 ID：37001｜02:12:25–02:12:57

- 使用講義原本的 members 範例。注意資料值與 WHERE 範圍。
- 來源：Notion「SQL Basic」，區塊 27，第 1–4 行。

步驟：SELECT 指定欄位與資料表 → WHERE 限制要查詢的社員

~~~sql
-- Read: Query a member.
SELECT id, name, email
FROM members
WHERE id = 1;
~~~

## 66 — UPDATE：修改 Email

穩定 ID：38001｜02:12:57–02:13:29

- 使用講義原本的 members 範例。注意資料值與 WHERE 範圍。
- 來源：Notion「SQL Basic」，區塊 28，第 1–4 行。

步驟：UPDATE 設定新 Email → WHERE 限制更新範圍

~~~sql
-- Update: Modify a member.
UPDATE members
SET email = 'alice_new@example.com'
WHERE id = 1;
~~~

## 67 — DELETE：刪除社員

穩定 ID：39001｜02:13:29–02:14:01

- 使用講義原本的 members 範例。注意資料值與 WHERE 範圍。
- 來源：Notion「SQL Basic」，區塊 29，第 1–3 行。

步驟：DELETE 只刪除符合條件的社員

~~~sql
-- Delete: Remove a member.
DELETE FROM members
WHERE id = 1;
~~~

## 68 — 使用 JOIN 查詢報名資料

穩定 ID：41｜02:14:01–02:15:37

- 從想回答的問題開始：「這堂課有哪些人報名？」需要三張 table 的欄位。
- `FROM enrollments` 以關係表為起點，兩次 JOIN 依 foreign key 找到 member 與 course。
- `WHERE c.id = ?` 限定目標課程；`ORDER BY` 讓結果順序穩定。
- `?` 是參數 placeholder，值另外傳入，避免自己拼接 SQL 字串。

步驟：enrollments → 配對 members → 配對 courses → 結果資料列

## 69 — JOIN 的完整查詢

穩定 ID：40001｜02:15:37–02:16:25

- m、c、e 是別名；WHERE 使用參數，ORDER BY 按社員 id 排序。
- 來源：Notion「SQL Basic」，區塊 30，第 1–6 行。

步驟：從報名表選出所需欄位 → 用外鍵 JOIN 社員與課程 → 指定課程並排序

~~~sql
SELECT m.name, c.title, c.capacity, e.status
FROM enrollments AS e
JOIN members AS m ON m.id = e.member_id
JOIN courses AS c ON c.id = e.course_id
WHERE c.id = ?
ORDER BY m.id
~~~

## 70 — SQLite 程式：路徑與 members Schema

穩定 ID：41001｜02:16:25–02:19:11

- database_demo.py 與 workshop.db 位於同一資料夾。
- SCHEMA 是多行 SQL 字串，接下來兩頁繼續定義資料表。
- name 不可空白 · email 不可重複 · joined_at 有預設值
- 來源：Notion「SQL Basic」，區塊 31，第 1–14 行。

步驟：匯入 SQLite 並設定檔案路徑 → 以多行字串定義 members 與主鍵 → 姓名、Email 與加入時間的限制

~~~python
import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).with_name("workshop.db")

# Define the schemas for the three tables.
SCHEMA = """
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY,
    -- trim removes leading and trailing whitespace from a string.
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    email TEXT NOT NULL UNIQUE,
    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
~~~

## 71 — courses Schema：限制容量與標題

穩定 ID：41016｜02:19:11–02:20:46

- typeof(capacity) 確保整數；容量範圍為 1–500。
- created_at 使用 CURRENT_TIMESTAMP。
- 來源：Notion「SQL Basic」，區塊 31，第 16–22 行。

步驟：課程主鍵與非空白標題 → 容量必須是 1–500 的整數 → 預設建立時間，結束資料表定義

~~~python
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    capacity INTEGER NOT NULL
        CHECK (typeof(capacity) = 'integer' AND capacity BETWEEN 1 AND 
            500),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
~~~

## 72 — enrollments Schema：主鍵與外鍵

穩定 ID：41024｜02:20:46–02:23:20

- 複合主鍵防止重複報名；外鍵確保 Member 與 Course 存在。
- ON DELETE CASCADE 會連帶刪除相關報名；status 僅允許 enrolled 或 completed。
- 來源：Notion「SQL Basic」，區塊 31，第 24–36 行。

步驟：報名欄位、狀態限制與預設時間 → 複合主鍵避免重複報名 → 外鍵與連帶刪除，結束 SCHEMA 字串

~~~python
CREATE TABLE IF NOT EXISTS enrollments (
    member_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'enrolled'
        CHECK (status IN ('enrolled', 'completed')),
    enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Use (member_id, course_id) as the PK to prevent a member from enrolling in 
        the same course twice.
    PRIMARY KEY (member_id, course_id),
    -- DELETE CASCADE deletes this row when the referenced parent row is deleted.
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
"""
~~~

## 73 — 連線、Row 與外鍵檢查

穩定 ID：42｜02:23:20–02:24:50

- sqlite3.Row 允許依欄位名稱存取。
- 每個 connection 都需啟用 foreign_keys；executescript 執行前面完整 SCHEMA。
- SQLite 的 foreign_keys 必須在每個 connection 明確啟用。
- 來源：Notion「SQL Basic」，區塊 31，第 38–45 行。

步驟：建立資料庫連線 → 以欄位名稱讀取 Row → 啟用外鍵檢查 → 執行完整 SCHEMA

~~~python
# Create a database connection.
connection = sqlite3.connect(DATABASE_PATH)
# Access row values by column name with row["attribute"], instead of only by 
    index with row[int].
connection.row_factory = sqlite3.Row
# Enable FK checks; execute runs a single SQL statement.
connection.execute("PRAGMA foreign_keys = ON")
# Execute multiple SQL statements.
connection.executescript(SCHEMA)
~~~

## 74 — 初始化資料：建立社員

穩定 ID：41047｜02:24:50–02:26:50

- try 包住後續操作；with connection 定義交易範圍。
- ON CONFLICT(id) DO NOTHING 的 id 是 PRIMARY KEY。
- 來源：Notion「SQL Basic」，區塊 31，第 47–58 行。

步驟：try 與交易範圍 → 參數化 INSERT 與重複 id 的處理

~~~python
try:
    # Ensure atomicity: SQL statements inside the with block succeed or fail 
        together.
    with connection:
        connection.execute(
            """
            -- ? is a placeholder for a value supplied by Python.
            INSERT INTO members (id, name, email) VALUES (?, ?, ?)
            -- If id conflicts, do nothing to preserve uniqueness.
            ON CONFLICT(id) DO NOTHING
            """,
            (1, "王小明", "ming@example.com"),
        )
~~~

## 75 — 初始化資料：建立課程

穩定 ID：41059｜02:26:50–02:28:00

- 沿用同一個 with connection。
- 重複執行時不會重複建立 id=1 的課程。
- 來源：Notion「SQL Basic」，區塊 31，第 59–65 行。

步驟：以參數建立課程，重複 id 不再新增

~~~python
        connection.execute(
            """
            INSERT INTO courses (id, title, capacity) VALUES (?, ?, ?)
            ON CONFLICT(id) DO NOTHING
            """,
            (1, "Backend Workshop", 30),
        )
~~~

## 76 — 取得 Member 與 Course

穩定 ID：41067｜02:28:00–02:29:30

- SQL 與參數分開傳入；(1,) 是單一元素 tuple。
- fetchone 取得一筆；assert 確認前面初始化的資料存在。
- (1,) 是單一元素 tuple；參數值與 SQL 字串分開傳入。
- 來源：Notion「SQL Basic」，區塊 31，第 67–75 行。

步驟：查詢社員並取出一筆 → 查詢課程並取出一筆 → 確認初始化資料存在

~~~python
    member = connection.execute(
        "SELECT id, name, email FROM members WHERE id = ?",
        (1,),
    ).fetchone() # fetchone retrieves one row.
    course = connection.execute(
        "SELECT id, title, capacity FROM courses WHERE id = ?",
        (1,),
    ).fetchone()
    assert member is not None and course is not None
~~~

## 77 — 查詢是否已報名

穩定 ID：41077｜02:29:30–02:31:50

- SELECT 1 檢查相同配對；fetchone 取得結果。
- 來源：Notion「SQL Basic」，區塊 31，第 77–84 行。

步驟：檢查社員是否已報名該課程

~~~python
    # Return 1 if a row matches both member_id and course_id.
    existing_enrollment = connection.execute(
        """
        SELECT 1 FROM enrollments
        WHERE member_id = ? AND course_id = ?
        """,
        (member["id"], course["id"]),
    ).fetchone()
~~~

## 78 — 尚未報名時新增 Enrollment

穩定 ID：41091｜02:31:50–02:32:30

- 接續 existing_enrollment；只有尚未報名時才在交易內 INSERT。
- 來源：Notion「SQL Basic」，區塊 31，第 85–93 行。

步驟：尚未報名時開啟交易 → 帶入兩個 id 建立報名

~~~python
    if existing_enrollment is None:
        with connection:
            connection.execute(
                """
                INSERT INTO enrollments (member_id, course_id)
                VALUES (?, ?)
                """,
                (member["id"], course["id"]),
            )
~~~

## 79 — 執行 JOIN 並取得結果

穩定 ID：41095｜02:32:30–02:34:50

- Course ID 綁定到 ?；fetchall 取得所有報名資料。
- 來源：Notion「SQL Basic」，區塊 31，第 95–106 行。

步驟：執行 JOIN、帶入 Course ID 並取回所有結果

~~~python
    # READ: JOIN the three tables to retrieve complete enrollment information.
    rows = connection.execute(
        """
        SELECT m.name, c.title, c.capacity, e.status
        FROM enrollments AS e
        JOIN members AS m ON m.id = e.member_id
        JOIN courses AS c ON c.id = e.course_id
        WHERE c.id = ?
        ORDER BY m.id
        """,
        (course["id"],),
    ).fetchall() # fetchall retrieves all rows returned by the query.
~~~

## 80 — 逐筆輸出查詢結果

穩定 ID：41109｜02:34:50–02:35:30

- 接續上一頁的 rows；dict(row) 把 sqlite3.Row 轉成可列印的 dict。
- 來源：Notion「SQL Basic」，區塊 31，第 108–109 行。

步驟：逐筆把 Row 轉為 dict 並輸出

~~~python
    for row in rows:
        print(dict(row))
~~~

## 81 — 更新容量並檢查影響筆數

穩定 ID：41111｜02:35:30–02:36:30

- 將課程容量更新為 35；rowcount 顯示修改筆數。
- updated rows: 1
- 來源：Notion「SQL Basic」，區塊 31，第 111–116 行。

步驟：交易內更新指定課程容量 → 用 rowcount 查看影響筆數

~~~python
    with connection:
        cursor = connection.execute(
            "UPDATE courses SET capacity = ? WHERE id = ?",
            (35, course["id"]),
        )
    print(f"updated rows: {cursor.rowcount}")
~~~

## 82 — 建立暫時課程，再刪除

穩定 ID：41118｜02:36:30–02:38:40

- lastrowid 取得剛新增的 id，再用該 id 刪除。
- 兩個動作位於同一個 with connection 中。
- deleted rows: 1
- 來源：Notion「SQL Basic」，區塊 31，第 118–130 行。

步驟：建立暫時課程 → 取得新增資料的 lastrowid → 以該 id 刪除暫時課程 → 查看刪除筆數

~~~python
    # DELETE: Create a temporary record, then demonstrate deleting it.
    with connection:
        cursor = connection.execute(
            "INSERT INTO courses (title, capacity) VALUES (?, ?)",
            ("Temporary Course", 1),
        )
        # lastrowid retrieves the id of the last inserted row.
        temporary_course_id = cursor.lastrowid
        cursor = connection.execute(
            "DELETE FROM courses WHERE id = ?",
            (temporary_course_id,),
        )
    print(f"deleted rows: {cursor.rowcount}")
~~~

## 83 — 處理限制錯誤並關閉連線

穩定 ID：41132｜02:38:40–02:39:20

- IntegrityError 捕捉違反資料限制的錯誤。
- finally 無論成功或失敗都會關閉 connection。
- 來源：Notion「SQL Basic」，區塊 31，第 132–135 行。

步驟：捕捉資料限制錯誤 → finally 關閉連線

~~~python
except sqlite3.IntegrityError as error:
    print(f"data violates a constraint: {error}")
finally:
    connection.close()
~~~

## 84 — 連續執行兩次，檢查資料保存

穩定 ID：42001｜02:39:20–02:39:44

- 第一次與第二次使用相同的 workshop.db。
- 兩次執行都使用同一個 workshop.db，第二次會讀到前次保存的資料。
- 來源：Notion「SQL Basic」，區塊 32，第 1–2 行。

步驟：第一次執行 → 使用同一資料庫再次執行

~~~bash
python database_demo.py
python database_demo.py
~~~

## 85 — 第一次執行的輸出

穩定 ID：43001｜02:39:44–02:40:24

- 首次顯示容量 30，隨後 UPDATE 改成 35。
- 第二次執行時第一行容量為 35；不會重複新增社員、課程或報名。
- 第二次執行：capacity = 35，其餘筆數仍為 1
- 來源：Notion「SQL Basic」，區塊 33，第 1–3 行。

步驟：JOIN 查詢的報名資料 → UPDATE 影響一筆 → DELETE 影響一筆

~~~plain text
{'name': '王小明', 'title': 'Backend Workshop', 'capacity': 30, 
    'status': 'enrolled'}
updated rows: 1
deleted rows: 1
~~~

## 86 — Transaction：提交與還原

穩定 ID：43｜02:40:24–02:43:04

- with connection 正常結束時 commit；例外離開時 rollback。
- 先看成功分支，再看獨立的失敗情境。失敗時第一筆暫存寫入也還原。
- 這是預設動畫；資料庫程式已展示實際的 with、except 與 finally。

步驟：交易前的狀態 → 兩次寫入暫存 → 成功：COMMIT → 失敗：ROLLBACK

## 87 — 練習：查詢容量至少 20 的課程

穩定 ID：44001｜02:43:04–02:46:48

- 先討論 45 秒，再逐步揭露 SELECT、WHERE、ORDER BY 及參數 tuple。
- 來源：Notion「Exercise: Write a Query」，區塊 34，第 1–9 行。

步驟：先作答，再揭露解答 → 參數化容量篩選、排序並取回結果

~~~python
courses = connection.execute(
    """
    SELECT id, title, capacity
    FROM courses
    WHERE capacity >= ?
    ORDER BY capacity DESC
    """,
    (20,),
).fetchall()
~~~

## 88 — 報名請求的完整處理流程

穩定 ID：44｜02:46:48–02:49:06

- 回到開場的報名按鈕，請學員輪流說出每個節點的責任。
- Client 送出 HTTP 請求，由 FastAPI Route 選擇函式；Validation 驗證輸入，Business Logic 檢查報名條件。
- SQL 表達資料操作，Database 保存資料並檢查限制，Response 將處理結果回傳給 Client。
- 此圖整合講義最後的來源流程；Response 小字使用「回傳處理結果」，不列舉狀態碼。
- Notion「What's Next?」的範例已整合在本頁內容中。

步驟：Client → HTTP → FastAPI Route → Validation → Business Logic → SQL → Database → Response

## 89 — 延伸學習

穩定 ID：47｜02:49:06–02:50:00

- 後續可學習正規化、Migration、權限、測試與部署。
- 下一頁保留十分鐘問答。

步驟：Database Design → Migration → Auth → Testing → Production

## 90 — 問答

穩定 ID：48｜02:50:00–03:00:00

- 保留最後十分鐘回答問題。
- 可用章節選單回到任何程式頁，可從首頁重新開始播放。

步驟：開放提問與課程結語
