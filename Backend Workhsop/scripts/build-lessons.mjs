import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { diagramFromSource } from './diagrams.mjs';
import { codeFocus } from './code-focus.mjs';
const read = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const write = (p, value) => writeFileSync(new URL('../' + p, import.meta.url), typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
const base = read('src/content.json');
const sources = read('sources/notion-code.json');
const joinDemo = read('sources/join-demo.json');
// Freeze page numbers and timing before this revision; never infer IDs from
// the already-regenerated deck when rebuilding.
const previousPages = read('sources/revision-7-pages.json');
const previousSeconds = new Map(previousPages.map(p => [p.id, p.durationSeconds]));
const absorbedPages = new Map([[30001,[30005,30011,30015]],[44,[45,45001]]]);
for (const dir of ['docs', 'examples']) mkdirSync(new URL('../' + dir, import.meta.url), { recursive: true });
mkdirSync(new URL('../../public/fonts/', import.meta.url), { recursive: true });
let fontCSS='';
for(const [pkg,family,prefix,folder,weights] of [
  ['plex-sans','IBM Plex Sans','IBMPlexSans','',[['Regular',400],['Medium',500],['SemiBold',600]]],
  ['plex-sans-tc','IBM Plex Sans TC','IBMPlexSansTC','hinted/',[['Regular',400],['Medium',500],['SemiBold',600]]],
  ['plex-mono','IBM Plex Mono','IBMPlexMono','',[['Regular',400],['Medium',500]]],
]){
  for(const [name,weight] of weights){
    const file=prefix+'-'+name+'.woff2';
    copyFileSync(new URL('../../node_modules/@ibm/'+pkg+'/fonts/complete/woff2/'+folder+file,import.meta.url),new URL('../../public/fonts/'+file,import.meta.url));
    fontCSS+="@font-face{font-family:'"+family+"';font-weight:"+weight+";font-style:normal;font-display:swap;src:url('/fonts/"+file+"') format('woff2')}\n";
  }
  copyFileSync(new URL('../../node_modules/@ibm/'+pkg+'/LICENSE.txt',import.meta.url),new URL('../../public/fonts/'+pkg+'-LICENSE.txt',import.meta.url));
}
for(const weight of [400,500]){
  const file='jetbrains-mono-latin-'+weight+'-normal.woff2';
  copyFileSync(new URL('../../node_modules/@fontsource/jetbrains-mono/files/'+file,import.meta.url),new URL('../../public/fonts/'+file,import.meta.url));
  fontCSS+="@font-face{font-family:'JetBrains Mono';font-weight:"+weight+";font-style:normal;font-display:swap;src:url('/fonts/"+file+"') format('woff2')}\n";
}
copyFileSync(new URL('../../node_modules/@fontsource/jetbrains-mono/LICENSE',import.meta.url),new URL('../../public/fonts/jetbrains-mono-LICENSE.txt',import.meta.url));
write('src/fonts.css',fontCSS);
const groups = [
  ['intro', '開場與環境', '開始之前', 384, 0],
  ['python', 'Python 與練習', 'Python', 960, 0],
  ['web', 'Web、HTTP 與 API', 'Web & HTTP', 1291, 1],
  ['rest', 'REST 介面設計', 'API Design', 629, 1],
  ['basics', 'FastAPI 路由與參數', 'FastAPI', 960, 2],
  ['validation', 'Pydantic 資料驗證', 'Validation', 960, 2],
  ['break', '休息', '休息十分鐘', 600, 2],
  ['crud', '完整 CRUD 與測試', 'Course API', 1536, 2],
  ['database', 'Database 與資料關聯', 'Database', 545, 4],
  ['sql', 'SQL 與 SQLite 程式', 'SQL & SQLite', 1759, 3],
  ['transaction', 'Transaction 與查詢練習', 'Transaction', 384, 4],
  ['wrap', '回顧與延伸', 'Review', 192, 4],
  ['qa', '問答', 'Q & A', 600, 4],
].map(([id, name, en, seconds, flowStage]) => ({ id, name, en, seconds, flowStage }));
const titles = {
  1:'按下報名按鈕之後，發生什麼事？',2:'一次報名請求的處理流程',3:'本次課程的學習目標',4:'今天的課程內容',5:'開發環境確認',
  6:'Python：型別、函式與資料結構',7:'函式的參數與回傳值',8:'Python dict 與 JSON',9:'使用 Exception 處理找不到的資料',
  10:'Client 與 Server',11:'Client 與 Server 的一次往返',12:'Frontend、Backend 與 Database 的分工',13:'HTTP Request 的組成',
  14:'HTTP Method 與資料操作',15:'HTTP Status Code',16:'HTTP Response 的組成',17:'API 的請求與回應規格',
  18:'建立第一個 FastAPI Endpoint',19:'Route 與 Endpoint',20:'Path Parameter 與型別轉換',21:'使用 Query Parameter 篩選資料',
  22:'輸入資料需要哪些驗證？',23:'使用 Pydantic 驗證輸入',24:'建立、更新與回傳的資料模型',25:'POST：建立課程',
  26:'PATCH：部分更新課程',27:'使用 Swagger UI 查看與測試 API',28:'休息十分鐘',29:'比較兩種 API 路徑設計',
  30:'REST：Resource 與 HTTP Method',31:'Collection 與 Item',32:'Path、Query 與 Body 的用途',33:'Stateless：獨立處理每個請求',
  34:'練習：設計 Enrollment API',35:'記憶體儲存的限制',36:'Database、DBMS 與資料檔案',37:'Table、Column 與 Row',
  38:'資料庫的鍵與限制條件',39:'用關聯表表示課程報名',40:'SQL 的 CRUD',41:'JOIN：資料如何變成結果',
  42:'在 Python 中執行參數化 SQL',43:'Transaction：提交與還原',44:'報名請求的完整處理流程',45:'課程重點回顧',46:'Final Lab',47:'延伸學習',
};
const cues = {
  1:['先想想：按下報名之後，資料去了哪裡？','按鈕送出報名請求','Server 接收並處理','Database 保存報名資料','確認訊息回到畫面'],2:['Client 發出請求','HTTP 傳遞訊息','FastAPI 處理請求','SQL 操作資料','Database 保存結果'],
  3:['看懂請求與回應','設計 API','讀懂完整程式'],4:['今天的教學內容與順序'],5:['確認 Python','建立環境','準備啟動'],
  6:['Function','Type Hint','list / dict','Exception'],8:['Python dict','JSON 文字'],
  10:['Client','Server','請求與回應'],11:['Client 與 Server','送出 HTTP Request','Server 執行業務邏輯','傳回 200 與 JSON'],12:['使用者與 Frontend','HTTP Request 到 Backend','SQL 到 Database','資料與回應沿原路返回'],
  13:['Method','Path','Headers','Body'],14:['GET / POST','PUT / PATCH','DELETE','只改容量用哪個 Method？','答案：PATCH'],
  15:['2xx','4xx','5xx'],16:['Status line','Headers','Body','204 應移除哪個部分？','答案：Body'],
  17:['Method 與 Path','成功回應','失敗回應'],19:['Endpoint：對外提供的操作','Route：請求與處理函式的配對規則','GET /courses/12 如何進入函式'],20:['路由中的 course_id','取出 URL 的 1','轉成整數並進入函式','把輸入換成 abc','422：型別轉換失敗，函式不會執行'],
  21:['完整清單','q 帶入函式','篩選結果'],22:['先判斷輸入','合法資料','內容不符規則','型別不符'],
  24:['建立資料','部分更新','回傳資料'],27:['開啟 /docs，自行測試兩種 Request Body'],28:['休息十分鐘'],
  29:['動作寫在 Path','Resource 與 Method'],30:['Resource','URL','Method'],31:['Collection','Item','CRUD endpoints'],
  32:['Path 識別課程','Query 篩選標題','Body 提交修改'],33:['請求資訊完整','交給不同 Server','仍可保存資料'],
  34:['先討論 60–90 秒','Method、Path 與 Body','201 Created','409 Conflict'],35:['記憶體資料','重新啟動','持久儲存'],
  36:['Client 與 FastAPI','SQL 到 SQLite','讀寫 workshop.db','Rows 與 JSON 傳回 Client'],37:['Table','Column：capacity','Row：完整第一筆'],
  38:['PRIMARY KEY','FOREIGN KEY','NOT NULL / UNIQUE','CHECK / DEFAULT'],39:['多對多','中介表','複合主鍵'],
  40:['INSERT','SELECT','UPDATE','DELETE'],41:joinDemo.stages.map(stage=>stage.label),
  43:['交易前的狀態','兩次寫入暫存','成功：COMMIT','失敗：ROLLBACK'],
  44:['Client','HTTP','FastAPI Route','Validation','Business Logic','SQL','Database','Response'],45:['HTTP','Backend','Database'],
  46:['未列入播放'],47:['Database Design','Migration','Auth','Testing','Production'],
};
const motions = {2:'request',11:'request',13:'anatomy',16:'anatomy',17:'continuity',19:'parameter',20:'parameter',21:'filter',24:'model',29:'compare',32:'anatomy',37:'table',38:'validation',39:'relation',40:'mutation',41:'join',43:'transaction',44:'request',14:'question',34:'question'};
const specialNotes = {
  1:['先請學員想像自己正在社團網站報名課程，問：「按下去之後，資料去了哪裡？」','保留思考時間，再按報名按鈕或下一步。兩者都只推進一次。','請求先抵達 Server，檢查輸入與報名條件，再交給 Database 保存。','資料保存成功後才把確認訊息送回。這是概念示意，不是執行中的報名 API。','下一頁將旅程攤平成五個節點，逐一介紹 HTTP、FastAPI 與 SQL。'],
  2:['上一頁已看到報名成功；這裡從 Client 發出請求開始，拆解五個環節。','逐步介紹 HTTP 傳遞訊息、FastAPI 處理請求、SQL 表達操作、Database 保存結果。','這條路徑是整堂課的地圖，回顧時會再串接一次。'],
  4:['一次說明今天的十三個主題，由左欄上到下，再接右欄上到下。','課程總覽之後確認環境，再從 Python、Web 與 REST 進入 FastAPI；休息後完成 CRUD，再學習資料庫、SQL、Transaction，最後回顧與問答。','畫面只保留總長 180 min；逐頁時間保留於教材來源。'],
  6:['先複習 Function、Type Hint、list / dict 與 Exception。','接下來使用一般 dict 表示課程資料；Type Hint 提供閱讀與靜態分析資訊，執行期驗證稍後交給 Pydantic。'],
  19:['Endpoint 是對外提供的 API 操作，以 Method 與 Path 說明，例如 GET /courses/{course_id}。','Route 是配對規則：收到符合 Method 與 Path 的請求時，交给 get_course 處理。FastAPI 的 decorator 建立這個配對。','例如 GET /courses/12：先配對路由，再把 course_id=12 傳入 get_course，最後把回傳資料序列化為 JSON。型別轉換會在後面的 Path 頁詳細說明。'],
  17:['先定義 Method、Path、輸入與成功／失敗回應。','接著比較 REST 的資源命名，再進入 FastAPI 實作。'],
  20:['先對照路由 /courses/{course_id} 與函式參數。','從 /courses/1 取出字串 1，再轉為整數，交給 get_course。','切換為 /courses/abc；FastAPI 無法轉為 int，回傳 422，函式本體沒有執行。','不要把型別錯誤與找不到資料混在一起：初版找不到 id 仍回 200；完整版才改成 404。'],
  21:['q 是前面介紹過的標題搜尋條件。','不帶 q 時保留全部資料；q=database 時只留下 Database Training。'],
  27:['先執行 fastapi dev main.py，啟動自己的 FastAPI 伺服器。','在學員自己的電腦開啟 http://127.0.0.1:8000/docs，展開 POST /courses，再依序選 Try it out、貼上 Body、Execute。','先試 title=System Design、capacity=50，預期 201 Created；再試空 title 與 capacity=0，預期 422。兩個欄位都違反驗證規則。','兩份 JSON 與預期結果一次呈現，請學員到自己的 /docs 實際驗證。'],
  28:['首次進入自動開始十分鐘倒數；離開與返回仍接續，時間到停在 00:00。可暫停或重設；重設後按開始才重新倒數。','回來後把模型與路由組成完整的 Course CRUD API，再進入 Database。'],
  32:['GET /courses/1：Path 中的 1 識別課程。','GET /courses?q=database：q 代表標題包含的關鍵字。','PATCH /courses/1：Body 的 capacity=35 是要修改的資料。不要將搜尋 q 塞進 PATCH。'],
  37:['Table 保存同一類資料；Column 是屬性；Row 是一筆資料。','第一筆的 id、title、capacity 三個儲存格都要一起高亮。','下一頁用 CREATE TABLE 對照欄位、型別與限制。'],
  43:['with connection 正常結束時 commit；例外離開時 rollback。','先看成功分支，再看獨立的失敗情境。失敗時第一筆暫存寫入也還原。','這是預設動畫；資料庫程式已展示實際的 with、except 與 finally。'],
  44:['回到開場的報名按鈕，請學員輪流說出每個節點的責任。','Client 送出 HTTP 請求，由 FastAPI Route 選擇函式；Validation 驗證輸入，Business Logic 檢查報名條件。','SQL 表達資料操作，Database 保存資料並檢查限制，Response 將處理結果回傳給 Client。','此圖整合講義最後的來源流程；Response 小字使用「回傳處理結果」，不列舉狀態碼。'],
  47:['後續可學習正規化、Migration、權限、測試與部署。','下一頁保留十分鐘問答。'],
};
const sceneMotion = {
  4:'180 min 位於內容上方中央；兩欄一次呈現全部十三個主題，左七右六，序號表示先左後右的教學順序。',
  19:'Method／Path、配對規則與函式固定排列；依步驟標示 Endpoint、Route，最後用實際 course_id=12 說明一次呼叫。',
  28:'實際進入本頁才啟動共享倒數；下一頁預覽不啟動。倒數到零固定顯示 00:00，不自動換頁。',
  3:'三欄分別呈現理解、設計、實作；每一步只揭露當下目標，標題與頁碼保持固定。',
  5:'依序確認 Python、虛擬環境與套件；三欄保留留白，最後呈現啟動指令。',
  6:'四項 Python 概念使用固定的兩欄構圖，逐項揭露名稱與用途。',
  2:'Client、HTTP、FastAPI、SQL、Database 固定排列；藍色標記依手動步驟移到目前節點。',
  13:'訊息各部分在同一連續閱讀面依序出現；淺藍底與細側線標示目前區段，標籤位於同一列。',
  16:'先拆解 Status line、Headers、Body；提問後再揭露 204 沒有 Body。',
  20:'路由、型別轉換、函式保持固定位置，以淺藍底表示焦點；abc 在轉型處以紅色顯示 422。',
  21:'完整 URL 保留在上方；q 的值移入函式，下一步才移除不符合條件的課程並重排。',
  24:'Create、Update、Response 共用欄位列；依步驟揭露欄位規則，淺藍底標示目前模型。',
  27:'整頁一次顯示操作步驟、兩份 JSON 與預期結果；沒有模擬介面、送出動畫或答案揭露。請學員在自己的 /docs 實際操作。',
  37:'Column 的 capacity 與 Row 的第一筆資料，分別將對應儲存格完整填入淺藍底。',
  39:'先展示兩端資料表，再揭露中介表與一對多關係；最後呈現完整欄位、PK 與 FK。',
  41:'三張來源表固定可見；高亮配對鍵、補上欄位、篩選、投影，最後調整列序。對照前頁的完整 SQL。',
  43:'暫存變更保留在左側，COMMIT 移入右側資料庫；獨立失敗情境回到左側並顯示還原。',
  47:'五個等距學習方向與引言在內容區垂直置中；手動逐項揭露，連線止於首尾節點中心。',
  44:'藍色標記沿固定節點移動，依序說明報名請求的八個處理環節。',
};
const pages = [];
const usage = new Map(sources.map(s => [s.id, new Map()]));
const diagrams=[];
const integratedSourceIds=new Set();
const integratedReferences=new Map();
function integrateDiagram(block,slideId,weight){
  const diagram=diagramFromSource(source(block),slideId);diagrams.push(diagram);
  const page=pages.find(p=>p.id===slideId);page.weight+=weight;page.diagramSource=diagram.sourceId;
  page.notes.push('此圖完整整合 Notion 區塊 '+block+'；節點、箭頭與欄位均可追溯。');
  for(const ref of diagram.references)usage.get(diagram.sourceId).set(ref.line,[slideId]);
}
function integrateCode(block,slideId,weight=0,reference){
  const s=source(block),page=pages.find(p=>p.id===slideId);
  integratedSourceIds.add(s.id);
  page.weight+=weight;
  const note='Notion「'+s.section+'」的範例已整合在本頁內容中。';
  if(!page.notes.includes(note))page.notes.push(note);
  const references=new Map();
  for(const [index,line] of s.code.split('\n').entries())if(line.trim()){
    usage.get(s.id).set(index+1,[slideId]);
    references.set(index+1,reference?.(index+1)??{target:block===21?'swagger-valid-body':'swagger-invalid-body',step:0});
  }
  integratedReferences.set(s.id,references);
}
function scene(id, group, weight = 1) {
  const s = base.find(s => s.id === id);
  pages.push({...s, title:titles[id], group, kind:'scene', cues:cues[id] ?? ['介紹','觀察結果'], animation:motions[id] ?? 'reveal', weight, excerpt:null, exercise:null,
    notes:specialNotes[id] ?? s.notes, motion:[ sceneMotion[id] ?? '每一步由講者手動推進；短距離揭露後停留，保留可讀狀態。' ], hidden:id===46});
}
// A display row is explicit: wrapping cannot silently exceed the 14-row limit.
function width(text) { return [...text].reduce((n,c) => n + (c.codePointAt(0)>0x2e7f ? 2 : 1),0); }
function wrap(text) {
  const rows=[]; let remaining=text; let continuation=false;
  const indent=Math.min(20,(text.match(/^\s*/)?.[0].length??0)+4);
  const rowLimit = /^\s*(#|--)/.test(text) ? 81 : 72;
  while(width(remaining)>rowLimit) {
    let end=0,w=0;
    for(const c of remaining){const cw=width(c);if(w+cw>rowLimit)break;w+=cw;end+=c.length;}
    const space=remaining.lastIndexOf(' ',end);
    if(space>Math.min(30,end/2))end=space+1;
    rows.push({text:remaining.slice(0,end),continuation,continuationIndent:continuation?indent:0});
    remaining=' '.repeat(indent)+remaining.slice(end); continuation=true;
  }
  rows.push({text:remaining,continuation,continuationIndent:continuation?indent:0});return rows;
}
function source(id) { return sources[id-1]; }
const exerciseExamples = {
  8: [
    {"title":"輸入 courses","columns":["ID","課程","容量"],"rows":[["1","Backend Workshop","30"],["2","Database Workshop","25"]]},
    {"title":"預期結果","columns":["minimum_capacity","回傳課程 ID"],"rows":[["25","[1, 2]"],["30","[1]"],["31","[]"]]},
  ],
  34: [
    {"title":"範例輸入 courses","columns":["ID","課程","容量"],"rows":[["2","Database Workshop","20"],["3","Web Workshop","10"],["1","Backend Workshop","30"]]},
    {"title":"預期結果（容量 ≥ 20）","columns":["ID","課程","容量"],"rows":[["1","Backend Workshop","30"],["2","Database Workshop","20"]]},
  ],
};
function code(id, start, end, group, title, notes, options={}) {
  const s=source(id), lines=s.code.split('\n');end=end??lines.length;
  const rows=lines.slice(start-1,end).flatMap((line,i)=>options.omitBlankLines?.includes(start+i)&&!line.trim()?[]:wrap(line).map(r=>({...r,sourceLine:start+i})));
  // Keep logical lines together where possible, while limiting all visual rows.
  const chunks=[];let chunk=[];
  for(let i=0;i<rows.length;){
    const same=rows.filter((r,j)=>j>=i&&r.sourceLine===rows[i].sourceLine);
    if(chunk.length+same.length>14){chunks.push(chunk);chunk=[];}
    chunk.push(...same);i+=same.length;
  }
  if(chunk.length)chunks.push(chunk);
  for(let part=0;part<chunks.length;part++){
    let rs=chunks[part];
    while(rs.length && !rs[0].text.trim())rs=rs.slice(1);
    while(rs.length && !rs.at(-1).text.trim())rs=rs.slice(0,-1);
    if(!rs.length)continue;
    const pageId=part===0&&options.id ? options.id : 10000+id*1000+rs[0].sourceLine;
    const focusRanges=codeFocus[pageId];
    if(!focusRanges?.length)throw new Error('Missing explicit focus groups for '+pageId);
    for(const [from,to,label] of focusRanges){
      if(!label||from>to||!rs.some(r=>r.sourceLine===from)||!rs.some(r=>r.sourceLine===to))throw new Error('Invalid focus group for '+pageId);
    }
    for(const row of rs)if(row.text.trim()&&!focusRanges.some(([from,to])=>row.sourceLine>=from&&row.sourceLine<=to))throw new Error('Unfocused source line '+pageId+':'+row.sourceLine);
    const focus=focusRanges.length;
    const pageTitle=title+(chunks.length>1?' · '+(part+1)+'/'+chunks.length:'');
    const prompt=options.exercise??null;
    const codeCues=focusRanges.map(r=>r[2]);
    pages.push({
      id:pageId,title:pageTitle,group,kind:'code',hidden:false,weight:options.weight??Math.max(.5,rs.length/8),
      cues:prompt?['先作答，再揭露解答',...codeCues]:codeCues,
      notes:[...notes,...(exerciseExamples[id]??[]).map(table=>table.title+'：'+table.rows.map(row=>row.join(' / ')).join('；')),...(options.result?[options.result]:[]),'來源：Notion「'+s.section+'」，區塊 '+id+'，第 '+rs[0].sourceLine+'–'+rs.at(-1).sourceLine+' 行。',
        ...(part>0?['接續前頁同一份程式；縮排與行號保持原始上下文。']:[])],
      motion:['逐段移動程式碼聚焦框。'+(prompt?'答案只在講者手動推進後揭露。':'')],
      code:[{lang:s.lang,text:rs.map(r=>r.text).join('\n')}],
      animation:prompt?'question':'code',exercise:prompt,
      excerpt:{sourceId:s.id,block:id,filename:options.filename??(id===19?'main.py':id===31?'database_demo.py':s.lang==='python'?'main.py':s.lang==='sql'?'schema.sql':'terminal'),rows:rs,part:part+1,parts:chunks.length,context:options.context??'',focus,focusRanges,explanations:options.explanations??[],exerciseExamples:exerciseExamples[id]??[]},
    });
    for(const r of rs)if(r.text.trim()){
      const list=usage.get(s.id).get(r.sourceLine)??[];
      if(!list.includes(pageId))list.push(pageId);
      usage.get(s.id).set(r.sourceLine,list);
    }
  }
}
function all(id,group,title,notes,options={}){code(id,1,null,group,title,notes,options);}
pages.push({id:49,title:'Backend Workshop',group:'intro',kind:'scene',hidden:false,weight:0,fixedSeconds:20,cues:['開課：Backend Workshop'],animation:'cover',notes:['開課前停留於此。正式開始時簡短介紹今天會使用 HTTP、FastAPI 與 SQLite。','下一頁從報名按鈕開始，先提問，再手動播放資料旅程。'],motion:['單行 Backend Workshop 以近黑大字固定於視覺中心，底部中央的 NYCU SDC 上移並加重 SDC，避開操作列。白色背景右上方的霧面弧面以 24 秒緩慢往返循環，只有背景移動；首頁預覽與減少動態效果呈現靜態弧面。下一步以 0.3 秒淡化切換到報名問題。'],code:[],excerpt:null,exercise:null});
scene(1,'intro',1);scene(2,'intro',.8);scene(3,'intro',.7);scene(4,'intro',.5);
pages.find(p=>p.id===1).animation='journey';
pages.find(p=>p.id===1).motion=['五個狀態各自手動推進：提問、送出、處理、保存、成功。Client 固定在左，Server 與資料表依序出現。','細線標示請求方向，藍色標記抵達處理節點；保存後才顯示 201 回傳與成功按鈕。一般揭露 0.45 秒，請求移動 0.65 秒。退回呈現對應狀態，首頁預覽不播放。'];
all(1,'intro','確認 Python 版本',['macOS／Linux 使用 python3；Windows 可使用 py。','需要 Python 3.10 以上。'],{weight:.25});
const environmentSetup = [
  {title:'專案資料夾放程式碼',lines:['backend-workshop 是專案目錄；之後的 main.py 放在這裡，與 .venv 並列。'],prompt:''},
  {title:'.venv 是這個專案的 Python 環境',lines:['存放專案專用的 Python 執行環境與套件，隔離不同專案的套件版本。','建立完成會出現 .venv/ 資料夾；目前終端機還沒有啟用它。'],prompt:''},
];
const environmentActivation = {
  title:'啟用成功的提示符',
  lines:['提示符前通常會出現 (.venv)；後續 python 與 python -m pip 使用這個環境。','只作用於目前終端機；新開終端機需要再次啟用。'],
};
all(2,'intro','建立專案與虛擬環境',environmentSetup.flatMap(item=>[item.title,...item.lines]),{weight:.4});
all(3,'intro','啟用環境：macOS／Linux',['在專案目錄執行 source .venv/bin/activate。',...environmentActivation.lines,'成功提示符示意：(.venv) backend-workshop %'],{weight:.2,explanations:[{...environmentActivation,lines:[],prompt:'backend-workshop %'}]});
all(4,'intro','啟用環境：Windows PowerShell',['在專案目錄執行 Activate.ps1。',...environmentActivation.lines,'成功提示符示意：(.venv) PS C:\\...\\backend-workshop>'],{weight:.2,explanations:[{...environmentActivation,lines:[],prompt:'PS C:\\...\\backend-workshop>'}]});
all(5,'intro','安裝 FastAPI',['fastapi[standard] 包含課程使用的開發伺服器。SQLite 已在 Python 標準函式庫。'],{weight:.3,result:'fastapi[standard] 會一併安裝本課使用的開發伺服器；SQLite 已在 Python 標準函式庫。'});
scene(6,'python',.7);
code(6,1,7,'python','Function',['courses: list[dict] 接收課程清單；course_id: int 接收要查找的 ID；-> dict 表示回傳一筆課程。Type Hint 本身不進行執行期驗證。','依序比較 id；找到便回傳整筆 dict。','迴圈結束仍沒找到時，拋出 ValueError。'],{id:7,filename:'python_recap.py'});
scene(8,'python',.8);
all(7,'python','使用 list、dict 與 Exception',['list 儲存多筆課程；dict 儲存每筆的欄位。','查找 id=3 會拋出 ValueError；except 顯示錯誤。'],{id:9,filename:'python_recap.py'});
all(8,'python','練習：篩選課程容量',['先留 45 秒作答，再展示參考解答。','保留容量大於等於 minimum_capacity 的課程，回傳 list[dict]。'],{exercise:'實作 filter_courses(courses, minimum_capacity)，回傳容量達標的課程，並補上 Type Hint。',filename:'python_recap.py',weight:1.5});
scene(10,'web');scene(11,'web');
integrateDiagram(9,11,.25);
scene(12,'web');
integrateDiagram(10,12,.25);
scene(13,'web');
integrateCode(11,13,0,line=>({target:line===1?'request-start':line<=3?'request-headers':'request-body',step:line===1?1:line<=3?2:3}));
scene(14,'web');scene(15,'web');scene(16,'web');
integrateCode(12,16,0,line=>({target:line===1?'response-start':line<=3?'response-headers':'response-body',step:line===1?0:line<=3?1:2}));
scene(17,'web');
pages.push({id:23001,title:'Path Parameter 與 Query Parameter',group:'web',kind:'scene',hidden:false,weight:1,cues:['完整 URL','Path Parameter：12 識別課程','Query Parameter：是否包含報名資訊'],animation:'parameter',notes:['先展示 GET /courses/12?include_enrollments=true，兩種參數都在同一個 URL 中。','Path 中的 12 指定課程；? 後的 include_enrollments=true 調整回傳內容，要求包含報名資訊。','這是介面設計範例；本次 Course API 沒有實作 include_enrollments。後面的 q 是課程標題搜尋參數，會在首次出現時介紹。'],motion:['URL 與標籤保持固定。第一步展示完整 URL，第二步以淺藍底高亮 12，第三步將高亮移至 include_enrollments=true。不出現 Body 或觀察結果區。'],code:[],excerpt:null,exercise:null});
integrateCode(13,23001,0,()=>({target:'parameter-url',step:0}));
scene(29,'rest');
integrateCode(14,29,0,line=>({target:'rest-line-'+line,step:[1,4].includes(line)?0:1}));
scene(30,'rest');scene(31,'rest');scene(33,'rest');
all(15,'basics','建立第一個 FastAPI Endpoint',['FastAPI 是用 Python 建立 Web API 的框架。','匯入 FastAPI、建立 app、註冊 GET /，最後回傳 JSON。'],{id:18,result:'GET / → 200  ·  {"message": "Hello, backend!"}'});
all(16,'basics','啟動開發伺服器',['main.py 是目前的檔案；開啟 http://127.0.0.1:8000/ 查看回應。'],{weight:.3,result:'開啟 http://127.0.0.1:8000/ 查看 API 回應。'});
scene(19,'basics',.7);
code(17,1,4,'basics','建立記憶體課程清單',['這是初版：list 裡放 dict。完整版會改為以 id 查找的字典。']);
code(17,7,16,'basics','GET /courses：完整的初版查詢',['這裡首次介紹 q：Query Parameter，用來搜尋課程標題，例如 GET /courses?q=database。','q 省略時回傳全部資料；提供 q 時比對課程標題。']);
scene(21,'basics',.7);
code(17,19,24,'basics','GET 單筆課程：初版實作',['此版本找不到課程仍回 200 搭配 error，稍後會改成 HTTPException 404。'],{result:'目前找不到課程仍回 200；稍後會改成 HTTP 404。'});
scene(20,'basics',.7);
scene(22,'validation',.8);
code(18,1,8,'validation','Pydantic：匯入型別與驗證工具',['Annotated 將型別與限制組合；BaseModel 定義資料模型。'],{id:23});
code(18,10,20,'validation','CourseTitle 與 CourseCreate',['標題去除前後空白，長度 1–100；容量大於 0 且不超過 500。']);
code(18,22,33,'validation','CourseUpdate：可省略的更新欄位',['此 API 約定省略或 null 代表不修改。','Field 的 default、gt、le 與 description 都完整保留。'],{result:'本 API 約定：省略欄位或傳入 null，都表示不修改。'});
code(18,36,37,'validation','Course：回傳 Server 配發的 id',['Course 繼承 CourseCreate，再加入 id。'],{weight:.4});
scene(24,'validation',.8);
scene(28,'break');
code(19,1,6,'crud','完整版 main.py：匯入與 app',['現在開始組成完整的 main.py。','前面三種模型沿用；完整原始碼的模型段落已在 Pydantic 頁逐一展示。']);
code(19,38,44,'crud','CourseId 與資料初始化',['Path(ge=1) 限制課程 id 為正整數。','courses 改為 dict[int, Course]，以 id 查找。next_course_id 從 3 開始。']);
code(19,47,51,'crud','find_course：找不到便回 404',['與 Python 複習的查找函式比較：此處的例外會轉成 HTTP 404。'],{result:'資料不存在時，由共用函式統一轉成 HTTP 404。'});
code(19,54,56,'crud','完整版的根路徑',['完整版本的回應訊息改為 Course API is running。'],{weight:.35});
code(19,59,63,'crud','GET 清單：路由與參數',['q 限制長度 1–50；min_capacity 限制至少為 1。','先定義輸入；下一頁接續同一個函式本體。'],{id:29059,weight:.85,context:'list_courses · 1/2'});
code(19,64,75,'crud','GET 清單：排序、篩選與回傳',['沿用上一頁的 q 與 min_capacity，讀取排序後的課程。','q 有值時以 casefold 比對；min_capacity 有值時篩選容量，最後回傳 result。'],{id:29072,weight:1.525,context:'list_courses · 2/2'});
code(19,78,80,'crud','GET 單筆：共用查找與回應模型',['CourseId 已在前面定義；找不到由 find_course 統一回 404。'],{weight:.5});
function unpackingScene(id,title,cues,notes,animation) {
  pages.push({id,title,group:'crud',kind:'scene',hidden:false,cues,notes,motion:['手動推進時，程式碼中的 ** 運算式展開來源 dict；key 與 value 移入實際參數或 dict 欄位，返回時還原前一步。'],code:[],excerpt:null,exercise:null,animation});
}
code(19,83,96,'crud','POST：建立課程',['body 先通過 CourseCreate，再配發 id、保存資料。','201 與 Location 告知新資源的位置；完整 decorators、headers 與 return 皆保留。'],{id:25,result:'201 Created  ·  Location: /courses/3'});
unpackingScene(50001,'**：dict 展開成具名參數',['Course 呼叫與來源 dict','** 帶入 dict 欄位','展開為具名參數'],['payload.model_dump() 回傳 title 與 capacity 的 dict。','** 在函式呼叫中把 dict 展開為具名參數；id=3 由 Server 提供。'],'unpack');
code(19,99,107,'crud','PATCH：驗證更新內容',['先查找資料；不存在回 404。','exclude_unset 與 exclude_none 只留下要修改的值；沒有修改內容回 400。','下一頁接續同一函式，合併、保存並回傳。'],{id:26,context:'update_course · 1/2',result:'changes 只保留本次提供且非 null 的欄位'});
code(19,108,113,'crud','PATCH：合併、儲存與回傳',['接續上一頁的 update_course 函式，沿用 stored_course 與 changes。','用 changes 覆蓋舊資料，重新驗證後寫回 courses 並回傳。'],{context:'update_course · 2/2',result:'合併 stored_course 與 changes，驗證後保存並回傳 updated_course'});
unpackingScene(50002,'**：合併 dict 與覆蓋欄位',['兩份 dict 與合併運算式','展開左側舊資料','展開右側並覆蓋 capacity'],['舊資料保留 id=1、title=Backend Workshop、capacity=30。','changes 只有 capacity=35；右側同名欄位覆蓋左側，id 與 title 保持不變。'],'merge');
code(19,116,124,'crud','DELETE：刪除課程',['先用 find_course 確認存在；不存在回 404。','del 移除資料；回傳 204，沒有 Response Body。'],{context:'delete_course(course_id)',result:'204 No Content  ·  Response Body 為空'});
all(20,'crud','使用 curl 測試 Course API',['GET 取得清單；q 與 min_capacity 篩選課程。','-i 顯示 Response Headers；-X 指定 Method；-H 與 -d 傳入 JSON。','POST 建立 API Design；PATCH 將課程 1 的 capacity 改為 35；DELETE 刪除課程 2。','請在自己的終端機執行；此頁只聚焦指令，不模擬送出或回應。'],{id:30001,omitBlankLines:[2]});
scene(27,'crud',1);
integrateCode(21,27,.25);
integrateCode(22,27,.25);
scene(35,'database',.7);scene(36,'database',.7);
integrateDiagram(23,36,.2);
scene(37,'database',.8);
all(24,'database','Schema：用 SQL 定義資料表',['欄位名稱、型別與限制共同構成 Schema。','對照上一頁 courses 的 id、title 與 capacity。'],{result:'id → INTEGER / PRIMARY KEY   ·   title → TEXT   ·   capacity → INTEGER'});
scene(38,'database',1);scene(39,'database',1);
integrateDiagram(25,39,.6);
scene(40,'sql',.6);
for(const [id,title] of [[26,'INSERT：新增社員'],[27,'SELECT：查詢社員'],[28,'UPDATE：修改 Email'],[29,'DELETE：刪除社員']])
  all(id,'sql',title,['使用講義原本的 members 範例。注意資料值與 WHERE 範圍。'],{weight:.4});
all(30,'sql','JOIN 的完整查詢',['先逐段聚焦完整 SQL，下一頁以多筆資料展示查詢作用。','m、c、e 是別名；? = 1，只保留 Backend Workshop 的報名。','FROM、JOIN、WHERE、SELECT、ORDER BY 是理解資料處理的概念順序。'],{weight:.6,context:'? = 1'});
scene(41,'sql',1.2);
const joinPage=pages.find(p=>p.id===41);
joinPage.code=[];joinPage.animation='join-query';joinPage.joinDemo=joinDemo;
joinPage.motion=['三張來源表與結果表上下呈現；依 FROM、兩次 JOIN、WHERE、SELECT、ORDER BY 手動推進。','結果儲存格與資料列始終保留同一節點；只以單層位移和透明度補欄位、移除未符合資料、投影及排序，返回可逆。'];
code(31,1,14,'sql','SQLite 程式：路徑與 members Schema',['database_demo.py 與 workshop.db 位於同一資料夾。','SCHEMA 是多行 SQL 字串，接下來兩頁繼續定義資料表。'],{context:'SCHEMA = """',result:'name 不可空白 · email 不可重複 · joined_at 有預設值'});
code(31,16,22,'sql','courses Schema：限制容量與標題',['typeof(capacity) 確保整數；容量範圍為 1–500。','created_at 使用 CURRENT_TIMESTAMP。'],{context:'SCHEMA 多行字串（接續）'});
code(31,24,36,'sql','enrollments Schema：主鍵與外鍵',['複合主鍵防止重複報名；外鍵確保 Member 與 Course 存在。','ON DELETE CASCADE 會連帶刪除相關報名；status 僅允許 enrolled 或 completed。'],{context:'SCHEMA 多行字串（接續並結束）'});
code(31,38,45,'sql','連線、Row 與外鍵檢查',['sqlite3.Row 允許依欄位名稱存取。','每個 connection 都需啟用 foreign_keys；executescript 執行前面完整 SCHEMA。'],{id:42,result:'SQLite 的 foreign_keys 必須在每個 connection 明確啟用。'});
code(31,47,58,'sql','初始化資料：建立社員',['try 包住後續操作；with connection 定義交易範圍。','ON CONFLICT(id) DO NOTHING 的 id 是 PRIMARY KEY。'],{context:'try → with connection'});
code(31,59,65,'sql','初始化資料：建立課程',['沿用同一個 with connection。','重複執行時不會重複建立 id=1 的課程。'],{context:'try → with connection（接續）'});
code(31,67,75,'sql','取得 Member 與 Course',['SQL 與參數分開傳入；(1,) 是單一元素 tuple。','fetchone 取得一筆；assert 確認前面初始化的資料存在。'],{context:'try 區塊',result:'(1,) 是單一元素 tuple；參數值與 SQL 字串分開傳入。'});
code(31,77,84,'sql','查詢是否已報名',['SELECT 1 檢查相同配對；fetchone 取得結果。'],{id:41077,context:'existing_enrollment · 1/2'});
code(31,85,93,'sql','尚未報名時新增 Enrollment',['接續 existing_enrollment；只有尚未報名時才在交易內 INSERT。'],{id:41091,context:'existing_enrollment · 2/2'});
code(31,95,106,'sql','執行 JOIN 並取得結果',['Course ID 綁定到 ?；fetchall 取得所有報名資料。'],{id:41095,context:'rows · 1/2'});
code(31,108,109,'sql','逐筆輸出查詢結果',['接續上一頁的 rows；dict(row) 把 sqlite3.Row 轉成可列印的 dict。'],{id:41109,context:'rows · 2/2'});
code(31,111,116,'sql','更新容量並檢查影響筆數',['將課程容量更新為 35；rowcount 顯示修改筆數。'],{context:'try → with connection',result:'updated rows: 1'});
code(31,118,130,'sql','建立暫時課程，再刪除',['lastrowid 取得剛新增的 id，再用該 id 刪除。','兩個動作位於同一個 with connection 中。'],{context:'try → with connection',result:'deleted rows: 1'});
code(31,132,135,'sql','處理限制錯誤並關閉連線',['IntegrityError 捕捉違反資料限制的錯誤。','finally 無論成功或失敗都會關閉 connection。'],{context:'except / finally'});
all(32,'sql','連續執行兩次，檢查資料保存',['第一次與第二次使用相同的 workshop.db。'],{weight:.3,result:'兩次執行都使用同一個 workshop.db，第二次會讀到前次保存的資料。'});
all(33,'sql','第一次執行的輸出',['首次顯示容量 30，隨後 UPDATE 改成 35。','第二次執行時第一行容量為 35；不會重複新增社員、課程或報名。'],{weight:.5,result:'第二次執行：capacity = 35，其餘筆數仍為 1'});
scene(43,'transaction',1);
all(34,'transaction','練習：查詢容量至少 20 的課程',['先討論 45 秒，再逐步揭露 SELECT、WHERE、ORDER BY 及參數 tuple。'],{exercise:'寫出參數化查詢：列出容量至少 20 的課程，依容量由大到小排序。',filename:'database_demo.py',weight:1.4});
scene(44,'wrap',1);
integrateCode(35,44,0,()=>({target:'request-flow',step:7}));
scene(47,'wrap',.7);
pages.push({id:48,title:'問答',group:'qa',kind:'scene',hidden:false,weight:1,cues:['開放提問與課程結語'],animation:'request',notes:['保留最後十分鐘回答問題。','可用章節選單回到任何程式頁，可從首頁重新開始播放。'],motion:['問題、技術副標題與結語一開始即完整呈現，不另外揭露。'],code:[],excerpt:null,exercise:null});
scene(46,'wrap',0);

// Reuse the identical models from the earlier Pydantic explanation.
// Imports/app and every distinct endpoint from the complete program remain visible.
const modelPages=pages.filter(p=>p.excerpt?.block===18);
const main=source(19).code.split('\n');
for(let line=9;line<=35;line++){
  if(!main[line-1].trim())continue;
  const match=modelPages.filter(p=>p.excerpt.rows.some(r=>r.text.trim()===main[line-1].trim()));
  const targets=match.length?match:[modelPages.find(p=>p.title.startsWith('CourseUpdate'))];
  usage.get('notion-19').set(line,targets.map(p=>p.id));
  if(!match.length)targets[0].notes.push('完整版對應註解：'+main[line-1].trim().replace(/^#\s*/,''));
}
const newSceneSeconds=new Map([[50001,45],[50002,30]]);
const transferredSeconds=new Map([[25,45],[29108,30]]);
for(const p of pages.filter(p=>!p.hidden)){
  if(newSceneSeconds.has(p.id)){p.durationSeconds=newSceneSeconds.get(p.id);continue;}
  if(!previousSeconds.has(p.id))throw new Error('Missing revision-7 timing for '+p.id);
  p.durationSeconds=previousSeconds.get(p.id)+(absorbedPages.get(p.id)??[]).reduce((sum,id)=>sum+previousSeconds.get(id),0)-(transferredSeconds.get(p.id)??0);
}
for(const g of groups){
  const total=pages.filter(p=>p.group===g.id&&!p.hidden).reduce((sum,p)=>sum+p.durationSeconds,0);
  if(total!==g.seconds)throw new Error('Chapter timing mismatch: '+g.id+' '+total+' / '+g.seconds);
}
const coverage=sources.map(s=>({
  sourceId:s.id,section:s.section,language:s.lang,renderMode:s.lang==='mermaid'?'diagram':integratedSourceIds.has(s.id)?'integrated':'code',
  lines:s.code.split('\n').flatMap((text,i)=>text.trim()?[{
    line:i+1,slideIds:usage.get(s.id).get(i+1)??[],
    shared:s.id==='notion-19'&&i+1>=9&&i+1<=35,
    diagram:diagrams.find(d=>d.sourceId===s.id)?.references.find(r=>r.line===i+1)??null,
    integrated:integratedReferences.get(s.id)?.get(i+1)??null,
  }]:[]),
}));
const missing=coverage.flatMap(s=>s.lines.filter(l=>!l.slideIds.length).map(l=>s.sourceId+':'+l.line));
if(missing.length)throw new Error('Uncovered code: '+missing.join(', '));
if(new Set(pages.map(p=>p.id)).size!==pages.length)throw new Error('Duplicate slide IDs');
const visible=pages.filter(p=>!p.hidden);
if(visible.length!==92)throw new Error('Expected 92 visible slides');
if(visible.reduce((s,p)=>s+p.durationSeconds,0)!==10800)throw new Error('Schedule must total 180 minutes');
for(const p of pages){
  const g=groups.find(g=>g.id===p.group);
  const color=['python','enrollment','break','qa'].includes(g.id)?'amber':['basics','validation','crud'].includes(g.id)?'purple':g.flowStage>=3?'green':'blue';
  p.chapter={...g,color,start:visible.find(v=>v.group===g.id)?.id};
  p.flowStage=g.flowStage;p.durationSeconds??=0;
  delete p.minutes;delete p.weight;delete p.group;delete p.fixedSeconds;
}
// Page transitions are a single runtime policy; lesson cues only describe in-page motion.
write('docs/transitions.md','# 跨頁淡化與頁內動畫\n\n前進、後退與章節跳轉統一使用 0.3 秒淡化。新頁完整放在底層，舊頁在上方淡出；不搬移文字、不縮放面板，不經過黑屏。舞台置中與縮放容器持續存在。\n\n舊頁停在離開時的步驟，新頁直接呈現導航指定的步驟。淡化完成不重播入場動畫；只有手動推進才播放下一個頁內動作。快速換頁取消舊轉場；淡化期間操作下一步會結束轉場並推進一次。\n\n首頁預覽保持靜態；減少動態效果時直接切換。頁內動畫、內容順序、穩定 ID 與計時保持不變。實作位於 ../src/presentation/Stage.tsx 與 ../src/presentation/transitions.ts。\n');
write('src/lessons.json',pages);write('src/code-coverage.json',coverage);
write('src/diagrams.json',diagrams);
write('src/schedule.json',groups.map(g=>({...g,start:visible.find(p=>p.chapter.id===g.id)?.id})));
write('examples/main.py',source(19).code+'\n');
write('examples/database_demo.py',source(31).code+'\n');
write('examples/python_recap.py',[6,7,8].map(id=>source(id).code).join('\n\n')+'\n');
write('examples/initial_main.py',source(15).code+'\n\n'+source(17).code+'\n');
const fmt=seconds=>[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
let at=0;
write('docs/teaching-script.md','# 完整授課腳本\n\n總長 03:00:00。程式碼、講稿、步驟與投影片由同一份來源產生。所有跨頁統一 0.3 秒淡化；頁內動作由講者手動推進。\n\n'+visible.map((p,i)=>{
  const from=at;at+=p.durationSeconds;
  return '## '+String(i+1).padStart(2,'0')+' — '+p.title+'\n\n穩定 ID：'+p.id+'｜'+fmt(from)+'–'+fmt(at)+'\n\n'+p.notes.map(n=>'- '+n).join('\n')+'\n\n步驟：'+p.cues.join(' → ')+(p.excerpt?'\n\n~~~'+p.code[0].lang+'\n'+p.excerpt.rows.map(r=>r.text).join('\n')+'\n~~~':'')+'\n';
}).join('\n'));
copyFileSync(new URL('../docs/teaching-script.md',import.meta.url),new URL('../slides.md',import.meta.url));
write('docs/code-coverage.md','# 講義程式碼覆蓋對照\n\n35 個來源區塊。相同模型共用頁面，註解差異保留在講稿。所有列出的頁面均在正常播放流程。四個 Mermaid 區塊以圖像呈現，圖中元素與手動步驟逐行對照。\n\n| 區塊 | 章節 | 來源行 | 播放頁／穩定 ID | 呈現／圖像元素／步驟 |\n|---|---|---|---|---|\n'+coverage.flatMap(s=>s.lines.map(l=>'| '+s.sourceId+' | '+s.section+' | '+l.line+' | '+l.slideIds.map(id=>(visible.findIndex(p=>p.id===id)+1)+' / '+id).join(', ')+' | '+(l.diagram?'圖解 / '+l.diagram.target+' / '+l.diagram.step:l.integrated?'整合示意 / '+l.integrated.target+' / '+l.integrated.step:'程式碼'+(l.shared?'（共用模型）':''))+' |')).join('\n')+'\n');
console.log('Built '+visible.length+' visible slides; 35 code blocks covered; '+fmt(at)+'.');

