<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

> 本文件是此 repository 中 AI coding agent / pair-programming agent 的主要開發指引。
> 若本文件與臨時口頭需求衝突，以使用者在目前對話中最新、明確確認的需求為準。
> 若官方活動資料產生會改變產品行為、marker 粒度、狀態模型或資料 schema 的歧義，**必須先詢問使用者，不可自行推測或擅自決定**。

---

## 1. Project Overview

本專案是一個單一活動用途的靜態網站 side project，用於：

**「銀魂暦 × 萩」聯名城市活動聖地巡禮的資訊查詢與行程安排輔助。**

主要使用情境：

1. **旅途中使用**
   - 快速看到所有聯名景點的位置。
   - 依活動所在地「現在時間」判斷哪些景點仍可前往。
   - 查看即將結束營業的景點。
   - 點開景點 Detail 後交由外部地圖導航。

2. **行前規劃**
   - 選擇某一天。
   - 查看該日有哪些景點營業、休息或有特定活動。
   - 由使用者自行排行程。

本網站只負責**資訊提供**，不替使用者最佳化或自動產生行程。

活動結束後網站會保留並切換為紀念用途的 archive mode。

---

## 2. Product Scope

### In Scope

- 地圖一次顯示所有聯名景點。
- 活動所在地時間（Japan / JST / `Asia/Tokyo`）。
- marker 顯示目前營業狀態。
- 景點 Detail。
- 外部地圖導航連結。
- 指定日期清單。
- 一般營業時間。
- 固定公休日。
- 官方頁明確標示的特殊營業日 / 特殊營業時間。
- 分段營業。
- L.O. / 最終入場 / 最終受付。
- 聯名內容有效期間。
- 特定日期才舉辦的活動。
- 「〇〇のはなし」指定運行日與指定時刻。
- `コラボ協力店舗` 標示。
- 住宿合作資料（但不參與即時營業狀態）。
- 11/28 特殊規則。
- 活動結束後 archive mode。

### Explicitly Out of Scope

第一版不要主動新增以下功能：

- 使用者帳號。
- 登入。
- 收藏。
- 已踩點紀錄。
- 完成率。
- 自動排行程。
- 最短路徑。
- 交通時間計算。
- GPS / 「離我最近」。
- 即時導航。
- Google Places API。
- Google Maps JavaScript API（非必要）。
- 即時店家營業 API。
- SNS API / Instagram / X 爬取。
- CMS。
- Backend。
- Database。
- Push notification。
- 多活動共用平台。
- 國定假日通用規則 engine。
- 即時列車位置。
- 離線地圖。
- 複雜搜尋或多維篩選。
- 過度抽象的 repository / service / rule engine architecture。

若 agent 認為需要新增上述任何項目才能完成任務，**先詢問使用者**。

---

## 3. Primary Source of Truth

活動官方資料來源：

https://luface.jp/business/event/collabo/hagi_gintama_goyomi/

資料更新原則：

- 以活動官方網站明確刊載內容為主要依據。
- 若有 JR 等外部官方資料，僅在活動頁不足時使用官方來源補充。
- 不使用第三方部落格、評論、Google 使用者內容來覆蓋官方資料。
- 不自行猜測營業日、休業日、地址、座標或活動日期。
- SNS 才會公布的「臨時休業 / 不定休實際狀況」不納入自動判斷。
- 官方活動頁明確寫出的特殊資訊必須支援。

固定免責說明應能在 UI / About 中呈現：

> 本網站依活動官方網站刊載資訊整理。臨時休業、不定休及最新營業狀況，仍請以各設施官方公告為準。

### Data update rule for agents

當官方頁更新時：

1. 先比對目前 static data。
2. 判斷變更是否只是資料新增 / 修改。
3. 若變更會影響：
   - marker 是否拆分 / 合併；
   - marker 主狀態基準；
   - `PlaceStatus`；
   - `TimeSlot`；
   - `PlaceCategory`；
   - `FeatureKind`；
   - 特殊日期邏輯；
   - 頁面互動；

   則**先詢問使用者再修改 schema / product behavior**。

4. 不因追求通用性建立新的排程 DSL 或大型 abstraction。

