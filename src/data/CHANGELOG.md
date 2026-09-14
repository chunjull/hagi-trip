# Data Changelog

## 2026-09-14

### Archive configuration

- 依使用者確認，臺灣時間 2027/01/01 00:00（2026/12/31 結束後）自動切換紀念模式。
- `frozenDateTime` 設為 `2026-10-10T10:10:00+09:00`；地圖時間與 marker 狀態使用此固定 JST 時間。
- 清單頁鎖定凍結日期 2026/10/10，停用日期選擇器，並忽略日期 query。
- 在瀏覽器判斷模式，每 60 秒及頁面恢復可見時更新，確保 static export 部署後仍能切換；保留手動 archive 設定的優先權。
- 此為網站紀念模式設定，不修改官方景點資料、marker 粒度或營業狀態 schema。

## 2026-09-13

### Places and schema

- 重新校正現有景點座標，並補上「道の駅 萩・さんさん三見」的 coordinates；目前 32 個 Place 均有可用座標。
- 將 `PlaceCategory` 收斂為 `transport`、`airport`、`attraction`、`restaurant`、`hotel` 五類；和服體驗店與神社寺院統一歸入景點，ブーランジェリー住吉丸歸入餐飲。
- 在木戸孝允旧宅補上明確的 stamp rally feature，讓 Detail 的聯名內容與其他集章地點保持一致。
- 清理景點描述中的內部實作說明，保留對使用者有用的營業、休業與體驗資訊。

### Map and detail presentation

- 地圖 marker 改為「景點類別 icon＋營業狀態符號」的組合呈現，並同步更新可收合的狀態圖例；狀態仍以顏色、符號與文字共同表達。
- 首頁調整為滿版地圖，將 JST 時間、11/28 提示、圖例與免責聲明改為地圖 overlay；目前地圖暫不顯示レストランまつおか、萩・石見空港與道の駅 萩・さんさん三見，但三者仍保留在 static data 與日期清單。
- 景點 Detail 在聯名期間外仍顯示 feature 的一般提供時間，並保留「尚未開始／提供中／已結束」狀態；日期清單仍只顯示所選日期適用的時段。
- Detail Sheet 改為固定高度的可捲動內容區，Google Maps 導航按鈕固定於底部，避免長內容把主要操作推出 viewport。

## 2026-09-12

### Sources

- [銀魂暦｜萩市×アニメ「銀魂」コラボイベントサイト](https://luface.jp/business/event/collabo/hagi_gintama_goyomi/)
- [萩・明倫学舎 公式](https://hagimeirin.jp/)
- [萩博物館 公式](https://hagimuseum.jp/)
- [道の駅 萩往還 公式](https://www.hagioukan.com/wp/)
- [道の駅 萩・さんさん三見 公式](https://sansansanmi.com/)

### Places and features

- 補充萩・明倫学舎與萩博物館的コラボグッズ販売時間、付款方式、設施介紹與官方來源；萩博物館的販售期間自10/8起。
- 將既有橙々亭 marker 合併為「道の駅 萩往還」，marker 改以設施整體9:00～18:00為基準，橙々亭保留為獨立餐飲 feature。
- 新增「道の駅 萩・さんさん三見」marker 與コラボグッズ販売 feature；座標暫留 `null` 待人工核對。
- 12/31可能縮短的資訊僅列為提示，不作為確定的 schedule override；さんさん三見的第3個星期三休業則明列為10/21、11/18、12/16。

## 2026-09-10

### Sources

- [銀魂暦｜萩市×アニメ「銀魂」コラボイベントサイト](https://luface.jp/business/event/collabo/hagi_gintama_goyomi/)
- [内閣府｜令和8年（2026年）の国民の祝日](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html)

### Places and features

- 新增着物體驗地點：旧久保田家住宅、萩ふくや、Kimono Style Café、RISA RISA ～魔法の技術者～。
- 在既有萩・明倫学舎與松陰神社 marker 補上キャラクター限定ボイス feature。
- 為 8 間既有聯名餐飲補上菜單名稱、內容、價格、時段及共同特典。
- 新增 5 間 `コラボ協力店舗`：レストランまつおか、藍場川の家、ブーランジェリー住吉丸、あんのけんそーカレー部、レストラン高大。
- 新增文化財地點：熊谷家住宅（熊谷美術館）、菊屋家住宅。
- 在既有松陰神社 marker 補上光洋写真館（松蔭フォトサービス）的記念写真 feature。
- 在既有松陰神社、金毘羅社 円政寺 marker 補上御朱印 feature，並新增春日神社 marker。
- 本次新增的 12 個 marker 已依官方地址與 mapQuery 完成人工核對並補上 coordinates。

### Schedule and schema

- 新增 dev-time static data validator 與測試，檢查 ID、關聯 place、營業時段、座標、活動日期、資料來源及 `statusMode`／schedule 一致性；`coordinates: null` 保持為合法的待人工核對狀態。
- 新增 `SiteMode` discriminated union，並將網站目前模式明確設定為 `{ type: "live" }`；archive 的 `frozenDateTime` 保留待活動結束後由專案負責人決定。
- 擴充 `PlaceCategory`、`FeatureKind` 與 `isCollabSupportStore`，與 `AGENTS.md` 已確認 schema 對齊。
- 將 `TimeSlot` 拆為 fixed close 與 open-ended close，支援ブーランジェリー住吉丸的「売り切れ次第閉店」。
- 修正 weekly schedule helper，確保明確的 `null` 休業日不會 fallback 成預設營業時段。
- 依活動期間列出第2／第4月曜日、第1／第3日曜日等實際休業日期，不新增 recurrence engine。
- 依內閣府 2026 年國定假日資料排除 RISA RISA 的祝日月曜休業，並加入レストランまつおか與藍場川の家的 holiday overrides。
- 松陰神社 marker 主狀態改以整體仍有聯名內容可利用的 8:00～17:00 判斷；寶物殿至誠館內容仍個別保留 9:00～17:00、最終入館16:30。
- 旧久保田家住宅 marker 只在 10/1、10/5、10/11、10/21、10/31、11/1 的 10:00～14:00 提供着物體驗狀態；返却16:30僅列於 Detail 資訊。
