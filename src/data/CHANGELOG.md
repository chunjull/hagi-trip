# Data Changelog

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