---

## 4. Target Stack

建議維持：

- Next.js
- React
- TypeScript
- Tailwind CSS
- Leaflet
- React Leaflet
- Static data (`.ts`)
- Static export

預期 Next.js：

```ts
// next.config.ts
const nextConfig = {
  output: "export",
};

export default nextConfig;
```

不需要 backend。

### Map

優先：

- Leaflet
- React Leaflet
- OpenStreetMap tiles

地圖功能只需要：

- 約數十個 marker。
- pan / zoom。
- custom marker。
- click marker。
- detail sheet / popup。
- 外部 Google Maps link。

React Leaflet 依賴 browser DOM，地圖 subtree 應為 client-side component；不要為了整頁地圖把不相關 UI 全部變成 Client Component。

---

## 5. Routes

固定三個主要頁面：

```text
/
├─ Map / Home

/list
├─ Date-based place list

/about
└─ About / Usage / Disclaimer / Contact
```

MVP 不需要：

```text
/place/[id]
```

景點詳細資訊優先：

- Mobile: Bottom Sheet / Drawer
- Desktop: Popup / Side Panel

---

## 6. Page Responsibilities

### `/` — Map Home

核心問題：

> 依活動所在地現在時間，我現在可以去哪裡？

應包含：

- 活動所在地日期與時間。
- 清楚標示 JST / 日本當地時間。
- 所有景點 marker。
- marker status。
- marker legend。
- 景點 Detail。
- 外部地圖連結。
- 11/28 特殊狀態。
- 營業資訊免責提示。

所有景點 marker 即使休息也原則上仍保留。

### `/list` — Date List

核心問題：

> 我選的這一天有哪些地方可以安排？

應包含：

- 單日 Date Picker。
- 活動有效期間限制。
- 所有景點。
- 當日營業 / 休息。
- 當日營業時間。
- 官方明確特殊資訊。
- scheduled events。
- 11/28 blocking modal。

**不要在未來日期清單使用「距離打烊 1/2 小時」的即時 marker 狀態。**

日期清單只回答：

- 當天有沒有營業？
- 幾點到幾點？
- 是否有特定活動 / 特殊資訊？

### `/about`

應包含：

- 網站用途。
- 使用方式。
- 時區說明。
- 資料來源。
- 資料更新原則。
- SNS / 臨時休業不納入聲明。
- 非官方網站聲明。
- 開發背景。
- 開發者聯絡方式。

不需要強制 onboarding。

---

## 7. Mobile-first Requirement

核心使用情境包含旅途中使用，因此：

**Mobile usability 是 P0，不是 polish。**

至少確保：

- marker 易於點擊。
- Detail 不超出 viewport。
- Bottom Sheet 操作清楚。
- Date Picker 可用。
- list 可快速掃描。
- 導航連結易於點擊。
- 不依 hover 才能取得必要資訊。
- 戶外高亮環境下不能只依微妙顏色差異傳達狀態。

Desktop 正常可用即可；不要為 desktop 做高成本專屬功能。

---

## 8. Time Zone Rules

所有即時營業判斷固定使用：

```ts
const EVENT_TIME_ZONE = "Asia/Tokyo";
```

**禁止直接用瀏覽器本地時區判斷營業狀態。**

例如不要：

```ts
new Date().getHours();
```

直接作為店家時間。

應集中透過單一 utility，例如：

```ts
getEventLocalNow();
```

輸出類似：

```ts
type ZonedDateTimeParts = {
  date: IsoDate;
  weekday: WeekdayKey;
  hours: number;
  minutes: number;
};
```

使用者人在台灣或其他國家時，網站仍依日本當地時間計算。

首頁建議：

- 每 60 秒刷新一次時間與狀態。
- 監聽 `visibilitychange`。
- 使用者從 Google Maps 切回網站時立即重新計算。

---

## 9. Core Data Architecture

保持三層：

```text
Static Data
    ↓
Domain Rules
    ↓
React UI
```

推薦：

