import type { BusinessSchedule, ClockTime, DailySchedule, FixedTimeSlot, IsoDate, OpenEndedTimeSlot, Place, TimeSlot, WeekdayKey } from "@/types";

const EVENT_SOURCE = "https://luface.jp/business/event/collabo/hagi_gintama_goyomi/";
const JAPAN_HOLIDAY_SOURCE = "https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html";

const allDays = (slots: TimeSlot[]): BusinessSchedule => ({
  weekly: {
    sun: slots,
    mon: slots,
    tue: slots,
    wed: slots,
    thu: slots,
    fri: slots,
    sat: slots,
  },
});

const scheduleForWeekday = (rules: Partial<Record<WeekdayKey, DailySchedule>>, day: WeekdayKey, defaultValue: DailySchedule): DailySchedule =>
  Object.prototype.hasOwnProperty.call(rules, day) ? (rules[day] as DailySchedule) : defaultValue;

const weekly = (rules: Partial<Record<WeekdayKey, DailySchedule>>, defaultValue: DailySchedule, overrides?: Partial<Record<IsoDate, DailySchedule>>): BusinessSchedule => ({
  weekly: {
    sun: scheduleForWeekday(rules, "sun", defaultValue),
    mon: scheduleForWeekday(rules, "mon", defaultValue),
    tue: scheduleForWeekday(rules, "tue", defaultValue),
    wed: scheduleForWeekday(rules, "wed", defaultValue),
    thu: scheduleForWeekday(rules, "thu", defaultValue),
    fri: scheduleForWeekday(rules, "fri", defaultValue),
    sat: scheduleForWeekday(rules, "sat", defaultValue),
  },
  overrides,
});

const slot = (open: ClockTime, close: ClockTime, usableUntil?: ClockTime, usableUntilLabel?: string): FixedTimeSlot => ({
  open,
  close,
  ...(usableUntil ? { usableUntil } : {}),
  ...(usableUntilLabel ? { usableUntilLabel } : {}),
});

const openEndedSlot = (open: ClockTime, closeLabel: string): OpenEndedTimeSlot => ({
  open,
  close: null,
  closeLabel,
});

const withOverrides = (base: BusinessSchedule, overrides: Partial<Record<IsoDate, DailySchedule>>): BusinessSchedule => ({
  ...base,
  overrides: {
    ...base.overrides,
    ...overrides,
  },
});

const EVERY_DAY_0900_1700 = allDays([slot("09:00", "17:00")]);

