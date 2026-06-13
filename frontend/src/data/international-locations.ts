// 全球主要国家、州/省、城市数据
// 用于档案出生地选择

export interface IntlCity {
  name: string       // 英文名
  nameZh: string     // 中文名
}

export interface IntlState {
  name: string       // 英文名（州/省/都道府县）
  nameZh: string     // 中文名
  cities: IntlCity[]
}

export interface IntlCountry {
  name: string       // 英文名
  nameZh: string     // 中文名
  states?: IntlState[]   // 有州/省的国家
  cities?: IntlCity[]    // 无州/省的国家（直接列出城市）
}

// ── 有州/省层级的国家 ──

const UNITED_STATES: IntlCountry = {
  name: "United States",
  nameZh: "美国",
  states: [
    {
      name: "New York", nameZh: "纽约州",
      cities: [
        { name: "New York City", nameZh: "纽约市" },
        { name: "Buffalo", nameZh: "布法罗" },
        { name: "Albany", nameZh: "奥尔巴尼" },
      ],
    },
    {
      name: "California", nameZh: "加利福尼亚州",
      cities: [
        { name: "Los Angeles", nameZh: "洛杉矶" },
        { name: "San Francisco", nameZh: "旧金山" },
        { name: "San Diego", nameZh: "圣地亚哥" },
        { name: "San Jose", nameZh: "圣何塞" },
        { name: "Sacramento", nameZh: "萨克拉门托" },
        { name: "Oakland", nameZh: "奥克兰" },
      ],
    },
    {
      name: "Illinois", nameZh: "伊利诺伊州",
      cities: [
        { name: "Chicago", nameZh: "芝加哥" },
        { name: "Springfield", nameZh: "斯普林菲尔德" },
      ],
    },
    {
      name: "Texas", nameZh: "德克萨斯州",
      cities: [
        { name: "Houston", nameZh: "休斯顿" },
        { name: "Dallas", nameZh: "达拉斯" },
        { name: "Austin", nameZh: "奥斯汀" },
        { name: "San Antonio", nameZh: "圣安东尼奥" },
      ],
    },
    {
      name: "Florida", nameZh: "佛罗里达州",
      cities: [
        { name: "Miami", nameZh: "迈阿密" },
        { name: "Orlando", nameZh: "奥兰多" },
        { name: "Tampa", nameZh: "坦帕" },
      ],
    },
    {
      name: "Washington", nameZh: "华盛顿州",
      cities: [
        { name: "Seattle", nameZh: "西雅图" },
        { name: "Spokane", nameZh: "斯波坎" },
      ],
    },
    {
      name: "Nevada", nameZh: "内华达州",
      cities: [
        { name: "Las Vegas", nameZh: "拉斯维加斯" },
      ],
    },
    {
      name: "Massachusetts", nameZh: "马萨诸塞州",
      cities: [
        { name: "Boston", nameZh: "波士顿" },
      ],
    },
    {
      name: "District of Columbia", nameZh: "华盛顿特区",
      cities: [
        { name: "Washington D.C.", nameZh: "华盛顿" },
      ],
    },
    {
      name: "Georgia", nameZh: "佐治亚州",
      cities: [
        { name: "Atlanta", nameZh: "亚特兰大" },
      ],
    },
    {
      name: "Pennsylvania", nameZh: "宾夕法尼亚州",
      cities: [
        { name: "Philadelphia", nameZh: "费城" },
        { name: "Pittsburgh", nameZh: "匹兹堡" },
      ],
    },
    {
      name: "Arizona", nameZh: "亚利桑那州",
      cities: [
        { name: "Phoenix", nameZh: "凤凰城" },
        { name: "Tucson", nameZh: "图森" },
      ],
    },
    {
      name: "Oregon", nameZh: "俄勒冈州",
      cities: [
        { name: "Portland", nameZh: "波特兰" },
      ],
    },
    {
      name: "Colorado", nameZh: "科罗拉多州",
      cities: [
        { name: "Denver", nameZh: "丹佛" },
      ],
    },
    {
      name: "Michigan", nameZh: "密歇根州",
      cities: [
        { name: "Detroit", nameZh: "底特律" },
      ],
    },
  ],
}