```text
src/
├─ app/
│  ├─ page.tsx
│  ├─ list/
│  │  └─ page.tsx
│  ├─ about/
│  │  └─ page.tsx
│  ├─ layout.tsx
│  └─ globals.css
│
├─ components/
│  ├─ layout/
│  ├─ map/
│  ├─ place/
│  ├─ list/
│  └─ event/
│
├─ data/
│  ├─ places.ts
│  ├─ scheduled-events.ts
│  └─ site-config.ts
│
├─ domain/
│  ├─ datetime/
│  ├─ schedule/
│  └─ event/
│
└─ types/
   └─ place.ts
```

### Separation of responsibilities

- `data/*`：只描述事實資料。
- `domain/*`：只處理時間 / 狀態 / 日期規則。
- `components/*`：只呈現 UI 與 interaction。
- React component 不應自行解析營業規則。
- 資料檔不應計算「目前狀態」。

禁止在 component 裡散落：

```tsx
if (hour >= 10 && hour < 17) {
  ...
}
```

---

## 10. Current Domain Types

最新資料 schema 已確認需要支援：

```ts
type PlaceCategory = "transport" | "airport" | "attraction" | "mixed" | "restaurant" | "shop" | "shrine" | "hotel";
```

```ts
type PlaceStatusMode = "businessHours" | "none";
```

```ts
type PlaceStatus = "OPEN" | "CLOSING_SOON" | "CLOSING_VERY_SOON" | "NOT_OPEN_YET" | "OPEN_STATUS_UNCERTAIN" | "CLOSED" | "CLOSED_TODAY" | "HIDDEN";
```

```ts
type FeatureKind = "stampRally" | "sales" | "food" | "display" | "event" | "lodging" | "transport" | "kimono" | "voice" | "culturalProperty" | "photo" | "goshuin" | "supportStoreBenefit";
```

`Place` 必須支援：

```ts
isCollabSupportStore?: boolean
```

此欄位不取代 `category`。

例如：

```ts
{
  category: 'restaurant',
  isCollabSupportStore: true,
}
```

UI 可使用此欄位顯示：

> コラボ協力店舗

badge。

---

## 11. TimeSlot Rules

需支援兩種 `TimeSlot`：

### Fixed close

```ts
interface FixedTimeSlot {
  open: ClockTime;
  close: ClockTime;
  usableUntil?: ClockTime;
  usableUntilLabel?: string;
}
```

`usableUntil` 用於：

- L.O.
- 最終入場。
- 最終受付。
- 其他「雖未正式關門，但已無法開始聯名體驗」的時間。

marker 狀態判斷有效截止：

```ts
usableUntil ?? close;
```

### Open-ended close

例如：

> 売り切れ次第閉店

```ts
interface OpenEndedTimeSlot {
  open: ClockTime;
  close: null;
  closeLabel: string;
}
```

開店後不可宣稱一定 `OPEN`，必須回：

```ts
OPEN_STATUS_UNCERTAIN;
```

---

## 12. BusinessSchedule Rules

```ts
type DailySchedule = TimeSlot[] | null;
```

`null` 明確代表：

> 該日休息。

需支援一天多段：

```ts
[
  { open: "09:50", close: "12:00" },
  { open: "15:00", close: "18:00" },
];
```

### Important helper rule

`null` 是有效業務值，不是「undefined」。

因此 helper **不能**用：

```ts
rules[day] ?? defaultValue;
```

因為這會把固定休業 `null` 誤 fallback 成營業。

應先判斷 key 是否存在，例如：

```ts
Object.prototype.hasOwnProperty.call(rules, day);
```

再決定使用 `rules[day]` 或 default。

---

## 13. Date Overrides

指定日期 `overrides` 優先於 weekly schedule：

```text
date override
    ↓ none
weekly schedule
```

用於：

- 特殊營業時間。
- 特定休業日。
- 國定假日例外。
- 第 3 個星期一等活動期間已知日期。

本活動只有約三個月。

**不要建立通用 holiday / recurrence engine。**

如果規則是：

> 第 3 個星期一休

直接列出活動期間內的實際日期即可。

---

## 14. Marker Status UX

目前確認的主要 marker 規則：

