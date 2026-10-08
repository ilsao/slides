# Template：可複製的簡報起點

首頁的第二份簡報就是這個模板；桌面與 Backend Workshop 並排，往下捲動可觀察後續各列逐漸顯現。播放網址為 `/template`。

## 模組分工

- `config.ts`：名稱、ID、尺寸、主題色、全域樣式、動畫節奏及跨頁轉場。
- `slides.tsx`：頁面內容、React 版型、各頁步驟、主題與樣式覆寫。
- `deck.tsx`：把頁面交給播放器，選擇首頁預覽和章節入口。
- `styles.css`：只作用在這份簡報上的樣式。

七頁示範封面、大字排版、左右構圖、比較、資料、動態及結尾。這些是可修改的 React 元件，不是強制套用的版型。你可以完全替換 HTML、加入 SVG、圖片、影片、圖表或互動元件，也可以使用其他動畫實作。

## 建立新簡報

1. 複製整個 `decks/template/` 到 `decks/my-talk/`。
2. 修改 `config.ts` 的 `id`、`title`、`description`。使用與其他簡報不同的 ID。
3. 把複製後 CSS 裡的 `[data-deck="template"]` 全部改成 `[data-deck="my-talk"]`。
4. 在 `slides.tsx` 編輯或新增頁面；在 `deck.tsx` 更新 `previews`、`chapters`，讓它們引用存在的頁面 ID。
5. 在 `src/registry.ts` 加入入口：

```ts
{
  id: 'my-talk', title: '我的簡報',
  load: () => import('../decks/my-talk/deck').then(module => module.templateDeck),
}
```

匯出名稱可自行重新命名；登錄的 `load` 須回傳該定義。開啟 `/my-talk?start=1` 從封面開始。

## 自訂風格與版型

修改 `themes` 可替換背景、前景、輔助色、強調色和面板色。`templateConfig.style` 提供全域覆寫；單頁的 `style` 最後套用，優先於主題與全域設定。可使用一般 React CSS 屬性及 `--template-*` 自訂變數。

```tsx
function MyPage({ step, still, reducedMotion }: SlideRenderProps) {
  return <div>
    <h1>你的內容</h1>
    <p style={{ opacity: step >= 1 ? 1 : 0,
      transition: still || reducedMotion ? 'none' : 'opacity .5s' }}>
      逐步顯示的一段話
    </p>
  </div>;
}

{ id: 'my-page', title: '我的頁面', steps: 2,
  theme: 'midnight', Render: MyPage,
  style: { '--template-accent': '#75e0cb', '--template-font': 'Georgia, serif' } }
```

`size` 可設定自己的舞台比例；播放器會等比例縮放。範例的 `--template-unit` 跟隨舞台寬度調整字級與間距。改成直式或較矮的比例時，也需相應調整內容、欄數與構圖。

## 自訂動畫

`steps` 包含起始狀態，`step` 從零開始。不要只在按下一步時累加本地狀態；把畫面狀態直接由 `step` 算出，讓退回、跳頁及恢復進度都正確。

- `Reveal` 示範逐步淡入；`Metrics` 示範資料動畫；`Movement` 示範移動、旋轉及形狀變化。
- `templateConfig.motion` 控制這些範例的時長與曲線；個別元件也可設定獨立的動畫。
- `templateConfig.transition` 預設使用自訂滑動轉場。匯入 `transitions` 後可改為 `transitions.fade` 或 `transitions.none`，也可提供自己的 `TransitionDefinition`。
- 使用 CSS keyframes 時，動畫名稱加上新簡報的前綴，避免與其他簡報衝突。

首頁預覽、減少動態效果與離場快照必須直接呈現指定步驟。這份模板用 `still`、`reducedMotion`、`mode`、`active` 停用動畫；新增動畫時也應遵循這個規則。互動按鈕只在 `mode === 'playback' && active` 時出現。預覽不能啟動計時、播放影音、寫入儲存空間或抓取互動資料。

## 額外能力

`DeckDefinition` 還支援 `Provider`、`Controls`、`Overlay`、`Help`、`handout`、`reserveWidth` 與 `freezeEntranceOnNavigation`。在 `deck.tsx` 中按需要加入；模板不要求使用這些功能。完整契約與副作用管理方式見 [新增簡報指南](../../docs/authoring.md)。

頁面或步驟結構改變時遞增 `version`。完成後執行型別檢查與建置，再檢查首頁靜態預覽、下一步、上一步、跳頁、重新整理及減少動態效果模式。