const CANADA: IntlCountry = {
  name: "Canada",
  nameZh: "加拿大",
  states: [
    {
      name: "Ontario", nameZh: "安大略省",
      cities: [
        { name: "Toronto", nameZh: "多伦多" },
        { name: "Ottawa", nameZh: "渥太华" },
        { name: "Hamilton", nameZh: "汉密尔顿" },
      ],
    },
    {
      name: "British Columbia", nameZh: "不列颠哥伦比亚省",
      cities: [
        { name: "Vancouver", nameZh: "温哥华" },
        { name: "Victoria", nameZh: "维多利亚" },
      ],
    },
    {
      name: "Quebec", nameZh: "魁北克省",
      cities: [
        { name: "Montreal", nameZh: "蒙特利尔" },
        { name: "Quebec City", nameZh: "魁北克市" },
      ],
    },
    {
      name: "Alberta", nameZh: "阿尔伯塔省",
      cities: [
        { name: "Calgary", nameZh: "卡尔加里" },
        { name: "Edmonton", nameZh: "埃德蒙顿" },
      ],
    },
    {
      name: "Manitoba", nameZh: "马尼托巴省",
      cities: [
        { name: "Winnipeg", nameZh: "温尼伯" },
      ],
    },
  ],
}

const JAPAN: IntlCountry = {
  name: "Japan",
  nameZh: "日本",
  states: [
    {
      name: "Tokyo", nameZh: "东京都",
      cities: [
        { name: "Tokyo", nameZh: "东京" },
      ],
    },
    {
      name: "Osaka", nameZh: "大阪府",
      cities: [
        { name: "Osaka", nameZh: "大阪" },
      ],
    },
    {
      name: "Kyoto", nameZh: "京都府",
      cities: [
        { name: "Kyoto", nameZh: "京都" },
      ],
    },
    {
      name: "Kanagawa", nameZh: "神奈川县",
      cities: [
        { name: "Yokohama", nameZh: "横滨" },
      ],
    },
    {
      name: "Aichi", nameZh: "爱知县",
      cities: [
        { name: "Nagoya", nameZh: "名古屋" },
      ],
    },
    {
      name: "Hokkaido", nameZh: "北海道",
      cities: [
        { name: "Sapporo", nameZh: "札幌" },
      ],
    },
    {
      name: "Fukuoka", nameZh: "福冈县",
      cities: [
        { name: "Fukuoka", nameZh: "福冈" },
      ],
    },
    {
      name: "Hyogo", nameZh: "兵库县",
      cities: [
        { name: "Kobe", nameZh: "神户" },
      ],
    },
    {
      name: "Hiroshima", nameZh: "广岛县",
      cities: [
        { name: "Hiroshima", nameZh: "广岛" },
      ],
    },
    {
      name: "Miyagi", nameZh: "宫城县",
      cities: [
        { name: "Sendai", nameZh: "仙台" },
      ],
    },
  ],
}

const SOUTH_KOREA: IntlCountry = {
  name: "South Korea",
  nameZh: "韩国",
  states: [
    {
      name: "Seoul", nameZh: "首尔特别市",
      cities: [
        { name: "Seoul", nameZh: "首尔" },
      ],
    },
    {
      name: "Busan", nameZh: "釜山广域市",
      cities: [
        { name: "Busan", nameZh: "釜山" },
      ],
    },
    {
      name: "Incheon", nameZh: "仁川广域市",
      cities: [
        { name: "Incheon", nameZh: "仁川" },
      ],
    },
    {
      name: "Gyeongsang", nameZh: "庆尚道",
      cities: [
        { name: "Daegu", nameZh: "大邱" },
      ],
    },
    {
      name: "Chungcheong", nameZh: "忠清道",
      cities: [
        { name: "Daejeon", nameZh: "大田" },
      ],
    },
    {
      name: "Jeolla", nameZh: "全罗道",
      cities: [
        { name: "Gwangju", nameZh: "光州" },
      ],
    },
  ],
}

const AUSTRALIA: IntlCountry = {
  name: "Australia",
  nameZh: "澳大利亚",
  states: [
    {
      name: "New South Wales", nameZh: "新南威尔士州",
      cities: [
        { name: "Sydney", nameZh: "悉尼" },
      ],
    },
    {
      name: "Victoria", nameZh: "维多利亚州",
      cities: [
        { name: "Melbourne", nameZh: "墨尔本" },
      ],
    },
    {
      name: "Queensland", nameZh: "昆士兰州",
      cities: [
        { name: "Brisbane", nameZh: "布里斯班" },
        { name: "Gold Coast", nameZh: "黄金海岸" },
      ],
    },
    {
      name: "Western Australia", nameZh: "西澳大利亚州",
      cities: [
        { name: "Perth", nameZh: "珀斯" },
      ],
    },
    {
      name: "South Australia", nameZh: "南澳大利亚州",
      cities: [
        { name: "Adelaide", nameZh: "阿德莱德" },
      ],
    },
  ],
}