| Domain status           | UI meaning           |
| ----------------------- | -------------------- |
| `OPEN`                  | 🟢 營業中            |
| `CLOSING_SOON`          | 🟡 2 小時內結束營業  |
| `CLOSING_VERY_SOON`     | 🟠 1 小時內結束營業  |
| `NOT_OPEN_YET`          | 🕒 今日尚未開始營業  |
| `CLOSED`                | × 今日營業已結束     |
| `CLOSED_TODAY`          | × 今日休息           |
| `OPEN_STATUS_UNCERTAIN` | 狀態需現場／官方確認 |
| `HIDDEN`                | 不顯示營業 badge     |

### Threshold

對固定截止時間：

```text
remaining > 120 min
→ OPEN

60 < remaining <= 120
→ CLOSING_SOON

0 < remaining <= 60
→ CLOSING_VERY_SOON

now >= effectiveClose
→ CLOSED
```

例如 10:00–18:00：

```text
09:59 → NOT_OPEN_YET
10:00 → OPEN
15:59 → OPEN
16:00 → CLOSING_SOON
17:00 → CLOSING_VERY_SOON
18:00 → CLOSED
```

### Accessibility

狀態不可只靠顏色傳達。

至少：

- marker：顏色 + symbol。
- legend：symbol + 文字。
- Detail：完整文字狀態。

`OPEN_STATUS_UNCERTAIN` 不要使用綠 / 黃 / 橘暗示已確認營業。

---

## 15. `getPlaceStatus()` Responsibility

建議核心介面：

```ts
function getPlaceStatus(place: Place, now: ZonedDateTimeParts): PlaceStatus;
```

其責任只回答：

> 這個 Place 的 marker 現在應呈現什麼狀態？

概念流程：

```text
suppressed date?
  → HIDDEN

statusMode === none?
  → HIDDEN

取得該日期 schedule

沒有 schedule?
  → CLOSED_TODAY

現在落在 fixed slot?
  → 依 effective close 計算 OPEN / SOON / VERY_SOON

現在落在 open-ended slot 開始後?
  → OPEN_STATUS_UNCERTAIN

仍有下一個 slot?
  → NOT_OPEN_YET

否則
  → CLOSED
```

注意：

多段營業時：

```text
09:50–12:00
15:00–18:00
```

例如 13:00：

- 不是 `CLOSED`。
- 因為今天仍有 15:00 的下一段。
- 應為 `NOT_OPEN_YET` 或 UI 對應的「下一時段尚未開始」。

---

## 16. Place vs Feature

`Place` 代表：

> 地圖上的實體地理地點 / marker。

`PlaceFeature` 代表：

> 同一地點內的聯名內容。

不要因同一棟建築內有多個合作活動就建立多個疊在一起的 marker。

### Confirmed merged example: 萩・明倫学舎

單一 marker：

```text
萩・明倫学舎
```

Detail 內可包含：

- 萩観光案内所。
- 有備館。
- 萩暦。
- Birthday Event。
- ポ・ヤシロ。
- 限定ボイス。

marker 狀態以：

> 整體設施是否仍可造訪

為主，而不是某個子 feature 是否休息。

---

## 17. Confirmed Special Places

### JR萩駅

```ts
statusMode: "none";
```

原因：

- 是「〇〇のはなし」合作地點。
- 官方未提供可用於本網站的站體聯名營業時間。
- 不用列車經過時間取代 marker business status。

Detail 可顯示 scheduled event 資訊。

### JR東萩駅

marker 可依東萩駅観光案内所時間判斷。

### 萩・石見空港

marker 以：

> 空港 terminal 是否可造訪

為準。

Detail 另列：

```text
エアポートショップ 萩・石見
09:50–12:00
15:00–18:00
```

商店的分段營業不影響整個機場 marker 狀態。

### 松陰神社

marker 主狀態以：

```text
8:00–17:00
```

判斷，代表仍有任一聯名內容可利用。

Detail 個別列：

- 御朱印。
- Stamp Rally。
- 限定ボイス。
- 記念写真。
- 個別最終入場時間。

### 旧久保田家住宅

聯名着物體驗只有指定日期。

marker 只在指定活動日使用：

```text
10:00–14:00
```

判斷可開始體驗。

```text
返却 16:30
```

只放 Detail，不延長 marker 可利用狀態。

---

