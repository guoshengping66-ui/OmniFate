// 全球主要国家和城市数据
// 用于八字命盘出生地选择

export interface IntlCity {
  name: string       // 英文名
  nameZh: string     // 中文名
}

export interface IntlCountry {
  name: string       // 英文名
  nameZh: string     // 中文名
  cities: IntlCity[]
}

export const INTERNATIONAL_LOCATIONS: IntlCountry[] = [
  // ── 北美 ──
  {
    name: "United States",
    nameZh: "美国",
    cities: [
      { name: "New York", nameZh: "纽约" },
      { name: "Los Angeles", nameZh: "洛杉矶" },
      { name: "San Francisco", nameZh: "旧金山" },
      { name: "Chicago", nameZh: "芝加哥" },
      { name: "Houston", nameZh: "休斯顿" },
      { name: "Phoenix", nameZh: "凤凰城" },
      { name: "San Diego", nameZh: "圣地亚哥" },
      { name: "Seattle", nameZh: "西雅图" },
      { name: "Las Vegas", nameZh: "拉斯维加斯" },
      { name: "Boston", nameZh: "波士顿" },
      { name: "Washington D.C.", nameZh: "华盛顿" },
      { name: "Miami", nameZh: "迈阿密" },
      { name: "Atlanta", nameZh: "亚特兰大" },
      { name: "Dallas", nameZh: "达拉斯" },
      { name: "Philadelphia", nameZh: "费城" },
      { name: "San Jose", nameZh: "圣何塞" },
      { name: "Austin", nameZh: "奥斯汀" },
      { name: "Portland", nameZh: "波特兰" },
      { name: "Denver", nameZh: "丹佛" },
      { name: "Detroit", nameZh: "底特律" },
    ],
  },
  {
    name: "Canada",
    nameZh: "加拿大",
    cities: [
      { name: "Toronto", nameZh: "多伦多" },
      { name: "Vancouver", nameZh: "温哥华" },
      { name: "Montreal", nameZh: "蒙特利尔" },
      { name: "Calgary", nameZh: "卡尔加里" },
      { name: "Ottawa", nameZh: "渥太华" },
      { name: "Edmonton", nameZh: "埃德蒙顿" },
      { name: "Winnipeg", nameZh: "温尼伯" },
    ],
  },
  {
    name: "Mexico",
    nameZh: "墨西哥",
    cities: [
      { name: "Mexico City", nameZh: "墨西哥城" },
      { name: "Guadalajara", nameZh: "瓜达拉哈拉" },
      { name: "Monterrey", nameZh: "蒙特雷" },
    ],
  },
  // ── 东亚 ──
  {
    name: "Japan",
    nameZh: "日本",
    cities: [
      { name: "Tokyo", nameZh: "东京" },
      { name: "Osaka", nameZh: "大阪" },
      { name: "Kyoto", nameZh: "京都" },
      { name: "Yokohama", nameZh: "横滨" },
      { name: "Nagoya", nameZh: "名古屋" },
      { name: "Sapporo", nameZh: "札幌" },
      { name: "Fukuoka", nameZh: "福冈" },
      { name: "Kobe", nameZh: "神户" },
      { name: "Hiroshima", nameZh: "广岛" },
      { name: "Sendai", nameZh: "仙台" },
    ],
  },
  {
    name: "South Korea",
    nameZh: "韩国",
    cities: [
      { name: "Seoul", nameZh: "首尔" },
      { name: "Busan", nameZh: "釜山" },
      { name: "Incheon", nameZh: "仁川" },
      { name: "Daegu", nameZh: "大邱" },
      { name: "Daejeon", nameZh: "大田" },
      { name: "Gwangju", nameZh: "光州" },
    ],
  },
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
  {
    name: "Australia",
    nameZh: "澳大利亚",
    cities: [
      { name: "Sydney", nameZh: "悉尼" },
      { name: "Melbourne", nameZh: "墨尔本" },
      { name: "Brisbane", nameZh: "布里斯班" },
      { name: "Perth", nameZh: "珀斯" },
      { name: "Adelaide", nameZh: "阿德莱德" },
      { name: "Gold Coast", nameZh: "黄金海岸" },
    ],
  },
  {
    name: "New Zealand",
    nameZh: "新西兰",
    cities: [
      { name: "Auckland", nameZh: "奥克兰" },
      { name: "Wellington", nameZh: "惠灵顿" },
      { name: "Christchurch", nameZh: "基督城" },
    ],
  },
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
  // ── 南亚 ──
  {
    name: "India",
    nameZh: "印度",
    cities: [
      { name: "Mumbai", nameZh: "孟买" },
      { name: "New Delhi", nameZh: "新德里" },
      { name: "Bangalore", nameZh: "班加罗尔" },
      { name: "Chennai", nameZh: "金奈" },
      { name: "Kolkata", nameZh: "加尔各答" },
    ],
  },
  // ── 南美 ──
  {
    name: "Brazil",
    nameZh: "巴西",
    cities: [
      { name: "Sao Paulo", nameZh: "圣保罗" },
      { name: "Rio de Janeiro", nameZh: "里约热内卢" },
      { name: "Brasilia", nameZh: "巴西利亚" },
    ],
  },
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
  {
    name: "Russia",
    nameZh: "俄罗斯",
    cities: [
      { name: "Moscow", nameZh: "莫斯科" },
      { name: "Saint Petersburg", nameZh: "圣彼得堡" },
    ],
  },
  {
    name: "Turkey",
    nameZh: "土耳其",
    cities: [
      { name: "Istanbul", nameZh: "伊斯坦布尔" },
      { name: "Ankara", nameZh: "安卡拉" },
    ],
  },
]