const INDIA: IntlCountry = {
  name: "India",
  nameZh: "印度",
  states: [
    {
      name: "Maharashtra", nameZh: "马哈拉施特拉邦",
      cities: [
        { name: "Mumbai", nameZh: "孟买" },
        { name: "Pune", nameZh: "浦那" },
      ],
    },
    {
      name: "Delhi", nameZh: "德里",
      cities: [
        { name: "New Delhi", nameZh: "新德里" },
      ],
    },
    {
      name: "Karnataka", nameZh: "卡纳塔克邦",
      cities: [
        { name: "Bangalore", nameZh: "班加罗尔" },
      ],
    },
    {
      name: "Tamil Nadu", nameZh: "泰米尔纳德邦",
      cities: [
        { name: "Chennai", nameZh: "金奈" },
      ],
    },
    {
      name: "West Bengal", nameZh: "西孟加拉邦",
      cities: [
        { name: "Kolkata", nameZh: "加尔各答" },
      ],
    },
  ],
}

const BRAZIL: IntlCountry = {
  name: "Brazil",
  nameZh: "巴西",
  states: [
    {
      name: "Sao Paulo", nameZh: "圣保罗州",
      cities: [
        { name: "Sao Paulo", nameZh: "圣保罗" },
      ],
    },
    {
      name: "Rio de Janeiro", nameZh: "里约热内卢州",
      cities: [
        { name: "Rio de Janeiro", nameZh: "里约热内卢" },
      ],
    },
    {
      name: "Federal District", nameZh: "联邦区",
      cities: [
        { name: "Brasilia", nameZh: "巴西利亚" },
      ],
    },
  ],
}

const MEXICO: IntlCountry = {
  name: "Mexico",
  nameZh: "墨西哥",
  states: [
    {
      name: "Mexico City", nameZh: "墨西哥城",
      cities: [
        { name: "Mexico City", nameZh: "墨西哥城" },
      ],
    },
    {
      name: "Jalisco", nameZh: "哈利斯科州",
      cities: [
        { name: "Guadalajara", nameZh: "瓜达拉哈拉" },
      ],
    },
    {
      name: "Nuevo Leon", nameZh: "新莱昂州",
      cities: [
        { name: "Monterrey", nameZh: "蒙特雷" },
      ],
    },
  ],
}

const NEW_ZEALAND: IntlCountry = {
  name: "New Zealand",
  nameZh: "新西兰",
  states: [
    {
      name: "Auckland", nameZh: "奥克兰大区",
      cities: [
        { name: "Auckland", nameZh: "奥克兰" },
      ],
    },
    {
      name: "Wellington", nameZh: "惠灵顿大区",
      cities: [
        { name: "Wellington", nameZh: "惠灵顿" },
      ],
    },
    {
      name: "Canterbury", nameZh: "坎特伯雷大区",
      cities: [
        { name: "Christchurch", nameZh: "基督城" },
      ],
    },
  ],
}

const RUSSIA: IntlCountry = {
  name: "Russia",
  nameZh: "俄罗斯",
  states: [
    {
      name: "Moscow", nameZh: "莫斯科",
      cities: [
        { name: "Moscow", nameZh: "莫斯科" },
      ],
    },
    {
      name: "Saint Petersburg", nameZh: "圣彼得堡",
      cities: [
        { name: "Saint Petersburg", nameZh: "圣彼得堡" },
      ],
    },
  ],
}

const TURKEY: IntlCountry = {
  name: "Turkey",
  nameZh: "土耳其",
  states: [
    {
      name: "Istanbul", nameZh: "伊斯坦布尔",
      cities: [
        { name: "Istanbul", nameZh: "伊斯坦布尔" },
      ],
    },
    {
      name: "Ankara", nameZh: "安卡拉",
      cities: [
        { name: "Ankara", nameZh: "安卡拉" },
      ],
    },
  ],
}

// ── 没有州/省层级的国家（直接列出城市）──