## 18. Collaboration Period vs Business Hours

聯名內容的開始 / 結束日期與店家是否營業是兩件不同的事。

例如某餐廳：

- 店家營業時間整個活動期間不變。
- 10/1–10/18 是 Birthday Menu。
- 10/19 起換成另一聯名餐點。

marker 仍照一般營業時間顯示。

Detail 顯示：

```text
聯名內容尚未開始
目前提供中
聯名內容已結束
```

不要因某一個 `PlaceFeature.activePeriod` 尚未開始，就讓整個店家 marker 變成 closed。

建議：

```ts
type CollaborationState = "UPCOMING" | "ACTIVE" | "ENDED";
```

---

## 19. Scheduled Events

「〇〇のはなし」不是一般店家營業時間。

**不要放進 `BusinessSchedule`。**

應使用獨立：

```ts
ScheduledEvent;
```

包含：

```ts
serviceDates: IsoDate[]
segments: ScheduledEventSegment[]
```

### Confirmed train rule

正式資料必須逐日列：

```ts
serviceDates: [...]
```

不要使用：

```ts
isWeekend || isJapaneseHoliday;
```

推算。

原因：

實際運行日不等於所有週末與國定假日。

已確認的兩段：

```text
萩 → 東萩
12:51–12:56

東萩 → 萩
14:09–14:16
```

地圖不做：

- train realtime。
- 動態火車 marker。
- GPS train tracking。

JR 萩 / 東萩 Detail 可顯示當日運行資訊。

清單頁如果當日無運行，應明確顯示：

> 本日無運行

而不是讓 event card 無聲消失。

---

## 20. Accommodation

住宿合作：

```ts
statusMode: "none";
```

不套用：

- 🟢
- 🟡
- 🟠
- 🕒
- ×

住宿可使用：

- `features`
- `availabilityDates`
- `notices`

顯示合作住宿日與 Detail。

不要把住宿 check-in / front desk 時間當成 marker business status，除非使用者未來明確要求。

---

## 21. `コラボ協力店舗`

使用：

```ts
isCollabSupportStore: true;
```

不要建立單獨 `PlaceCategory = 'collabSupportStore'`。

仍保留實際類型：

```ts
category: "restaurant";
```

或：

```ts
category: "shop";
```

UI 可以：

- 顯示「コラボ協力店舗」badge。
- 未來若需要可獨立篩選。

目前協力店共同特典屬於 Detail / Feature 資訊，不改變營業狀態模型。

---

## 22. Open-ended Business Hours

至少有店家使用：

> 売り切れ次第閉店

此類 Place：

- 固定休業日仍可判斷 `CLOSED_TODAY`。
- 開店前仍可判斷 `NOT_OPEN_YET`。
- 開店後回傳 `OPEN_STATUS_UNCERTAIN`。
- 不計算 `CLOSING_SOON`。
- 不計算 `CLOSING_VERY_SOON`。
- UI 必須提示使用者向現場 / 官方確認。

---

## 23. 11/28 Special Rule

全站指定：

```ts
businessInfoSuppressedDates: ["2026-11-28"];
```

### Map page

11/28：

- marker 全部保留。
- 位置照常顯示。
- marker 可點擊。
- 一般 `businessHours` marker 不顯示營業 badge。
- Detail 不宣稱當日營業狀態。
- 頁面顯示 11/28 不提供一般營業資訊的提示。

`ScheduledEvent` 不屬一般營業資訊，因此：

> 「〇〇のはなし」11/28 運行資料仍可顯示。

### List page

如果使用者選：

```text
2026-11-28
```

顯示 blocking modal。

Modal：

- 不提供 close button。
- ESC 不關閉。
- backdrop click 不關閉。
- 使用者必須選擇其他日期。
- 選擇有效日期後自動關閉。

Accessibility：

- `role="dialog"`。
- `aria-modal="true"`。
- 初始 focus 放日期選擇控制。
- 背景不可互動。
- focus trap 在 dialog 內。

不要做成只有 CSS 蓋住頁面但 keyboard 仍能操作背景。

---

## 24. Archive Mode

活動結束後網站會保留。

應透過 config 控制：

