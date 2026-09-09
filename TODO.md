# 銀魂暦 × 萩 專案 TODO

> 最後更新：2026-09-10  
> 需求與產品規則以 [`AGENTS.md`](./AGENTS.md) 為準。官方活動資料以[活動官方網站](https://luface.jp/business/event/collabo/hagi_gintama_goyomi/)為主要依據。

## 進度標記

- `[ ]` 尚未開始
- `[-]` 進行中
- `[x]` 已完成並驗證
- `[!]` 阻塞中，原因記錄在「待確認／阻塞事項」

> Markdown 核心核取方塊只支援 `[ ]` 與 `[x]`；`[-]`、`[!]` 用於人工標示狀態。

## 分類說明

| 分類      | 說明                                    |
| --------- | --------------------------------------- |
| `SETUP`   | 專案設定、套件與建置流程                |
| `DATA`    | 官方資料蒐集、核對、靜態資料與座標      |
| `DOMAIN`  | 時區、營業排程、狀態及活動日期規則      |
| `TEST`    | 單元測試、整合驗證與回歸測試            |
| `UI`      | 地圖、清單、景點詳情及共用介面          |
| `A11Y`    | 鍵盤操作、focus 管理與非純色彩提示      |
| `DOCS`    | About、免責聲明與資料異動紀錄           |
| `QA`      | Mobile、瀏覽器、資料與正式環境驗收      |
| `RELEASE` | Static export、部署及 archive mode 準備 |

## 優先級說明

- `P0`：MVP 必須完成；影響資料正確性、核心操作或上線。
- `P1`：MVP 重要內容；P0 穩定後完成。
- `P2`：視覺與體驗優化；不得拖延 P0/P1。

## 目前狀態總覽

| 里程碑          | 狀態               | 完成條件                                   |
| --------------- | ------------------ | ------------------------------------------ |
| M0 專案基礎     | 進行中（稽核補強） | 開發、測試、lint 與 static export 設定完成 |
| M1 資料模型     | 尚未開始           | 官方資料可由 TypeScript 靜態資料完整表達   |
| M2 Domain 規則  | 尚未開始           | 核心時間與狀態測試全部通過                 |
| M3 地圖首頁     | 尚未開始           | 手機可查看所有 marker、狀態與詳情          |
| M4 日期清單     | 尚未開始           | 可查指定日期並正確處理 11/28               |
| M5 完整活動資訊 | 尚未開始           | 列車、合作期間、住宿與協力店資訊可查       |
| M6 上線驗收     | 尚未開始           | QA、static build 與部署完成                |

## M0 — 專案基礎

- [x] `P0 SETUP` 建立 Next.js、React、TypeScript 與 Tailwind 專案骨架。
- [x] `P0 DOCS` 建立並確認產品規格 `AGENTS.md`。
- [x] `P0 SETUP` 閱讀目前安裝版本的 Next.js 文件，確認 App Router、Client Component 與 static export 寫法。
- [-] `P0 SETUP` 安裝 Leaflet、React Leaflet、型別與單元測試所需套件；尚缺 Leaflet 的 TypeScript 型別 `@types/leaflet`。
- [x] `P0 SETUP` 將實際 Node.js runtime 升級至 Vitest 5 支援的 `>=22.12.0`，並以 `.nvmrc` 或 `package.json#engines` 記錄專案版本要求；目前環境為 `22.4.1`。
- [x] `P0 SETUP` 在 `next.config.ts` 設定 `output: "export"`。
- [-] `P0 SETUP` 建立 `data`、`domain`、`types`、`components` 的基礎目錄；目前均為空目錄，需加入實際檔案或 `.gitkeep` 後才能由 Git 保存。
- [x] `P0 TEST` 建立測試指令並確認空白測試可執行。
- [x] `P0 SETUP` 確認 `npm run lint` 可通過。
- [x] `P0 SETUP` 在一般本機環境確認預設的 `npm run build`（Turbopack）可通過；2026-09-10 agent 稽核時受執行環境禁止綁定連接埠而失敗，`npm run build -- --webpack` 則已成功完成 static build。

### M0 稽核紀錄（2026-09-10）

- `npm test`：通過，1 個 test file、1 個 test。
- `npm run lint`：通過。
- `npm run build`：Turbopack 在目前 agent 執行環境發生 `binding to a port: Operation not permitted`；需由一般本機終端複驗。
- `npm run build -- --webpack`：通過，`/` 與 `/_not-found` 均成功產生靜態頁面。
- Next.js 額外提示 `/Users/jull/package-lock.json` 位於目前 Git repository 外；此警告未阻止 Webpack build，若本機 Turbopack build 正常則不列為 M0 blocker。

## M1 — 官方資料與資料模型

- [ ] `P0 DATA` 建立 `PlaceCategory`、`PlaceStatusMode`、`PlaceStatus`、`FeatureKind` 型別。
- [ ] `P0 DATA` 建立 `TimeSlot`、`BusinessSchedule`、date override 與 `Place` 型別。
- [ ] `P0 DATA` 建立 `ScheduledEvent` 與 `SiteMode` 型別。
- [ ] `P0 DATA` 對照官方活動頁，列出全部實體地點與 feature，避免同址 marker 重複。
- [ ] `P0 DATA` 整理一般營業時間、固定休業日、分段營業與 open-ended 時段。
- [ ] `P0 DATA` 整理 L.O.、最終入場、最終受付與其他 `usableUntil`。
- [ ] `P0 DATA` 整理已知特殊營業日、休業日及 date overrides。
- [ ] `P0 DATA` 建立 `places.ts`、`scheduled-events.ts`、`site-config.ts`。
- [ ] `P0 DATA` 逐日列出「〇〇のはなし」官方運行日期，不以週末或假日推算。
- [ ] `P1 DATA` 整理 collaboration active period、住宿合作日與協力店標記。
- [ ] `P0 DATA` 逐點人工核對地址、`mapQuery` 與座標；無法唯一確認時保留 `null`。
- [ ] `P1 DATA` 加入小型 dev-time data validation（ID、時段、座標與活動日期）。
- [ ] `P1 DOCS` 建立 `src/data/CHANGELOG.md`，記錄官方資料變更來源及影響。

### M1 驗收

- [ ] 所有資料皆可追溯至官方來源，沒有自行猜測日期、時間或座標。
- [ ] JR 萩駅、JR 東萩駅、萩・石見空港、松陰神社、旧久保田家住宅符合既定特殊規則。
- [ ] 住宿與 JR 萩駅使用 `statusMode: "none"`；協力店仍保留原本 place category。

## M2 — Domain 規則與單元測試

- [ ] `P0 DOMAIN` 實作 `getEventLocalNow()`，固定使用 `Asia/Tokyo`。
- [ ] `P0 DOMAIN` 實作時間字串解析與分鐘比較；解析失敗不可 fallback 到瀏覽器時區。
- [ ] `P0 DOMAIN` 實作 `getScheduleForDate()`，確保 override 優先且保留 `null` 休業日。
- [ ] `P0 DOMAIN` 實作 `getEffectiveCloseTime()`，以 `usableUntil ?? close` 判斷。
- [ ] `P0 DOMAIN` 實作 `getPlaceStatus()` 的所有狀態與分段營業行為。
- [ ] `P0 DOMAIN` 實作 `isBusinessInfoSuppressedDate()` 與 2026-11-28 規則。
- [ ] `P1 DOMAIN` 實作 collaboration state utilities。
- [ ] `P1 DOMAIN` 實作 scheduled event 查詢 utilities。

### 必要單元測試

- [ ] `P0 TEST` 固定時段 10:00–18:00 的所有邊界狀態。
- [ ] `P0 TEST` weekly schedule 中的 `null` 回傳 `CLOSED_TODAY`。
- [ ] `P0 TEST` L.O. 14:00 在 13:59 與 14:00 的狀態。
- [ ] `P0 TEST` 12/29 override 優先於 regular schedule。
- [ ] `P0 TEST` 分段營業第一段、空檔、第二段與結束後狀態。
- [ ] `P0 TEST` open-ended slot 開店前、開店後與休業日狀態。
- [ ] `P0 TEST` 2026-11-28 一般營業狀態為 `HIDDEN`，scheduled event 仍可查。
- [ ] `P0 TEST` `statusMode: "none"` 回傳 `HIDDEN`。
- [ ] `P1 TEST` scheduled event 僅依 `serviceDates` 判斷。
- [ ] `P0 TEST` 全部 domain tests 通過。

## M3 — 地圖首頁 `/`

- [ ] `P0 UI` 建立只在 browser 載入的 Leaflet map subtree。
- [ ] `P0 UI` 顯示所有具有座標的景點 marker；單一資料錯誤不得使地圖崩潰。
- [ ] `P0 UI` 顯示日本當地日期、時間與 JST 標示。
- [ ] `P0 UI` 每 60 秒刷新時間及狀態，並在 `visibilitychange` 後立即更新。
- [ ] `P0 UI` 完成 marker 狀態的顏色、symbol 與 accessible label。
- [ ] `P0 UI` 完成 marker legend，包含所有可能顯示的狀態。
- [ ] `P0 UI` 完成 mobile Detail Bottom Sheet 與 desktop 可用版面。
- [ ] `P0 UI` Detail 顯示營業時間、L.O.／最終入場、feature 與注意事項。
- [ ] `P0 UI` Detail 提供清楚的外部 Google Maps 連結。
- [ ] `P0 UI` 2026-11-28 保留 marker，但隱藏一般營業 badge 並顯示提示。
- [ ] `P0 A11Y` marker、Bottom Sheet、連結皆可用鍵盤操作且 focus 行為正確。
- [ ] `P0 UI` 顯示固定營業資訊免責說明。

### M3 驗收

- [ ] 手機上可以快速回答「現在可以去哪裡」及「哪些地方快結束營業」。
- [ ] 休息景點仍保留 marker，狀態不只依靠顏色傳達。
- [ ] 缺少座標的 place 有替代呈現或清楚記錄，不造成 runtime error。

## M4 — 日期清單 `/list`

- [ ] `P0 UI` 建立活動期間內的單日 Date Picker。
- [ ] `P0 UI` 列出所有景點的當日營業／休息、時段及特殊資訊。
- [ ] `P0 UI` 未來日期不顯示「距離打烊 1／2 小時」的即時狀態。
- [ ] `P0 UI` 顯示 scheduled event 當日運行資訊；無運行時明示「本日無運行」。
- [ ] `P0 UI` 完成 2026-11-28 blocking dialog，選擇有效日期後才關閉。
- [ ] `P0 A11Y` dialog 使用正確 role、aria-modal、初始 focus、focus trap 與背景鎖定。
- [ ] `P1 UI` 評估並在不增加 static export 複雜度時支援 `?date=YYYY-MM-DD`。

### M4 驗收

- [ ] 使用者能回答「指定日期有哪些地方營業、幾點可以利用」。
- [ ] 2026-11-28 無法繞過 dialog 操作背景，也不會隱藏 scheduled event 資料。

## M5 — 完整資訊與 About

- [ ] `P1 UI` 顯示 collaboration 的 `UPCOMING`、`ACTIVE`、`ENDED` 狀態。
- [ ] `P1 UI` 在 JR 萩駅／東萩駅 Detail 顯示「〇〇のはなし」時段。
- [ ] `P1 UI` 顯示住宿合作日，但不套用即時營業 badge。
- [ ] `P1 UI` 顯示「コラボ協力店舗」badge 與共同特典資訊。
- [ ] `P1 UI` 正確呈現機場商店分段營業、松陰神社個別內容與着物返却時間。
- [ ] `P1 DOCS` 完成 `/about`：用途、使用方式、時區、來源與更新原則。
- [ ] `P1 DOCS` 加入非官方網站、SNS／臨時休業不納入及固定免責聲明。
- [ ] `P1 DOCS` 加入開發背景與開發者聯絡方式。
- [ ] `P1 UI` 完成共用 Header 與 mobile Bottom Navigation。

## M6 — QA、效能與發布

- [ ] `P0 QA` 逐一核對所有 place、feature、日期、營業時段與官方來源。
- [ ] `P0 QA` 測試 JST 與使用者裝置時區不同時的顯示及狀態。
- [ ] `P0 QA` 測試 09:59／10:00、L.O.、分段空檔及午夜日期切換。
- [ ] `P0 QA` 以實際手機 viewport 測試 marker 點擊、Detail、Date Picker 與導航連結。
- [ ] `P0 A11Y` 完成鍵盤、focus、accessible name、對比與非色彩狀態檢查。
- [ ] `P0 QA` 驗證 missing schedule、coordinates 與錯誤 map URL 不會造成整頁崩潰。
- [ ] `P0 QA` 執行並通過 unit tests、lint、TypeScript 與 production build。
- [ ] `P0 RELEASE` 驗證 static export 產物可在目標環境運作。
- [ ] `P0 RELEASE` 部署正式站並完成 smoke test。
- [ ] `P1 RELEASE` 記錄 archive mode 切換步驟；暫不自行設定 `frozenDateTime`。
- [ ] `P2 UI` 在不影響正確性與效能的前提下進行視覺 polish。

## 待確認／阻塞事項

遇到下列情況時，先在此新增 `[!]` 項目並向專案負責人確認，不自行推測：

- [ ] 目前沒有已知阻塞事項。

建議紀錄格式：

```text
- [!] YYYY-MM-DD DATA：問題描述
  - 影響：marker／schema／狀態／特殊日期／其他
  - 已確認來源：...
  - 待決策：...
```

## 每次更新 TODO 的方式

1. 開始工作時把項目由 `[ ]` 改成 `[-]`。
2. 完成實作與必要驗證後才改成 `[x]`。
3. 若無法繼續，改成 `[!]` 並寫入阻塞原因及需要的決策。
4. 每次提交前更新「最後更新」日期與「目前狀態總覽」。
5. 官方資料有異動時，同步更新 `src/data/CHANGELOG.md`；若影響 schema 或產品行為，先取得確認。

## MVP 完成檢查

- [ ] 地圖顯示所有聯名景點及正確 marker 狀態。
- [ ] 使用者能判斷現在可前往、快結束、尚未開始及今日休息的景點。
- [ ] 指定日期清單正確顯示營業、休息、時段與特殊活動。
- [ ] L.O.、最終入場、分段營業、open-ended close 與 overrides 計算正確。
- [ ] 「〇〇のはなし」只依官方 service dates 顯示。
- [ ] 2026-11-28 地圖與清單均符合特殊規則。
- [ ] 景點 Detail 可開啟外部地圖導航。
- [ ] Mobile、accessibility、tests、lint 與 static build 全部驗收完成。