const INTERNATIONAL_LOCATIONS: IntlCountry[] = [
  // ── 北美 ──
  UNITED_STATES,
  CANADA,
  MEXICO,
  // ── 东亚 ──
  JAPAN,
  SOUTH_KOREA,
  // ── 东南亚 ──
  {
    name: "Singapore",
    nameZh: "新加坡",
    cities: [
      { name: "Singapore", nameZh: "新加坡" },
    ],
  },
  {
    name: "Thailand",
    nameZh: "泰国",
    cities: [
      { name: "Bangkok", nameZh: "曼谷" },
      { name: "Chiang Mai", nameZh: "清迈" },
      { name: "Phuket", nameZh: "普吉" },
    ],
  },
  {
    name: "Malaysia",
    nameZh: "马来西亚",
    cities: [
      { name: "Kuala Lumpur", nameZh: "吉隆坡" },
      { name: "Penang", nameZh: "槟城" },
      { name: "Johor Bahru", nameZh: "新山" },
    ],
  },
  {
    name: "Indonesia",
    nameZh: "印度尼西亚",
    cities: [
      { name: "Jakarta", nameZh: "雅加达" },
      { name: "Surabaya", nameZh: "泗水" },
      { name: "Bali", nameZh: "巴厘岛" },
    ],
  },
  {
    name: "Philippines",
    nameZh: "菲律宾",
    cities: [
      { name: "Manila", nameZh: "马尼拉" },
      { name: "Cebu", nameZh: "宿务" },
    ],
  },
  {
    name: "Vietnam",
    nameZh: "越南",
    cities: [
      { name: "Ho Chi Minh City", nameZh: "胡志明市" },
      { name: "Hanoi", nameZh: "河内" },
      { name: "Da Nang", nameZh: "岘港" },
    ],
  },
  // ── 南亚 ──
  INDIA,
  // ── 欧洲 ──
  {
    name: "United Kingdom",
    nameZh: "英国",
    cities: [
      { name: "London", nameZh: "伦敦" },
      { name: "Manchester", nameZh: "曼彻斯特" },
      { name: "Birmingham", nameZh: "伯明翰" },
      { name: "Edinburgh", nameZh: "爱丁堡" },
      { name: "Liverpool", nameZh: "利物浦" },
      { name: "Glasgow", nameZh: "格拉斯哥" },
    ],
  },
  {
    name: "France",
    nameZh: "法国",
    cities: [
      { name: "Paris", nameZh: "巴黎" },
      { name: "Marseille", nameZh: "马赛" },
      { name: "Lyon", nameZh: "里昂" },
      { name: "Nice", nameZh: "尼斯" },
    ],
  },
  {
    name: "Germany",
    nameZh: "德国",
    cities: [
      { name: "Berlin", nameZh: "柏林" },
      { name: "Munich", nameZh: "慕尼黑" },
      { name: "Hamburg", nameZh: "汉堡" },
      { name: "Frankfurt", nameZh: "法兰克福" },
      { name: "Cologne", nameZh: "科隆" },
    ],
  },
  {
    name: "Netherlands",
    nameZh: "荷兰",
    cities: [
      { name: "Amsterdam", nameZh: "阿姆斯特丹" },
      { name: "Rotterdam", nameZh: "鹿特丹" },
      { name: "The Hague", nameZh: "海牙" },
    ],
  },
  {
    name: "Spain",
    nameZh: "西班牙",
    cities: [
      { name: "Madrid", nameZh: "马德里" },
      { name: "Barcelona", nameZh: "巴塞罗那" },
    ],
  },
  {
    name: "Italy",
    nameZh: "意大利",
    cities: [
      { name: "Rome", nameZh: "罗马" },
      { name: "Milan", nameZh: "米兰" },
      { name: "Florence", nameZh: "佛罗伦萨" },
      { name: "Venice", nameZh: "威尼斯" },
    ],
  },
  {
    name: "Switzerland",
    nameZh: "瑞士",
    cities: [
      { name: "Zurich", nameZh: "苏黎世" },
      { name: "Geneva", nameZh: "日内瓦" },
    ],
  },
  // ── 大洋洲 ──
  AUSTRALIA,
  NEW_ZEALAND,
  // ── 中东 ──
  {
    name: "United Arab Emirates",
    nameZh: "阿联酋",
    cities: [
      { name: "Dubai", nameZh: "迪拜" },
      { name: "Abu Dhabi", nameZh: "阿布扎比" },
    ],
  },
  {
    name: "Saudi Arabia",
    nameZh: "沙特阿拉伯",
    cities: [
      { name: "Riyadh", nameZh: "利雅得" },
      { name: "Jeddah", nameZh: "吉达" },
    ],
  },
  {
    name: "Israel",
    nameZh: "以色列",
    cities: [
      { name: "Tel Aviv", nameZh: "特拉维夫" },
      { name: "Jerusalem", nameZh: "耶路撒冷" },
    ],
  },
  // ── 南美 ──
  BRAZIL,
  {
    name: "Argentina",
    nameZh: "阿根廷",
    cities: [
      { name: "Buenos Aires", nameZh: "布宜诺斯艾利斯" },
    ],
  },
  // ── 非洲 ──
  {
    name: "South Africa",
    nameZh: "南非",
    cities: [
      { name: "Cape Town", nameZh: "开普敦" },
      { name: "Johannesburg", nameZh: "约翰内斯堡" },
    ],
  },
  {
    name: "Egypt",
    nameZh: "埃及",
    cities: [
      { name: "Cairo", nameZh: "开罗" },
      { name: "Alexandria", nameZh: "亚历山大" },
    ],
  },
  // ── 其他 ──
  RUSSIA,
  TURKEY,
]

export { INTERNATIONAL_LOCATIONS }