```ts
type SiteMode =
  | {
      type: "live";
    }
  | {
      type: "archive";
      frozenDateTime: string;
    };
```

現在預設：

```ts
{
  type: "live";
}
```

未來切換：

```ts
{
  type: 'archive',
  frozenDateTime: '...'
}
```

archive mode 的實際 frozen datetime 由使用者之後決定。

**不要現在自行選日期 / 時間。**

---

## 25. Coordinates

資料中的座標若尚未核對：

```ts
coordinates: null;
```

不要自行猜。

推薦流程：

1. 以官方地址 / `mapQuery` 搜尋。
2. 人工核對地點。
3. 一次性寫入 lat / lng。
4. runtime 不做 geocoding。

若 agent 取得多個可能位置且無法唯一確認，先詢問使用者。

---

## 26. External Map Link

本站負責：

> 去哪裡。

外部地圖負責：

> 怎麼去。

景點 Detail 提供外部地圖連結即可。

不要自行建立：

- turn-by-turn navigation。
- route optimization。
- walking duration。
- transit routing。

---

## 27. Suggested Domain Utilities

保持少量純函式：

```ts
getEventLocalNow();

getScheduleForDate(place, date);

getPlaceStatus(place, now);

getEffectiveCloseTime(slot);

getCollaborationState(collaboration, date);

isBusinessInfoSuppressedDate(date);

isScheduledEventServiceDate(event, date);

getScheduledEventsForPlace(placeId, date);
```

可以依實作需要微調名稱，但不要建立大型 class hierarchy。

---

## 28. Suggested Components

```text
components/

├─ layout/
│  ├─ Header.tsx
│  └─ BottomNavigation.tsx
│
├─ map/
│  ├─ MapClient.tsx
│  ├─ MapView.tsx
│  ├─ PlaceMarker.tsx
│  ├─ MarkerStatusBadge.tsx
│  └─ MarkerLegend.tsx
│
├─ place/
│  ├─ PlaceDetailSheet.tsx
│  ├─ PlaceStatus.tsx
│  ├─ BusinessHours.tsx
│  ├─ CollaborationNotice.tsx
│  └─ ExternalMapLink.tsx
│
├─ list/
│  ├─ DateSelector.tsx
│  ├─ PlaceList.tsx
│  ├─ PlaceListItem.tsx
│  └─ NoBusinessInfoDateDialog.tsx
│
└─ event/
   └─ ScheduledEventCard.tsx
```

這是建議，不是必須逐字照搬。

原則：

- component 小而清楚。
- domain rule 不進 component。
- 不為只有一次使用的小 fragment 過度拆 component。

---

## 29. Testing Requirements

不需要大型 E2E suite 才能開始。

但以下 domain logic **必須有 unit tests**。

### Fixed business hours

```text
10:00–18:00

09:59 → NOT_OPEN_YET
10:00 → OPEN
15:59 → OPEN
16:00 → CLOSING_SOON
17:00 → CLOSING_VERY_SOON
17:59 → CLOSING_VERY_SOON
18:00 → CLOSED
```

### Closed day

```text
Tuesday = null
→ CLOSED_TODAY
```

### L.O.

```text
11:00–14:30
L.O. 14:00

13:59 → CLOSING_VERY_SOON
14:00 → CLOSED
```

### Date override

```text
regular 09:00–17:00
12/29 override 10:00–16:00
```

確認 override 優先。

### Split schedule

```text
09:50–12:00
15:00–18:00
```

至少測：

- 第一段營業中。
- 13:00 → `NOT_OPEN_YET`。
- 第二段營業中。
- 第二段結束後 `CLOSED`。

### Open-ended slot

例如：

```text
10:00–売り切れ次第
```

測：

- 09:59 → `NOT_OPEN_YET`
- 10:00 後 → `OPEN_STATUS_UNCERTAIN`
- 固定休業日 → `CLOSED_TODAY`

### 11/28

一般 `businessHours` Place：

```text
→ HIDDEN
```

Scheduled Event 仍可查。

### Accommodation / statusMode none

```text
→ HIDDEN
```

### Scheduled Event

- service date → available。
- non-service date → unavailable。
- 不透過 weekend / holiday 推算。