export const PLACES: Place[] = [
  {
    id: "jr-hagi",
    name: "JR萩駅",
    category: "transport",
    address: "山口県萩市大字椿字濁渕3611番地",
    coordinates: {
      lat: 34.3938712,
      lng: 131.4010716,
    },
    mapQuery: "JR萩駅 山口県萩市",
    statusMode: "none",
    description: "「〇〇のはなし」銀魂コラボの対象駅。駅自体には本コラボ用の營業時間が明示されていないため。",
    features: [
      {
        id: "marumaru-train-collab",
        title: "観光列車「〇〇のはなし」コラボ",
        kind: "transport",
        activePeriod: {
          start: "2026-10-03",
          end: "2026-12-20",
        },
        description: "萩駅～東萩駅間の往路では吉田松陽の録り下ろしボイスを実施。",
      },
    ],
    sources: [
      { label: "銀魂暦 公式", url: EVENT_SOURCE },
      {
        label: "JR西日本 萩駅",
        url: "https://eki.jr-odekake.net/top?id=0640783",
      },
    ],
  },

  {
    id: "jr-higashi-hagi",
    name: "JR東萩駅",
    category: "transport",
    address: "山口県萩市大字椿東2997番地",
    coordinates: {
      lat: 34.4170185,
      lng: 131.4103658,
    },
    mapQuery: "JR東萩駅 山口県萩市",
    statusMode: "businessHours",
    statusBasisLabel: "東萩駅観光案内所",
    schedule: withOverrides(EVERY_DAY_0900_1700, {
      "2026-12-29": [slot("10:00", "16:00")],
      "2026-12-30": [slot("10:00", "16:00")],
      "2026-12-31": [slot("10:00", "16:00")],
    }),
    description: "スタンプラリーポイント兼「〇〇のはなし」コラボ展示地点。",
    features: [
      {
        id: "stamp-rally",
        title: "スタンプラリーポイント",
        kind: "stampRally",
      },
      {
        id: "collab-panel",
        title: "コラボイラストパネル",
        kind: "display",
        activePeriod: {
          start: "2026-10-01",
          end: "2026-12-31",
        },
      },
    ],
    sources: [
      { label: "銀魂暦 公式", url: EVENT_SOURCE },
      {
        label: "JR西日本 東萩駅",
        url: "https://eki.jr-odekake.net/top?id=0640782",
      },
    ],
  },

  {
    id: "hagi-iwami-airport",
    name: "萩・石見空港",
    category: "airport",
    address: "島根県益田市内田町イ597",
    coordinates: {
      lat: 34.6781762,
      lng: 131.7967452,
    },
    mapQuery: "萩・石見空港 島根県益田市内田町イ597",
    statusMode: "businessHours",
    statusBasisLabel: "空港ターミナルビル",
    schedule: allDays([slot("08:40", "18:30")]),
    description: "marker 狀態以整個空港ターミナル是否可造訪為準；聯名商品販售時間另列於 Detail。",
    features: [
      {
        id: "airport-shop",
        title: "エアポートショップ 萩・石見",
        kind: "sales",
        schedule: allDays([slot("09:50", "12:00"), slot("15:00", "18:00")]),
        notices: ["12:00～15:00 不營業。"],
      },
      {
        id: "collab-panel",
        title: "描き下ろしイラストパネル",
        kind: "display",
      },
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "hagi-meirin-gakusha",
    name: "萩・明倫学舎",
    category: "attraction",
    address: "山口県萩市江向602番地（萩市役所前）",
    coordinates: {
      lat: 34.4092186,
      lng: 131.3997855,
    },
    mapQuery: "萩・明倫学舎 山口県萩市江向602",
    statusMode: "businessHours",
    statusBasisLabel: "萩・明倫学舎（施設全体）",
    schedule: EVERY_DAY_0900_1700,
    description:
      "全国屈指の規模を誇った萩藩校明倫館の跡地に建つ旧明倫小学校校舎を、萩の観光拠点としてリノベーションした施設。国の登録有形文化財である校舎内に、レストラン、おみやげショップ、幕末ミュージアム、世界遺産ビジターセンターなどがある。marker は施設全体の9:00～17:00を基準とし、各コラボ内容の時間はDetailで個別に表示。",
    features: [
      {
        id: "goods-meirin-gakusha",
        title: "コラボグッズ販売",
        kind: "sales",
        schedule: allDays([slot("09:00", "16:30")]),
        notices: ["支払い方法：現金／クレジットカード／電子マネー／QRコード決済。", "12/31は開館時間が10:00～16:00に短縮される可能性があります。最新情報は施設公式サイトで確認してください。"],
      },
      {
        id: "hagi-tourist-info",
        title: "萩観光案内所｜スタンプラリー用紙販売",
        kind: "sales",
        schedule: withOverrides(EVERY_DAY_0900_1700, {
          "2026-12-29": [slot("10:00", "16:00")],
          "2026-12-30": [slot("10:00", "16:00")],
          "2026-12-31": [slot("10:00", "16:00")],
        }),
      },
      {
        id: "yubikan",
        title: "有備館（旧萩藩校明倫館）｜スタンプラリーポイント",
        kind: "stampRally",
        schedule: allDays([slot("09:00", "16:40")]),
      },
      {
        id: "character-voice-gintoki",
        title: "キャラクター限定ボイス｜坂田銀時",
        kind: "voice",
        description: "本館1階の観光インフォメーションセンターで、坂田銀時の限定ボイスを放送。",
        schedule: EVERY_DAY_0900_1700,
      },
      {
        id: "hagi-goyomi-birthday-lunch",
        title: "萩暦｜坂田銀時のバースデーランチ 2026ver.",
        kind: "food",
        description: "銀時をイメージしたご飯、ブルーわらび餅、萩食材の小鉢、郷土料理「いとこ煮」などを盛り込んだランチ。2,970円（税込）。",
        activePeriod: {
          start: "2026-10-01",
          end: "2026-10-18",
        },
        schedule: weekly(
          {
            tue: null,
          },
          [slot("11:00", "15:00")],
          {
            "2026-10-19": null,
            "2026-11-16": null,
            "2026-12-21": null,
          },
        ),
        notices: ["共通特典のミニキャラコースター（ランダム全14種）とオリジナルランチョンマット付き。", "仕入れ状況により一部内容が日によって変わる場合あり。"],
      },
      {
        id: "hagi-goyomi-itokoni",
        title: "萩暦｜銀魂暦 いとこ煮",
        kind: "food",
        description: "萩の郷土料理「いとこ煮」を、小豆と水色のわらび餅でアレンジ。銀魂暦ロゴのピック付き。800円（税別）。",
        activePeriod: {
          start: "2026-10-19",
          end: "2026-12-31",
        },
        schedule: weekly(
          {
            tue: null,
          },
          [slot("11:00", "15:00")],
          {
            "2026-10-19": null,
            "2026-11-16": null,
            "2026-12-21": null,
          },
        ),
        notices: ["コラボメニュー1点につき、ミニキャラコースターをランダムで1枚配布（なくなり次第終了）。"],
      },
      {
        id: "birthday-event",
        title: "坂田銀時バースデーイベント",
        kind: "event",
        activePeriod: {
          start: "2026-10-01",
          end: "2026-10-18",
        },
        schedule: allDays([slot("09:00", "17:00")]),
      },
      {
        id: "po-yashiro-birthday-cake",
        title: "ポ・ヤシロ｜坂田銀時バースデーケーキ",
        kind: "food",
        description: "銀時をイメージした水色のバースデーケーキ。単品800円、限定アクリルスタンドとのセット1,800円（いずれも税込）。",
        activePeriod: {
          start: "2026-10-01",
          end: "2026-10-18",
        },
        schedule: allDays([slot("13:00", "17:00")]),
        notices: ["アクリルスタンド付きセットは1人1個まで。", "特設会場内での飲食またはテイクアウト可。持ち歩きは1時間程度が目安。"],
      },
    ],
    sources: [
      { label: "銀魂暦 公式", url: EVENT_SOURCE },
      {
        label: "萩・明倫学舎 公式",
        url: "https://hagimeirin.jp/",
      },
    ],
    notices: ["休館日は2月の第1火曜日およびその翌日。", "12/31は開館時間が10:00～16:00に短縮される可能性があります。最新情報は施設公式サイトで確認してください。"],
  },

  {
    id: "former-kubota-family-residence",
    name: "旧久保田家住宅",
    category: "attraction",
    address: "山口県萩市呉服町1-31-5",
    coordinates: {
      lat: 34.4131708,
      lng: 131.3937999,
    },
    mapQuery: "旧久保田家住宅 山口県萩市呉服町1-31-5",
    statusMode: "businessHours",
    statusBasisLabel: "着物体験の受付時間",
    schedule: weekly({}, null, {
      "2026-10-01": [slot("10:00", "14:00")],
      "2026-10-05": [slot("10:00", "14:00")],
      "2026-10-11": [slot("10:00", "14:00")],
      "2026-10-21": [slot("10:00", "14:00")],
      "2026-10-31": [slot("10:00", "14:00")],
      "2026-11-01": [slot("10:00", "14:00")],
    }),
    description: "着物ウィーク in 萩の期間中、指定日のみ着物レンタル・着付けを実施。",
    features: [
      {
        id: "limited-date-kimono-experience",
        title: "期日限定 着物レンタル・着付け",
        kind: "kimono",
        description: "着物レンタル（着付け含む）3,636円、着物持込みの着付けのみ1,818円（いずれも税別）。",
        availabilityDates: ["2026-10-01", "2026-10-05", "2026-10-11", "2026-10-21", "2026-10-31", "2026-11-01"],
        schedule: allDays([slot("10:00", "14:00")]),
        notices: ["当日会場受付・予約不可、先着20名。", "着物の返却は16:30まで。", "ヘアセットなし。", "共通特典のステッカーはなくなり次第終了。"],
      },
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "hagi-fukuya",
    name: "萩ふくや",
    category: "attraction",
    address: "山口県萩市下五間町3",
    coordinates: {
      lat: 34.413752,
      lng: 131.402788,
    },
    mapQuery: "萩ふくや 山口県萩市下五間町3",
    statusMode: "businessHours",
    schedule: weekly(
      {
        wed: null,
      },
      [slot("09:00", "18:00")],
    ),
    description: "着物体験コラボの対象店舗。",
    features: [
      {
        id: "kimono-rental",
        title: "着物レンタル・着付け",
        kind: "kimono",
        description: "着物レンタルは女性5,000円・男性4,000円、幕末志士プランは男性7,000円・女性8,000円、着付けのみ2,000円（すべて税別）。",
        schedule: weekly(
          {
            wed: null,
          },
          [slot("09:00", "18:00")],
        ),
        notices: ["Web、じゃらん、アソビューまたは電話で予約可。", "共通特典のステッカーはなくなり次第終了。"],
      },
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "kimono-style-cafe",
    name: "Kimono Style Café",
    category: "attraction",
    address: "山口県萩市呉服町2-39",
    coordinates: {
      lat: 34.4122519,
      lng: 131.3950386,
    },
    mapQuery: "Kimono Style Café 山口県萩市呉服町2-39",
    statusMode: "businessHours",
    schedule: weekly(
      {
        thu: null,
      },
      [slot("09:00", "18:00")],
    ),
    description: "古民家カフェを併設する着物レンタル店。木曜日は原則休業だが、着物レンタルの予約がある場合は営業。",
    features: [
      {
        id: "kimono-rental",
        title: "着物レンタル",
        kind: "kimono",
        description: "着物レンタル3,618円（税別）。",
        schedule: weekly(
          {
            thu: null,
          },
          [slot("09:00", "18:00")],
        ),
        notices: ["電話またはWebで予約可。", "木曜日でも着物レンタルの予約がある場合は営業。", "萩・竹灯路物語の開催日は営業時間を延長する場合あり。", "共通特典のステッカーはなくなり次第終了。"],
      },
    ],
    notices: ["木曜日は原則休業として扱う。予約時は営業するため、店舗の案内を確認してください。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "risa-risa",
    name: "RISA RISA ～魔法の技術者～",
    category: "attraction",
    address: "山口県萩市椿東2771-13",
    coordinates: {
      lat: 34.4159658,
      lng: 131.4141473,
    },
    mapQuery: "RISA RISA 魔法の技術者 山口県萩市椿東2771-13",
    statusMode: "businessHours",
    schedule: weekly(
      {
        thu: null,
      },
      [slot("10:00", "18:00")],
      {
        "2026-10-26": null,
        "2026-11-09": null,
        "2026-12-14": null,
        "2026-12-28": null,
      },
    ),
    description: "着物・袴レンタルと着付けを提供。木曜日、第2・第4月曜日休業（祝日は営業）。",
    features: [
      {
        id: "kimono-and-hakama-rental",
        title: "着物・袴レンタル",
        kind: "kimono",
        description: "着物レンタル（着付け込）5,000円、袴レンタル（着付け込）4,000円（いずれも税別）。",
        schedule: weekly(
          {
            thu: null,
          },
          [slot("10:00", "18:00")],
          {
            "2026-10-26": null,
            "2026-11-09": null,
            "2026-12-14": null,
            "2026-12-28": null,
          },
        ),
        notices: ["Instagram DMで予約受付。", "ヘアセットはオプション。", "共通特典のステッカーはなくなり次第終了。"],
      },
    ],
    notices: ["2026年の祝日である10/12・11/23は月曜だが営業扱い。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "shoin-jinja",
    name: "松陰神社",
    category: "attraction",
    address: "山口県萩市椿東1537",
    coordinates: {
      lat: 34.4120824,
      lng: 131.4181524,
    },
    mapQuery: "松陰神社 山口県萩市椿東1537",
    statusMode: "businessHours",
    statusBasisLabel: "松陰神社（境内・御朱印）",
    schedule: allDays([slot("08:00", "17:00")]),
    description: "marker は、御朱印を含む境内の聯名內容を利用できる8:00～17:00で判定。宝物殿至誠館のスタンプ・限定ボイスは9:00から、最終入館は16:30。",
    features: [
      {
        id: "stamp-rally",
        title: "宝物殿至誠館｜スタンプラリーポイント",
        kind: "stampRally",
        schedule: allDays([slot("09:00", "17:00", "16:30", "最終入館")]),
      },
      {
        id: "character-voice-shoyo",
        title: "キャラクター限定ボイス｜吉田松陽",
        kind: "voice",
        description: "宝物殿至誠館で吉田松陽の限定ボイスを放送。",
        schedule: allDays([slot("09:00", "17:00", "16:30", "最終入館")]),
      },
      {
        id: "gintama-goshuin",
        title: "銀魂暦 コラボ御朱印",
        kind: "goshuin",
        description: "「銀時・高杉・桂（幼少期）と吉田松陽」「吉田松陽」の2種。各909円（税別）。",
        schedule: allDays([slot("08:00", "17:00")]),
        notices: ["オリジナルデザイン和紙で頒布。", "参拝後に申し込むこと。1人各1体までとなる場合あり。"],
      },
      {
        id: "shokasonjuku-commemorative-photo",
        title: "光洋写真館｜銀魂×松下村塾 記念写真",
        kind: "photo",
        description: "松下村塾で銀魂暦限定デザインのフォトフレーム写真を撮影・販売。1,818円（税別）。",
        schedule: EVERY_DAY_0900_1700,
        notices: ["電話・メール・Instagram DMで予約可。", "支払い方法は現金。"],
      },
    ],
    notices: ["展示替え等で臨時休館が発生した場合、スタンプ台が敷地内の別位置へ移動する可能性あり。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "hagi-museum",
    name: "萩博物館",
    category: "attraction",
    address: "山口県萩市大字堀内355番地",
    coordinates: {
      lat: 34.413441,
      lng: 131.3905378,
    },
    mapQuery: "萩博物館 山口県萩市堀内355",
    statusMode: "businessHours",
    schedule: withOverrides(allDays([slot("09:00", "17:00", "16:30", "最終入館")]), {
      "2026-12-30": null,
      "2026-12-31": null,
    }),
    description: "萩の自然・歴史・文化を総合的に紹介する学びの拠点。明治維新の志士ゆかりの資料や城下町の成り立ちを深く理解し、萩の魅力を体感できる博物館。スタンプラリーポイントでもある。",
    features: [
      {
        id: "stamp-rally",
        title: "スタンプラリーポイント",
        kind: "stampRally",
      },
      {
        id: "goods-hagi-museum",
        title: "コラボグッズ販売",
        kind: "sales",
        activePeriod: {
          start: "2026-10-08",
          end: "2026-12-31",
        },
        schedule: withOverrides(allDays([slot("09:00", "17:00")]), {
          "2026-12-30": null,
          "2026-12-31": null,
        }),
        notices: ["支払い方法：現金／クレジットカード／電子マネー／QRコード決済。"],
      },
    ],
    notices: ["12/30・12/31 は休館。該兩日的 stamp 設置位置移至萩観光案内所（10:00～16:00）。"],
    sources: [
      { label: "銀魂暦 公式", url: EVENT_SOURCE },
      { label: "萩博物館 公式", url: "https://hagimuseum.jp/" },
    ],
  },

  {
    id: "kido-takayoshi-old-residence",
    name: "木戸孝允旧宅",
    category: "attraction",
    address: "山口県萩市呉服町2丁目37",
    coordinates: {
      lat: 34.4122903,
      lng: 131.3947245,
    },
    mapQuery: "木戸孝允旧宅 山口県萩市呉服町2丁目37",
    statusMode: "businessHours",
    schedule: EVERY_DAY_0900_1700,
    description: "スタンプラリーポイント。",
    features: [
      {
        id: "stamp-rally",
        title: "スタンプラリーポイント",
        kind: "stampRally",
      },
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "enseiji",
    name: "金毘羅社 円政寺",
    category: "attraction",
    address: "山口県萩市南古萩町6",
    coordinates: {
      lat: 34.4113712,
      lng: 131.3942451,
    },
    mapQuery: "金毘羅社 円政寺 山口県萩市南古萩町6",
    statusMode: "businessHours",
    statusBasisLabel: "金毘羅社 円政寺（開門時間）",
    schedule: allDays([slot("08:00", "17:00")]),
    description: "スタンプラリーポイント兼、コラボ御朱印の頒布場所。",
    features: [
      {
        id: "stamp-rally",
        title: "スタンプラリーポイント",
        kind: "stampRally",
        schedule: allDays([slot("08:00", "17:00")]),
      },
      {
        id: "gintama-goshuin",
        title: "銀魂暦 コラボ御朱印",
        kind: "goshuin",
        description: "銀時・高杉・桂（幼少期）のコラボ御朱印。909円（税別）。",
        schedule: allDays([slot("08:00", "17:00")]),
        notices: ["オリジナルデザイン和紙で頒布。", "参拝後に申し込むこと。1人1体までとなる場合あり。"],
      },
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "kasuga-jinja",
    name: "春日神社",
    category: "attraction",
    address: "山口県萩市堀内285",
    coordinates: {
      lat: 34.4109205,
      lng: 131.3894521,
    },
    mapQuery: "春日神社 山口県萩市堀内285",
    statusMode: "businessHours",
    statusBasisLabel: "春日神社（御朱印頒布時間）",
    schedule: EVERY_DAY_0900_1700,
    description: "銀魂暦コラボ御朱印の頒布場所。",
    features: [
      {
        id: "gintama-goshuin",
        title: "銀魂暦 コラボ御朱印",
        kind: "goshuin",
        description: "銀時・高杉・桂（大人）のコラボ御朱印。909円（税別）。",
        schedule: EVERY_DAY_0900_1700,
        notices: ["オリジナルデザイン和紙で頒布。", "参拝後に申し込むこと。1人1体までとなる場合あり。"],
      },
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "kumaya-art-museum",
    name: "熊谷家住宅（熊谷美術館）",
    category: "attraction",
    address: "山口県萩市今魚店町47番地",
    coordinates: {
      lat: 34.4168032,
      lng: 131.3959808,
    },
    mapQuery: "熊谷家住宅 熊谷美術館 山口県萩市今魚店町47",
    statusMode: "businessHours",
    schedule: weekly(
      {
        wed: null,
        thu: null,
      },
      [slot("09:00", "16:00", "15:30", "最終入館")],
    ),
    description: "国指定重要文化財の建築と美術品を公開する施設。コラボ特典と館内装飾を実施。",
    features: [
      {
        id: "cultural-property-collab",
        title: "文化財コラボ",
        kind: "culturalProperty",
        description: "高杉晋助・桂小太郎のパネル各1枚と、両キャラクターをあしらった掛け軸各1枚を設置。",
        schedule: weekly(
          {
            wed: null,
            thu: null,
          },
          [slot("09:00", "16:00", "15:30", "最終入館")],
        ),
        notices: ["入場時にコラボ目的と伝えると共通特典ステッカーを配布（なくなり次第終了）。"],
      },
    ],
    notices: [
      "水・木曜日休館。ただし祝日は開館。イベント期間中、該当曜日に重なる2026年の国民の祝日はありません。",
      "入館料は大人1,000円、18歳以下無料（年齢確認書類が必要）。企画展会期中は特別料金。",
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "kikuya-family-residence",
    name: "菊屋家住宅",
    category: "attraction",
    address: "山口県萩市呉服町1-1",
    coordinates: {
      lat: 34.4128893,
      lng: 131.393698,
    },
    mapQuery: "菊屋家住宅 山口県萩市呉服町1-1",
    statusMode: "businessHours",
    schedule: withOverrides(allDays([slot("09:00", "17:00", "16:45", "最終入館")]), {
      "2026-12-31": null,
    }),
    description: "国指定重要文化財の豪商屋敷。コラボパネルと入場特典を用意。",
    features: [
      {
        id: "cultural-property-collab",
        title: "文化財コラボ",
        kind: "culturalProperty",
        description: "坂田銀時のコラボパネルを1枚設置。",
        schedule: withOverrides(allDays([slot("09:00", "17:00", "16:45", "最終入館")]), {
          "2026-12-31": null,
        }),
        notices: ["入場時にコラボ目的と伝えると共通特典ステッカーを配布（なくなり次第終了）。"],
      },
    ],
    notices: ["入館料は一般650円、高校・中学生350円、小学生250円（団体料金あり）。", "12/31休館。臨時休館は自動判定に反映しない。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "casa-inn-iseya",
    name: "CASA inn Iseya",
    category: "hotel",
    address: "山口県萩市呉服町2丁目34",
    coordinates: {
      lat: 34.4126869,
      lng: 131.3940821,
    },
    mapQuery: "CASA inn ISEYA カーサ・イン・イセヤ",
    statusMode: "none",
    features: [
      {
        id: "collab-lodging-plan",
        title: "コラボ宿泊プラン",
        kind: "lodging",
        availabilityDates: [
          "2026-10-09",
          "2026-10-10",
          "2026-10-11",
          "2026-10-12",
          "2026-10-13",
          "2026-10-14",
          "2026-10-18",
          "2026-10-19",
          "2026-10-23",
          "2026-10-24",
          "2026-10-25",
          "2026-10-26",
          "2026-10-30",
          "2026-10-31",
          "2026-11-01",
          "2026-11-02",
          "2026-11-03",
          "2026-11-15",
          "2026-11-16",
          "2026-11-17",
          "2026-11-18",
          "2026-11-19",
          "2026-12-18",
          "2026-12-19",
          "2026-12-20",
          "2026-12-21",
          "2026-12-22",
          "2026-12-23",
          "2026-12-24",
          "2026-12-25",
          "2026-12-26",
          "2026-12-27",
          "2026-12-28",
          "2026-12-29",
          "2026-12-30",
          "2026-12-31",
        ],
      },
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "hagi-honjin",
    name: "源泉の宿 萩本陣",
    category: "hotel",
    address: "山口県萩市椿東385-8",
    coordinates: {
      lat: 34.4151573,
      lng: 131.4189253,
    },
    mapQuery: "源泉の宿 萩本陣 山口県萩市椿東385-8",
    statusMode: "none",
    features: [
      {
        id: "collab-lodging-plan",
        title: "コラボ宿泊プラン",
        kind: "lodging",
      },
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "hokumon-yashiki",
    name: "萩城三の丸 北門屋敷",
    category: "hotel",
    address: "山口県萩市堀内210",
    coordinates: {
      lat: 34.4137519,
      lng: 131.3858816,
    },
    mapQuery: "萩城三の丸 北門屋敷 山口県萩市堀内210",
    statusMode: "none",
    features: [
      {
        id: "collab-lodging-plan",
        title: "コラボ宿泊プラン",
        kind: "lodging",
      },
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "hagi-no-yado-jomoe",
    name: "萩の宿 常茂恵",
    category: "hotel",
    address: "山口県萩市土原608-53",
    coordinates: {
      lat: 34.4176091,
      lng: 131.405903,
    },
    mapQuery: "萩の宿 常茂恵 山口県萩市土原608-53",
    statusMode: "none",
    features: [
      {
        id: "collab-lodging-plan",
        title: "コラボ宿泊プラン",
        kind: "lodging",
        notices: ["常茂恵限定オリジナルランチョンマットあり。"],
      },
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "michi-no-eki-hagi-okan",
    name: "道の駅 萩往還",
    category: "attraction",
    address: "山口県萩市大字椿字鹿背ヶ坂1258",
    coordinates: {
      lat: 34.3693249,
      lng: 131.4130574,
    },
    mapQuery: "道の駅 萩往還 山口県萩市大字椿字鹿背ヶ坂1258",
    statusMode: "businessHours",
    statusBasisLabel: "道の駅 萩往還（施設全体）",
    schedule: allDays([slot("09:00", "18:00")]),
    description:
      "萩と山口を結ぶ歴史街道の要衝に位置し、特産品や郷土グルメを楽しめる道の駅。明治維新ゆかりの史跡散策の拠点としても便利な施設。marker は道の駅全体の9:00～18:00を基準とし、レストランの時間はDetailで個別に表示。",
    features: [
      {
        id: "collab-goods-sales",
        title: "コラボグッズ販売",
        kind: "sales",
        activePeriod: {
          start: "2026-10-08",
          end: "2026-12-31",
        },
        schedule: allDays([slot("09:00", "18:00")]),
        notices: ["支払い方法：現金／PayPay／クレジット。"],
      },
      {
        id: "daidaitei-collab-menu",
        title: "橙々亭｜ソバじゃない瓦ソバだ！桂とエリザベスの瓦ソバ",
        kind: "food",
        description: "瓦に茶そば、錦糸卵、長萩和牛などをのせ、萩の醤油で味付けしたつゆで味わう瓦そば。桂とエリザベスのピック付き。1,500円（税別）。",
        schedule: allDays([slot("11:00", "16:00", "15:45", "L.O.")]),
        notices: ["支払い方法は現金のみ。", "コラボメニュー1点につき、ミニキャラコースターをランダムで1枚配布（なくなり次第終了）。"],
      },
    ],
    notices: ["道の駅は無休。レストランの営業日は異なるため、詳細は施設公式サイトを確認してください。", "橙々亭の臨時休業はInstagramで告知されるため、本網站の自動判定には反映しない。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "michi-no-eki-hagi-sansan-sanmi",
    name: "道の駅 萩・さんさん三見",
    category: "attraction",
    address: "山口県萩市三見1028-2",
    coordinates: {
      lat: 34.3889121,
      lng: 131.3220752,
    },
    mapQuery: "道の駅 萩・さんさん三見 山口県萩市三見1028-2",
    statusMode: "businessHours",
    statusBasisLabel: "道の駅 萩・さんさん三見（施設全体）",
    schedule: weekly({}, [slot("09:00", "17:00")], {
      "2026-10-21": null,
      "2026-11-18": null,
      "2026-12-16": null,
    }),
    description: "萩市西側の玄関口に位置する道の駅。地元産の新鮮な野菜・果物、萩市や山口県の名産品がそろい、さんさんと太陽が降り注ぐオーシャンビューを楽しめる。",
    features: [
      {
        id: "collab-goods-sales",
        title: "コラボグッズ販売",
        kind: "sales",
        activePeriod: {
          start: "2026-10-08",
          end: "2026-12-31",
        },
        schedule: weekly({}, [slot("09:00", "17:00")], {
          "2026-10-21": null,
          "2026-11-18": null,
          "2026-12-16": null,
        }),
        notices: [
          "支払い方法：現金／クレジットカード／電子マネー／QRコード決済。",
          "12/31は開館時間が9:00～12:00に短縮される可能性があり、食堂は休業します。最新情報は施設公式サイトで確認してください。",
        ],
      },
    ],
    notices: [
      "毎月第3水曜日休業。活動期間中は10/21・11/18・12/16が該当します。",
      "12/31は開館時間が9:00～12:00に短縮される可能性があり、食堂は休業します。最新情報は施設公式サイトで確認してください。",
    ],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "kanmidokoro-anzu",
    name: "甘味処 あんず",
    category: "restaurant",
    address: "山口県萩市浜崎町浜崎4区160",
    coordinates: {
      lat: 34.4215437,
      lng: 131.4006837,
    },
    mapQuery: "甘味処 あんず 萩市浜崎町160",
    statusMode: "businessHours",
    schedule: allDays([slot("11:00", "17:00", "16:30", "L.O.")]),
    description: "聯名餐飲。",
    features: [
      {
        id: "collab-menu",
        title: "松下村塾のひとやすみお団子セット",
        kind: "food",
        description: "吉田松陽をイメージした草団子と、椿・夏みかん・萩の花を表現した団子2本、ドリンクのセット。テイクアウト可。1,091円（税別）。",
        schedule: allDays([slot("11:00", "17:00", "16:30", "L.O.")]),
        notices: ["銀魂暦ロゴのピック付き。", "コラボメニュー1点につき、ミニキャラコースターをランダムで1枚配布（なくなり次第終了）。"],
      },
    ],
    notices: ["不定休。Instagram 告知的臨時休業不納入自動判定。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "sake-to-teishoku-hacchi",
    name: "酒ト定食 はっち",
    category: "restaurant",
    address: "山口県萩市土原522-1",
    coordinates: {
      lat: 34.4098171,
      lng: 131.4050624,
    },
    mapQuery: "酒ト定食 はっち 萩市土原522-1",
    statusMode: "businessHours",
    schedule: weekly(
      {
        wed: null,
      },
      [slot("11:00", "14:30", "14:00", "L.O.")],
    ),
    description: "聯名餐飲。水曜休。",
    features: [
      {
        id: "collab-menu",
        title: "松下村塾のおむすびプレート",
        kind: "food",
        description: "梅・ツナマヨ・昆布の小さなおむすび3個に、チキンチキンごぼうやミニ抹茶パフェなどを添えたプレート。1,719円（税別）。",
        schedule: weekly(
          {
            wed: null,
          },
          [slot("11:00", "14:30", "14:00", "L.O.")],
        ),
        notices: ["描き下ろしイラストのミニカード付き。", "コラボメニュー1点につき、ミニキャラコースターをランダムで1枚配布（なくなり次第終了）。"],
      },
    ],
    notices: ["臨時休業はInstagramで告知されるため、本網站の自動判定には反映しない。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "muraya-cafe",
    name: "中村船具店 むらやカフェ",
    category: "restaurant",
    address: "山口県萩市浜崎町2-205",
    coordinates: {
      lat: 34.4210807,
      lng: 131.4006532,
    },
    mapQuery: "中村船具店 むらやカフェ 萩市浜崎町2-205",
    statusMode: "businessHours",
    schedule: weekly(
      {
        mon: [slot("11:00", "16:00")],
        thu: null,
      },
      [slot("09:00", "16:00")],
    ),
    description: "聯名餐飲。月曜のみ 11:00～16:00、木曜休。",
    features: [
      {
        id: "collab-menu",
        title: "銀さんの糖分補給ぜんざい",
        kind: "food",
        description: "通常より甘さを増したぜんざいとコーヒー牛乳のセット。10～11月はアイス、12月はホットカフェオレで提供。909円（税別）。",
        schedule: weekly(
          {
            mon: [slot("11:00", "16:00")],
            thu: null,
          },
          [slot("09:00", "16:00")],
        ),
        notices: ["坂田銀時のミニキャラピック付き。", "コラボメニュー1点につき、ミニキャラコースターをランダムで1枚配布（なくなり次第終了）。"],
      },
    ],
    notices: ["臨時休日はInstagramで告知されるため、本網站の自動判定には反映しない。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "hagi-purin-tei",
    name: "萩ぷりん亭",
    category: "restaurant",
    address: "山口県萩市呉服町2丁目10",
    coordinates: {
      lat: 34.4130512,
      lng: 131.3944848,
    },
    mapQuery: "萩ぷりん亭 萩市呉服町2丁目10",
    statusMode: "businessHours",
    schedule: EVERY_DAY_0900_1700,
    description: "聯名餐飲。",
    features: [
      {
        id: "collab-menu",
        title: "銀魂暦 ぷりんぱふぇ",
        kind: "food",
        description: "なめらかぷりんに萩らしい夏みかんジュレを重ね、抹茶ソースをトッピングしたパフェ。銀魂暦ロゴのピック付き。890円（税別）。",
        schedule: EVERY_DAY_0900_1700,
        notices: ["コラボメニュー1点につき、ミニキャラコースターをランダムで1枚配布（なくなり次第終了）。"],
      },
    ],
    notices: ["官方僅標示「年末年始休業」，具體年末休業日會於 X / Instagram / 店頭公告，因此本網站不自行推測休業日期。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "hachi-no-tane",
    name: "はちのたね",
    category: "restaurant",
    address: "山口県萩市椿陣ヶ原2757-1",
    coordinates: {
      lat: 34.395907,
      lng: 131.4035825,
    },
    mapQuery: "はちのたね 萩市椿陣ヶ原2757-1",
    statusMode: "businessHours",
    schedule: weekly(
      {
        tue: null,
        wed: null,
      },
      [slot("11:00", "16:00", "15:30", "L.O.")],
    ),
    description: "聯名餐飲。火・水曜休。",
    features: [
      {
        id: "collab-menu",
        title: "松陽先生の約束月見バーガーセット",
        kind: "food",
        description: "吉田松陽の場面をイメージした、かまぼこカツの月見バーガーとグリーンティーのセット。テイクアウト可。1,500円（税別）。",
        schedule: weekly(
          {
            tue: null,
            wed: null,
          },
          [slot("11:00", "16:00", "15:30", "L.O.")],
        ),
        notices: ["吉田松陽のミニキャラピック付き。", "コラボメニュー1点につき、ミニキャラコースターをランダムで1枚配布（なくなり次第終了）。"],
      },
    ],
    notices: ["臨時休業はInstagramで告知されるため、本網站の自動判定には反映しない。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "hotoritei",
    name: "ホトリテイ",
    category: "restaurant",
    address: "山口県萩市南片河町62",
    coordinates: {
      lat: 34.4112566,
      lng: 131.3920866,
    },
    mapQuery: "ホトリテイ 萩市南片河町62",
    statusMode: "businessHours",
    schedule: allDays([slot("11:00", "16:00", "15:30", "L.O.")]),
    description: "聯名餐飲。",
    features: [
      {
        id: "collab-menu",
        title: "鬼兵隊ハンバーグ",
        kind: "food",
        description: "赤ワインソースと煙管をイメージしたスモークチーズで高杉晋助らしさを表現したハンバーグプレート。2,090円（税別）。",
        schedule: allDays([slot("11:00", "16:00", "15:30", "L.O.")]),
        notices: ["高杉晋助のミニキャラピック付き。", "コラボメニュー1点につき、ミニキャラコースターをランダムで1枚配布（なくなり次第終了）。"],
      },
    ],
    notices: ["不定休。Instagram 告知的臨時休業不納入自動判定。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "restaurant-matsuoka",
    name: "レストランまつおか",
    category: "restaurant",
    address: "山口県萩市大字江崎1101",
    coordinates: {
      lat: 34.6393366,
      lng: 131.6532802,
    },
    mapQuery: "レストランまつおか 山口県萩市江崎1101",
    statusMode: "businessHours",
    isCollabSupportStore: true,
    schedule: weekly(
      {
        mon: null,
      },
      [slot("11:00", "15:00", "14:00", "L.O."), slot("17:00", "22:00", "20:00", "L.O.")],
      {
        "2026-10-12": [slot("11:00", "15:00", "14:00", "L.O."), slot("17:00", "22:00", "20:00", "L.O.")],
        "2026-10-14": null,
        "2026-11-23": [slot("11:00", "15:00", "14:00", "L.O."), slot("17:00", "22:00", "20:00", "L.O.")],
        "2026-11-25": null,
      },
    ),
    description: "創作フレンチのコラボ協力店舗。コラボフードの提供はありません。",
    features: [
      {
        id: "support-store-benefit",
        title: "コラボ協力店舗 共通購入特典",
        kind: "supportStoreBenefit",
        description: "会計2,000円（税込）ごとに、ミニキャラコースターをランダムで1枚配布。",
        notices: ["絵柄は選択不可。", "特典はなくなり次第終了。", "ディナーは前日までに予約が必要。"],
      },
    ],
    notices: ["月曜休。月曜が祝日の場合は営業し、その週の水曜が休業。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "aibagawa-no-ie",
    name: "藍場川の家",
    category: "restaurant",
    address: "山口県萩市川島294",
    coordinates: {
      lat: 34.4031523,
      lng: 131.406468,
    },
    mapQuery: "藍場川の家 山口県萩市川島294",
    statusMode: "businessHours",
    isCollabSupportStore: true,
    schedule: weekly(
      {
        tue: null,
        wed: null,
      },
      [slot("10:00", "17:00", "16:30", "L.O.")],
      {
        "2026-11-03": [slot("10:00", "17:00", "16:30", "L.O.")],
      },
    ),
    description: "藍場川と庭を眺めながら紅茶や手作りケーキを楽しめるコラボ協力店舗。コラボフードの提供はありません。",
    features: [
      {
        id: "support-store-benefit",
        title: "コラボ協力店舗 共通購入特典",
        kind: "supportStoreBenefit",
        description: "会計2,000円（税込）ごとに、ミニキャラコースターをランダムで1枚配布。",
        notices: ["絵柄は選択不可。", "特典はなくなり次第終了。"],
      },
    ],
    notices: ["火・水曜休。祝日は営業するため、文化の日の11/3は営業扱い。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "boulangerie-sumiyoshimaru",
    name: "ブーランジェリー住吉丸",
    category: "restaurant",
    address: "山口県萩市今古萩町18",
    coordinates: {
      lat: 34.4161524,
      lng: 131.4031912,
    },
    mapQuery: "ブーランジェリー住吉丸 山口県萩市今古萩町18",
    statusMode: "businessHours",
    isCollabSupportStore: true,
    schedule: weekly(
      {
        sun: null,
        mon: null,
        tue: [openEndedSlot("12:00", "売り切れ次第閉店")],
        sat: [openEndedSlot("09:00", "売り切れ次第閉店")],
      },
      [openEndedSlot("10:00", "売り切れ次第閉店")],
    ),
    description: "萩の食材を使ったパンを販売するコラボ協力店舗。コラボフードの提供はありません。",
    features: [
      {
        id: "support-store-benefit",
        title: "コラボ協力店舗 共通購入特典",
        kind: "supportStoreBenefit",
        description: "会計2,000円（税込）ごとに、ミニキャラコースターをランダムで1枚配布。",
        notices: ["絵柄は選択不可。", "特典はなくなり次第終了。"],
      },
    ],
    notices: ["商品が売り切れ次第閉店するため、開店後の營業狀態は現地または公式Instagramで確認してください。", "月・日曜休。臨時休業は自動判定に反映しない。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "anno-kenso-curry-club",
    name: "あんのけんそーカレー部",
    category: "restaurant",
    address: "山口県萩市土原3-350-6",
    coordinates: {
      lat: 34.4141472,
      lng: 131.4058898,
    },
    mapQuery: "あんのけんそー カレー部",
    statusMode: "businessHours",
    isCollabSupportStore: true,
    schedule: weekly(
      {
        thu: null,
      },
      [slot("11:00", "14:30", "14:00", "L.O.")],
      {
        "2026-10-04": null,
        "2026-10-18": null,
        "2026-11-01": null,
        "2026-11-15": null,
        "2026-12-06": null,
        "2026-12-20": null,
      },
    ),
    description: "萩野菜を使った欧風カレーを提供するコラボ協力店舗。コラボフードの提供はありません。",
    features: [
      {
        id: "support-store-benefit",
        title: "コラボ協力店舗 共通購入特典",
        kind: "supportStoreBenefit",
        description: "会計2,000円（税込）ごとに、ミニキャラコースターをランダムで1枚配布。",
        notices: ["絵柄は選択不可。", "特典はなくなり次第終了。"],
      },
    ],
    notices: ["木曜、第1・第3日曜休。イベント期間中の該当日を date override として列挙。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },

  {
    id: "restaurant-takadai",
    name: "レストラン高大",
    category: "restaurant",
    address: "山口県萩市唐樋町80番",
    coordinates: {
      lat: 34.4103142,
      lng: 131.4022046,
    },
    mapQuery: "レストラン高大 山口県萩市唐樋町80",
    statusMode: "businessHours",
    isCollabSupportStore: true,
    schedule: allDays([slot("09:00", "21:00")]),
    description: "老舗旅館にある和洋食レストランのコラボ協力店舗。コラボフードの提供はありません。",
    features: [
      {
        id: "support-store-benefit",
        title: "コラボ協力店舗 共通購入特典",
        kind: "supportStoreBenefit",
        description: "会計2,000円（税込）ごとに、ミニキャラコースターをランダムで1枚配布。",
        notices: ["絵柄は選択不可。", "特典はなくなり次第終了。"],
      },
    ],
    notices: ["不定休。最新の営業状況は施設の公式案内を確認してください。"],
    sources: [{ label: "銀魂暦 公式", url: EVENT_SOURCE }],
  },
];
