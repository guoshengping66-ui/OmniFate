"""
calculators/ziwei_calculator.py
紫微斗数排盘 — 关键锚点计算器
基于农历生月/生时计算命宫、十二宫、紫微星落宫、四化等核心数据
依赖: lunar-python (农历转换)
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from types import MappingProxyType
from typing import Mapping, Optional
from lunar_python import Lunar, Solar


# ─── 常量表 ─────────────────────────────────────────────────────────────────

# 十二宫名称（按命宫逆排顺序）
TWELVE_PALACES = ["命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄",
                   "迁移", "交友", "官禄", "田宅", "福德", "父母"]

# 地支顺序
DIZHI_ORDER = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"]

# 地支 → 数字 (寅=0, ..., 丑=11)
DIZHI_IDX = {d: i for i, d in enumerate(DIZHI_ORDER)}

# 纳音五行局表 — 由命宫天干+地支确定
# key=(天干, 地支), value=五行局名
NAYIN_JUDGE_TABLE = {
    ("甲","子"):"金四局",("乙","丑"):"金四局",("丙","寅"):"火六局",("丁","卯"):"火六局",
    ("戊","辰"):"木三局",("己","巳"):"木三局",("庚","午"):"土五局",("辛","未"):"土五局",
    ("壬","申"):"金四局",("癸","酉"):"金四局",("甲","戌"):"火六局",("乙","亥"):"火六局",
    ("丙","子"):"水二局",("丁","丑"):"水二局",("戊","寅"):"土五局",("己","卯"):"土五局",
    ("庚","辰"):"金四局",("辛","巳"):"金四局",("壬","午"):"木三局",("癸","未"):"木三局",
    ("甲","申"):"水二局",("乙","酉"):"水二局",("丙","戌"):"土五局",("丁","亥"):"土五局",
    ("戊","子"):"火六局",("己","丑"):"火六局",("庚","寅"):"木三局",("辛","卯"):"木三局",
    ("壬","辰"):"水二局",("癸","巳"):"水二局",("甲","午"):"金四局",("乙","未"):"金四局",
    ("丙","申"):"火六局",("丁","酉"):"火六局",("戊","戌"):"木三局",("己","亥"):"木三局",
    ("庚","子"):"土五局",("辛","丑"):"土五局",("壬","寅"):"金四局",("癸","卯"):"金四局",
    ("甲","辰"):"火六局",("乙","巳"):"火六局",("丙","午"):"水二局",("丁","未"):"水二局",
    ("戊","申"):"土五局",("己","酉"):"土五局",("庚","戌"):"金四局",("辛","亥"):"金四局",
    ("壬","子"):"木三局",("癸","丑"):"木三局",
}

# 五行局数
WUXING_JU_NUMBER = {
    "水二局": 2, "木三局": 3, "金四局": 4, "土五局": 5, "火六局": 6,
}

# 14主星完整列表
FOURTEEN_STARS = [
    "紫微", "天机", "太阳", "武曲", "天同", "廉贞",
    "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军",
]

# 紫微星系排列表 (从紫微→天机→...→破军)
# 每个元素 = (星名, 相对紫微的偏移宫数)
ZIWEI_GROUP = [
    ("紫微", 0), ("天机", -1), ("太阳", 3), ("武曲", 4),
    ("天同", 7), ("廉贞", 10),
]

# 天府星系排列表 (天府位置由紫微对宫推导: 紫微在寅→天府在辰, 偏移+2)
TIANFU_GROUP = [
    ("天府", 0), ("太阴", 1), ("贪狼", 2), ("巨门", 3),
    ("天相", 4), ("天梁", 5), ("七杀", 6), ("破军", 10),
]

# 生年天干 → 四化星
SI_HUA_MAP = {
    "甲": {"化禄":"廉贞", "化权":"破军", "化科":"武曲", "化忌":"太阳"},
    "乙": {"化禄":"天机", "化权":"天梁", "化科":"紫微", "化忌":"太阴"},
    "丙": {"化禄":"天同", "化权":"天机", "化科":"文昌", "化忌":"廉贞"},
    "丁": {"化禄":"太阴", "化权":"天同", "化科":"天机", "化忌":"巨门"},
    "戊": {"化禄":"贪狼", "化权":"太阴", "化科":"右弼", "化忌":"天机"},
    "己": {"化禄":"武曲", "化权":"贪狼", "化科":"天梁", "化忌":"文曲"},
    "庚": {"化禄":"太阳", "化权":"武曲", "化科":"太阴", "化忌":"天同"},
    "辛": {"化禄":"巨门", "化权":"太阳", "化科":"文曲", "化忌":"文昌"},
    "壬": {"化禄":"天梁", "化权":"紫微", "化科":"左辅", "化忌":"武曲"},
    "癸": {"化禄":"破军", "化权":"巨门", "化科":"太阴", "化忌":"贪狼"},
}

# 14主星属性
STAR_ATTRIBUTES = {
    "紫微": "帝星·尊贵·领导", "天机": "智谋·变动·策划",
    "太阳": "光明·热情·男贵", "武曲": "财富·刚毅·决断",
    "天同": "享福·温和·协调", "廉贞": "才华·复杂·极端",
    "天府": "财库·稳重·包容", "太阴": "阴柔·细腻·女贵",
    "贪狼": "欲望·交际·多才", "巨门": "暗昧·口才·是非",
    "天相": "辅佐·公正·服务", "天梁": "长寿·老成·庇荫",
    "七杀": "权威·刚烈·开拓", "破军": "破旧·开创·变动",
}


@dataclass(frozen=True)
class ZiweiAnnualMonthlyTransit:
    year_ganzhi: str
    month_ganzhi: str
    annual_ming_gong: str
    monthly_ming_gong: str
    annual_transformations: Mapping[str, str]
    transformation_palaces: Mapping[str, str]

    def __post_init__(self):
        object.__setattr__(
            self, "annual_transformations",
            MappingProxyType(dict(self.annual_transformations)),
        )
        object.__setattr__(
            self, "transformation_palaces",
            MappingProxyType(dict(self.transformation_palaces)),
        )


@dataclass
class ZiweiResult:
    """紫微斗数关键锚点计算结果"""
    ming_gong_dizhi: str           # 命宫地支
    shen_gong_dizhi: str           # 身宫地支
    twelve_palaces: dict[str, str] # 十二宫：{宫名: 地支}
    wu_xing_ju: str                # 五行局名
    wu_xing_ju_num: int            # 五行局数
    ziwei_gong_dizhi: str          # 紫微星落宫地支
    ziwei_gong_name: str           # 紫微星落宫名
    main_star_positions: dict[str, str]  # 14主星：{星名: 宫名}
    si_hua: dict[str, str]         # 四化：{化禄/权/科/忌: 星名}
    ming_gong_main_stars: list[str]      # 命宫主星

    def to_dict(self) -> dict:
        return {
            "ming_gong_dizhi": self.ming_gong_dizhi,
            "shen_gong_dizhi": self.shen_gong_dizhi,
            "twelve_palaces": self.twelve_palaces,
            "wu_xing_ju": self.wu_xing_ju,
            "wu_xing_ju_num": self.wu_xing_ju_num,
            "ziwei_gong_dizhi": self.ziwei_gong_dizhi,
            "ziwei_gong_name": self.ziwei_gong_name,
            "main_star_positions": self.main_star_positions,
            "si_hua": self.si_hua,
            "ming_gong_main_stars": self.ming_gong_main_stars,
        }


class ZiweiCalculator:
    """紫微斗数排盘计算器"""

    def calculate(self, year: int, month: int, day: int, hour: int,
                  gender: str = "female") -> ZiweiResult:
        """
        计算紫微斗数关键锚点。
        Args:
            year, month, day, hour: 公历出生时间
            gender: 性别 (用于阴阳顺逆排盘, 暂不深究)
        """
        solar = Solar.fromYmd(year, month, day)
        lunar = solar.getLunar()

        # 农历月日时
        lunar_month = lunar.getMonth()
        lunar_day = lunar.getDay()
        lunar_hour_ganzhi = lunar.getTimeInGanZhi()  # 时柱干支
        lunar_hour_gan = lunar_hour_ganzhi[0] if lunar_hour_ganzhi else "甲"
        hour_dizhi = self._hour_to_dizhi(hour)
        year_gan = lunar.getYearInGanZhi()[0] if lunar.getYearInGanZhi() else "甲"

        # 1. 定命宫 & 身宫
        ming_gong_dizhi = self._calc_ming_gong(lunar_month, hour_dizhi)
        shen_gong_dizhi = self._calc_shen_gong(lunar_month, hour_dizhi)

        # 2. 逆排十二宫
        twelve_palaces = self._build_twelve_palaces(ming_gong_dizhi)

        # 3. 定五行局 (需要命宫天干 — 简化: 用年干+命宫支查纳音表)
        ming_gong_gan = self._get_ming_gong_gan(year_gan, ming_gong_dizhi)
        wu_xing_ju = NAYIN_JUDGE_TABLE.get(
            (ming_gong_gan, ming_gong_dizhi), "木三局"
        )
        ju_num = WUXING_JU_NUMBER.get(wu_xing_ju, 3)

        # 4. 定紫微星落宫
        ziwei_dizhi = self._calc_ziwei_star(ju_num, lunar_day, ming_gong_dizhi)
        ziwei_gong_name = twelve_palaces.get(ziwei_dizhi, "命宫")
        ziwei_dizhi_idx = DIZHI_IDX.get(ziwei_dizhi, 0)

        # 5. 14主星落宫
        main_stars = self._calc_main_stars(ziwei_dizhi_idx, twelve_palaces)

        # 6. 四化
        si_hua = SI_HUA_MAP.get(year_gan, SI_HUA_MAP["甲"])

        # 7. 命宫主星
        ming_gong_main = [
            star for star, palace in main_stars.items()
            if palace == "命宫"
        ]

        return ZiweiResult(
            ming_gong_dizhi=ming_gong_dizhi,
            shen_gong_dizhi=shen_gong_dizhi,
            twelve_palaces=twelve_palaces,
            wu_xing_ju=wu_xing_ju,
            wu_xing_ju_num=ju_num,
            ziwei_gong_dizhi=ziwei_dizhi,
            ziwei_gong_name=ziwei_gong_name,
            main_star_positions=main_stars,
            si_hua=si_hua,
            ming_gong_main_stars=ming_gong_main,
        )

    def _hour_to_dizhi(self, hour: int) -> str:
        return ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"][
            ((hour + 1) // 2) % 12
        ]

    def _calc_ming_gong(self, lunar_month: int, hour_dizhi: str) -> str:
        """定命宫: 从寅起正月, 逆数至生月; 再从该位起子时, 逆数至生时"""
        # 生月地支: 正月=寅, 逆数
        month_dizhi = DIZHI_ORDER[(-(lunar_month - 1)) % 12]
        # 从生月地支起子时, 逆数至生时
        month_idx = DIZHI_IDX[month_dizhi]
        hour_idx = DIZHI_IDX.get(hour_dizhi, 0)
        # 子时数 = 0, 丑=1, ..., 从month位置逆数hour_num位
        hour_num = DIZHI_IDX.get(hour_dizhi, 0)
        ming_idx = (month_idx - hour_num) % 12
        return DIZHI_ORDER[ming_idx]

    def _calc_shen_gong(self, lunar_month: int, hour_dizhi: str) -> str:
        """定身宫: 从寅起正月, 顺数至生月; 再从该位起子时, 顺数至生时"""
        month_dizhi = DIZHI_ORDER[(lunar_month - 1) % 12]
        month_idx = DIZHI_IDX[month_dizhi]
        hour_num = DIZHI_IDX.get(hour_dizhi, 0)
        shen_idx = (month_idx + hour_num) % 12
        return DIZHI_ORDER[shen_idx]

    def _build_twelve_palaces(self, ming_gong_dizhi: str) -> dict[str, str]:
        """从命宫逆排十二宫"""
        ming_idx = DIZHI_IDX.get(ming_gong_dizhi, 0)
        palaces = {}
        for i, name in enumerate(TWELVE_PALACES):
            # 逆排: 命宫→兄弟(下一地支逆1位)→夫妻...
            # 实际上紫微排盘是逆时针排十二宫
            idx = (ming_idx - i) % 12
            palaces[DIZHI_ORDER[idx]] = name
        return palaces

    def _get_ming_gong_gan(self, year_gan: str, ming_gong_dizhi: str) -> str:
        """根据生年天干和命宫地支推算命宫天干 (简化五虎遁)"""
        # 五虎遁: 甲己之年丙作首, 乙庚之岁戊为头...
        gan_start = {"甲":"丙","己":"丙","乙":"戊","庚":"戊",
                      "丙":"庚","辛":"庚","丁":"壬","壬":"壬",
                      "戊":"甲","癸":"甲"}
        start = gan_start.get(year_gan, "甲")
        start_idx = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"].index(start)
        dizhi_idx = DIZHI_IDX.get(ming_gong_dizhi, 0)
        gan_idx = (start_idx + dizhi_idx) % 10
        return ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"][gan_idx]

    def _calc_ziwei_star(self, ju_num: int, lunar_day: int,
                         ming_gong_dizhi: str) -> str:
        """
        定紫微星落宫: 五行局数 + 农历生日 → 紫微星位置
        简化查表: 除数为局数, 商+余数定位置
        """
        # 简化算法: 紫微星位置 = 寅起数 (商+余数调整)
        quotient = lunar_day // ju_num
        remainder = lunar_day % ju_num

        # 如果整除, 紫微位置 = 商数 (从寅起)
        if remainder == 0:
            offset = quotient - 1
        else:
            # 奇数余数 → 商+余; 偶数余数 → 直接余数
            if remainder % 2 == 1:
                offset = quotient + remainder - 1
            else:
                offset = remainder - 1

        ming_idx = DIZHI_IDX.get(ming_gong_dizhi, 0)
        ziwei_idx = (offset) % 12
        return DIZHI_ORDER[ziwei_idx]

    def _calc_main_stars(self, ziwei_idx: int,
                         palaces: dict[str, str]) -> dict[str, str]:
        """从紫微星位置推算14主星落宫"""
        stars = {}

        # 紫微星系
        for star_name, offset in ZIWEI_GROUP:
            idx = (ziwei_idx + offset) % 12
            dizhi = DIZHI_ORDER[idx]
            palace = palaces.get(dizhi, "迁移")
            stars[star_name] = palace

        # 天府星系: 天府 = 紫微对宫 + 2 (寅→辰模式)
        tianfu_idx = (ziwei_idx + 4) % 12  # 紫微→天府: +4
        for star_name, offset in TIANFU_GROUP:
            idx = (tianfu_idx + offset) % 12
            dizhi = DIZHI_ORDER[idx]
            palace = palaces.get(dizhi, "迁移")
            stars[star_name] = palace

        return stars


# ─── 便捷函数 ─────────────────────────────────────────────────────────────────

def calculate_ziwei(year: int, month: int, day: int, hour: int,
                    gender: str = "female") -> ZiweiResult:
    """便捷函数: 计算紫微斗数排盘锚点"""
    calc = ZiweiCalculator()
    return calc.calculate(year, month, day, hour, gender)


def calculate_annual_monthly_transit(
    natal_raw: dict, target_date: date
) -> ZiweiAnnualMonthlyTransit | None:
    natal_ming = natal_raw.get("ming_gong_dizhi")
    main_star_positions = natal_raw.get("main_star_positions")
    if natal_ming not in DIZHI_IDX or not isinstance(main_star_positions, dict) or not main_star_positions:
        return None

    lunar = Solar.fromYmd(target_date.year, target_date.month, target_date.day).getLunar()
    year_ganzhi = lunar.getYearInGanZhi()
    month_ganzhi = lunar.getMonthInGanZhi()
    annual_transformations = dict(SI_HUA_MAP[year_ganzhi[0]])
    transformation_palaces = {
        star: main_star_positions[star]
        for star in annual_transformations.values()
        if star in main_star_positions
    }

    annual_ming_gong = DIZHI_ORDER[
        (DIZHI_IDX[natal_ming] + DIZHI_IDX[year_ganzhi[1]]) % 12
    ]
    monthly_ming_gong = DIZHI_ORDER[
        (DIZHI_IDX[annual_ming_gong] + DIZHI_IDX[month_ganzhi[1]]) % 12
    ]
    return ZiweiAnnualMonthlyTransit(
        year_ganzhi=year_ganzhi,
        month_ganzhi=month_ganzhi,
        annual_ming_gong=annual_ming_gong,
        monthly_ming_gong=monthly_ming_gong,
        annual_transformations=annual_transformations,
        transformation_palaces=transformation_palaces,
    )