---

## 30. Error Handling

最低要求：

- 缺少當日 schedule 不可 crash。
- 缺少座標的 Place 不應讓整張地圖 crash。
- 外部 map URL 錯誤不應影響其他內容。
- 不可因 timezone parse 失敗靜默 fallback 到使用者本地時間並宣稱結果正確。
- 資料缺少到無法可靠判斷狀態時，應顯示 unknown / unavailable 類資訊，而不是猜測。

---

## 31. Development Priority

目標開發時間原本設定為約 **3–5 個工作天**，因此遵循：

### P0

- Static data。
- `getScheduleForDate()`。
- `getPlaceStatus()`。
- Timezone。
- Map。
- Marker statuses。
- Legend。
- Detail。
- External map link。
- Date list。
- 11/28。
- Mobile usability。
- 核心 unit tests。

### P1

- Scheduled Events。
- Collaboration period UI。
- 詳細特殊資訊。
- About 完整內容。
- Support-store badge。

### P2

- 動畫。
- marker transition。
- fancy loading。
- desktop-specific layout。
- gallery。
- 視覺 polish。

若時程不足：

> 優先犧牲視覺 polish，不可犧牲資料正確性與時間判斷。

---

## 32. Definition of Done

MVP 完成時，使用者拿手機、不讀額外文件，應能回答：

1. 所有聯名景點在哪裡？
2. 現在有哪些景點可以去？
3. 哪些景點快結束營業？
4. 哪些景點目前還沒開、但今天稍後會開？
5. 某一天有哪些景點營業？
6. 某個景點今天幾點可利用？
7. 是否有官方明確的特殊營業時間 / 最終入場 / L.O.？
8. 特定日期活動今天是否舉辦？
9. 「〇〇のはなし」今天是否運行、何時經過萩 / 東萩？
10. 決定目的地後，如何交給外部地圖導航？

若上述核心問題無法正確回答，不能因動畫、圖片或 About 已完成而宣稱 MVP 完成。

---

## 33. Coding Style Guidance

### TypeScript

- 優先 strict types。
- 避免 `any`。
- Domain status 使用 union type，不使用 magic strings 到處散落。
- Time parsing / comparison 集中。
- Data constants 儘量 immutable。
- 避免在 UI layer 重複 business rules。

### React / Next.js

- Server Component 預設優先。
- 只有需要 browser API / state / Leaflet 的區域才 `"use client"`。
- 不因 Leaflet 需要 client 而把整個 app 標成 client。
- 避免不必要 global state。
- 頁面間共用的 selected date 若沒有跨頁需求，保持 local state / URL state 即可。
- 若 URL query 能讓日期頁可分享，可考慮使用 `?date=YYYY-MM-DD`，但不是必要條件；若新增需保持簡單。

### Tailwind

- 優先使用簡單可讀的 utility。
- 不建立龐大 design system。
- 狀態顏色必須配合文字 / icon，不可成為唯一資訊來源。
- Mobile first。

---

## 34. Accessibility Baseline

至少：

- 可 keyboard 操作。
- Interactive element 使用 button / anchor，而非只有 `div onClick`。
- marker 若能 keyboard focus，提供可理解 label。
- Bottom Sheet / Dialog 有正確 focus management。
- 11/28 blocking dialog 必須可使用 keyboard 完成改日期。
- 狀態不只靠顏色。
- 外部連結有清楚 accessible name。
- 不因地圖存在而讓清單資訊完全無法由非地圖介面取得。

---

## 35. Performance Guidance

本專案資料量小，約數十個 marker。

不要提早做：

- virtualized list。
- worker。
- complex memoization。
- server cache layer。
- custom spatial indexing。

優先：

- Leaflet 只在需要時 client load。
- 避免載入巨大圖片。
- 保持 bundle 簡單。
- Static export。
- 檢查 mobile loading。

只有 profiling 顯示真正瓶頸後再優化。

---

## 36. Agent Decision Rules

### Agent may decide without asking

在不改變產品行為的前提下，可自行處理：

- 檔案命名。
- 小型 component 邊界。
- 純函式拆分。
- 測試檔位置。
- Tailwind class organization。
- ESLint / Prettier 等一般工程細節。
- 相同需求下的等價重構。

