# 教材修正紀錄

保留原始講義快照；以下僅修正本機程式與說明，不修改遠端 Notion。

## 2026-09-23 · 版本 8 的呈現調整

- 重新讀取 Notion；最後編輯時間為 2026-09-23T13:05:14.321Z。原有程式修正保留，不修改遠端內容。最新講義已將 notion-07 的 dict 註解與 notion-08 的 list[dict] 回傳型別同步修正，本機 original 欄位據此更新；可執行 code 不變。
- curl 僅在畫面省略來源第 2 行空行，原始碼與其餘來源行號不變。
- 原最後一個來源區塊的流程文字改由請求流程節點呈現，來源覆蓋對照指向 ID 44。
- SQLite 分頁改在完整查詢／新增，以及完整 JOIN 呼叫／輸出迴圈之間切分；程式碼本身不變。

## 2026-09-23 · Python 改用一般 dict

- 依最新版 Notion 移除 TypedDict import 與 CourseData 定義。Function 區塊七行直接採用原文。
- 初次同步時，Function 文字說明殘留 list[CourseData] 與 -> CourseData，投影片及講稿統一使用 list[dict] 與 -> dict；Type Hint 不提供執行期驗證。
- notion-07 的註解改為「find_course 回傳一筆課程 dict」，並統一四格縮排；使用 courses = [...]。
- 初次同步時，notion-08 的參考解答回傳 list[CourseData]，修正為 list[dict]，避免 NameError。題目與篩選邏輯不變。
- Python 引言不再預告 Class；後面的 Pydantic 資料模型與繼承仍保留。
- 下列既有程式修正持續保留。遠端 Notion 未修改；sources/notion.md 保留本次快照，notion-code.json 的 original/code 分別記錄原文與可執行版本。

## notion-17 · Routes and Endpoints

~~~diff
- 		# 這裡 q 就是 query parameter
+     # q 是 query parameter
- 		    course 
+         course
- 				for course in courses 
+         for course in courses
- 				if q.lower() in course["title"].lower()
+         if q.lower() in course["title"].lower()
- 		]
+     ]
~~~

## notion-18 · Pydantic Validation

~~~diff
-     # 限制 CourseTitle 為去掉首尾空白後，长度介於 1～100 的字串
+     # 限制 CourseTitle 為去掉首尾空白後，長度介於 1～100 的字串
~~~

## notion-19 · Pydantic Validation

~~~diff
- 		# 將 payload 轉成 `dict` 後餵給 `Course`
+     # 將 payload 轉成 dict，建立 Course
-     # 忽略沒有傳入的欄位與值為 `none` 的欄位
+     # 忽略未傳入的欄位與值為 None 的欄位
- 		    # 用 changes 覆蓋 stored_course 的值
+         # 用 changes 覆蓋 stored_course 的值
~~~

## notion-24 · Schema, Table, Row, Column

~~~diff
- 		# 之後會解釋甚麼是 PRIMARY KEY
+     -- 下一節會介紹 PRIMARY KEY
~~~

## notion-26 · SQL Basic

~~~diff
- VALUES (1, "Alice", "alice@example.com");
+ VALUES (1, 'Alice', 'alice@example.com');
~~~

## notion-31 · SQL Basic

~~~diff
-     -- 將 (member_id, course_id) 視為 PK，保證 member 不會重複註冊同一堂 course
+     -- 複合主鍵確保同一社員不重複報名同一門課
-     -- DELETE CASCADE 表示 FK REFERENCE 的 PK 所對應的 row 被刪除的話，此 row 也應該被刪除
+     -- 父資料刪除時，ON DELETE CASCADE 一併刪除報名
-             -- 如果 id (FK) 衝突，啥也別做 (保證獨特性)
+             -- 如果 id (PK) 已存在，不重複新增
~~~

SQL 執行結果：第二次執行 capacity 為 35；原初版找不到課程回 200 的行為作為教學對照保留，完整版回 404。