### Agent MUST ask before proceeding

若遇到以下任何一種情況：

- 官方資料含糊。
- 新活動應該建立 marker 還是 feature 不明。
- 同一 marker 有多組可利用時間，不知道哪組應作主狀態。
- 無法決定某資訊是否屬 business status。
- 是否要追蹤 SNS / 即時資訊。
- 需要新增 `PlaceStatus`。
- 需要新增特殊排程模型。
- 需要改變 11/28 規則。
- 住宿是否開始套用營業狀態。
- activity period 是否應影響 marker status。
- marker color / status semantics 需要改變。
- 要新增 route / page。
- 要新增 backend / database / external API。
- 資料來源衝突且無法確認哪個為準。
- 座標存在多個合理候選。
- 需求與本文件有實質衝突。

**不要用「看起來合理」取代詢問。**

---

## 37. Recommended First Implementation Sequence

當從空白 Next.js project 開始：

1. 搬入最新：
   - `types.ts`
   - `places.ts`
   - `scheduled-events.ts`
   - `site-config.ts`
2. 先修正 / 確認 static data compile。
3. 建立 `eventTime.ts`。
4. 實作 `getScheduleForDate()`。
5. 實作 `getPlaceStatus()`。
6. 寫上述 domain unit tests。
7. 完成 Map skeleton。
8. 完成 marker status / legend。
9. 完成 Detail Sheet。
10. 完成 `/list`。
11. 完成 11/28 Dialog。
12. 完成 Scheduled Event UI。
13. 補座標並逐點人工核對。
14. 完成 About / disclaimer。
15. Mobile QA。
16. Static export / deploy。

不要先從漂亮首頁或動畫開始。

---

## 38. Additional Recommendations

以下是可採用、但不應擴大 MVP 的工程建議。

### A. Date query in `/list`

建議清單日期可同步到 URL：

```text
/list?date=2026-10-18
```

優點：

- 可 bookmark。
- 可分享。
- refresh 後狀態不遺失。
- 不需要 global state。

如果實作讓 Next.js static export 顯著複雜化，可先不做。

### B. Pure domain functions

讓營業計算完全不依賴 React：

```ts
getPlaceStatus(place, now);
```

這會讓測試非常容易，也方便 archive mode。

### C. Display formatter separated from calculation

不要讓 domain 回傳 UI 文案。

Domain：

```ts
"CLOSING_SOON";
```

UI formatter：

```ts
getPlaceStatusLabel(status);
```

這樣將來修改日文 / 中文文案不會碰 business logic。

### D. Data validation

可加入簡單 dev-time validation，例如：

- `statusMode === 'businessHours'` 卻沒有 `schedule`。
- fixed slot `open >= close`。
- `usableUntil` 不在 open / close 範圍。
- `coordinates` 一旦填入必須為有效範圍。
- `serviceDates` 必須落在 event activePeriod。
- duplicate place id / feature id。

不需要引入大型 schema library；若專案已用 Zod 可採用，否則純 TS + small assertions 即可。

### E. Test time boundaries first

這個網站最大風險不是畫面，而是：

- 09:59 / 10:00。
- 15:59 / 16:00。
- L.O.。
- 分段營業。
- 休業日。
- override。
- open-ended close。
- timezone。

任何 UI 開發前先讓這些測試通過。

### F. Keep a data changelog

官方活動頁仍可能更新。

建議保留：

```text
data/CHANGELOG.md
```

記錄：

```text
date
source
places changed
rule changed?
requires schema change?
```

避免活動後期不知道某筆資料為什麼被改過。

---

## 39. Final Principle

本專案的核心不是「做一張漂亮的地圖」。

核心是：

> **把官方活動資料轉換成使用者能快速判斷「現在 / 某一天可以去哪裡」的可靠資訊。**

因此所有技術決策優先順序為：

```text
資料正確性
>
時間 / 狀態判斷正確
>
Mobile usability
>
資訊清楚
>
視覺 polish
>
額外功能
```

若任何新設計會讓前四項變差，只為增加技術炫技或功能數量，不應加入 MVP。
