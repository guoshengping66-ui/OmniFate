"""
calculators/bazi_calculator.py
公历转干支八字 + 五行得分计算器
依赖: lunar-python (pip install lunar-python)
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional
from lunar_python import Lunar, Solar


# ─── 基础常量表 ──────────────────────────────────────────────────────────────

TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI   = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 天干 → 五行
TIANGAN_WUXING = {
    "甲": "木", "乙": "木",
    "丙": "火", "丁": "火",
    "戊": "土", "己": "土",
    "庚": "金", "辛": "金",
    "壬": "水", "癸": "水",
}

# 地支 → 主五行
DIZHI_WUXING = {
    "子": "水", "丑": "土", "寅": "木", "卯": "木",
    "辰": "土", "巳": "火", "午": "火", "未": "土",
    "申": "金", "酉": "金", "戌": "土", "亥": "水",
}

# 地支藏干 (主气, 中气, 余气)
DIZHI_CANGGAN = {
    "子": [("壬", 10)],
    "丑": [("己", 9), ("癸", 3), ("辛", 3)],
    "寅": [("甲", 7), ("丙", 7), ("戊", 1)],
    "卯": [("乙", 10)],
    "辰": [("戊", 7), ("乙", 3), ("癸", 3)],
    "巳": [("丙", 7), ("庚", 7), ("戊", 1)],
    "午": [("丁", 7), ("己", 3)],
    "未": [("己", 9), ("丁", 3), ("乙", 3)],
    "申": [("庚", 7), ("壬", 7), ("戊", 1)],
    "酉": [("辛", 10)],
    "戌": [("戊", 7), ("辛", 3), ("丁", 3)],
    "亥": [("壬", 7), ("甲", 3)],
}

# 时支对应表 (以子时起算, 2小时一个时辰)
HOUR_TO_DIZHI = [
    (0, 1,   "子"), (1, 3,   "丑"), (3, 5,   "寅"), (5, 7,   "卯"),
    (7, 9,   "辰"), (9, 11,  "巳"), (11, 13, "午"), (13, 15, "未"),
    (15, 17, "申"), (17, 19, "酉"), (19, 21, "戌"), (21, 24, "亥"),
]

# 日主 → 十神映射函数所需的阴阳属性
TIANGAN_YINYANG = {
    "甲": "阳", "乙": "阴", "丙": "阳", "丁": "阴", "戊": "阳",
    "己": "阴", "庚": "阳", "辛": "阴", "壬": "阳", "癸": "阴",
}

# 五行相生相克
WUXING_SHENG = {"木": "火", "火": "土", "土": "金", "金": "水", "水": "木"}
WUXING_KE    = {"木": "土", "火": "金", "土": "水", "金": "木", "水": "火"}

# ── 十二长生表 ────────────────────────────────────────────────────────────────
# 日主天干 → 每地支对应的长生阶段序号(0-11)
SHI_ER_STAGES = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"]
SHI_ER_CHANG_SHENG = {
    "甲": [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "乙": [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7],
    "丙": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1],
    "丁": [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10],
    "戊": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1],
    "己": [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10],
    "庚": [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4],
    "辛": [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    "壬": [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7],
    "癸": [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4],
}

# ── 神煞查表 ──────────────────────────────────────────────────────────────────
# 天乙贵人: 甲戊庚牛羊(丑未), 乙己鼠猴(申子), 丙丁猪鸡(亥酉), 辛劳虎马(寅午), 壬癸蛇兔(巳卯)
TIAN_YI_GUI_REN = {
    "甲": ["丑", "未"], "戊": ["丑", "未"], "庚": ["丑", "未"],
    "乙": ["子", "申"], "己": ["子", "申"],
    "丙": ["亥", "酉"], "丁": ["亥", "酉"],
    "辛": ["午", "寅"],
    "壬": ["巳", "卯"], "癸": ["巳", "卯"],
}

# 桃花(咸池): 以年支起, 寅午戌见卯, 巳酉丑见午, 申子辰见酉, 亥卯未见子
TAO_HUA = {"寅":"卯","午":"卯","戌":"卯","巳":"午","酉":"午","丑":"午","申":"酉","子":"酉","辰":"酉","亥":"子","卯":"子","未":"子"}

# 驿马: 寅午戌见申, 巳酉丑见亥, 申子辰见寅, 亥卯未见巳
YI_MA = {"寅":"申","午":"申","戌":"申","巳":"亥","酉":"亥","丑":"亥","申":"寅","子":"寅","辰":"寅","亥":"巳","卯":"巳","未":"巳"}

# 华盖: 寅午戌见戌, 巳酉丑见丑, 申子辰见辰, 亥卯未见未
HUA_GAI = {"寅":"戌","午":"戌","戌":"戌","巳":"丑","酉":"丑","丑":"丑","申":"辰","子":"辰","辰":"辰","亥":"未","卯":"未","未":"未"}

# 孤辰寡宿: 亥子丑见寅(孤)戌(寡), 寅卯辰见巳(孤)丑(寡), 巳午未见申(孤)辰(寡), 申酉戌见亥(孤)未(寡)
GU_CHEN_GUA_SU = {
    ("亥","子","丑"): ("寅","戌"),
    ("寅","卯","辰"): ("巳","丑"),
    ("巳","午","未"): ("申","辰"),
    ("申","酉","戌"): ("亥","未"),
}

# ── 纳音五行表 ────────────────────────────────────────────────────────────────
# 六十甲子纳音, key=天干地支组合
NAYIN_MAP = {
    "甲子":"海中金","乙丑":"海中金","丙寅":"炉中火","丁卯":"炉中火","戊辰":"大林木","己巳":"大林木",
    "庚午":"路旁土","辛未":"路旁土","壬申":"剑锋金","癸酉":"剑锋金","甲戌":"山头火","乙亥":"山头火",
    "丙子":"涧下水","丁丑":"涧下水","戊寅":"城头土","己卯":"城头土","庚辰":"白蜡金","辛巳":"白蜡金",
    "壬午":"杨柳木","癸未":"杨柳木","甲申":"泉中水","乙酉":"泉中水","丙戌":"屋上土","丁亥":"屋上土",
    "戊子":"霹雳火","己丑":"霹雳火","庚寅":"松柏木","辛卯":"松柏木","壬辰":"长流水","癸巳":"长流水",
    "甲午":"沙中金","乙未":"沙中金","丙申":"山下火","丁酉":"山下火","戊戌":"平地木","己亥":"平地木",
    "庚子":"壁上土","辛丑":"壁上土","壬寅":"金箔金","癸卯":"金箔金","甲辰":"覆灯火","乙巳":"覆灯火",
    "丙午":"天河水","丁未":"天河水","戊申":"大驿土","己酉":"大驿土","庚戌":"钗钏金","辛亥":"钗钏金",
    "壬子":"桑柘木","癸丑":"桑柘木","甲寅":"大溪水","乙卯":"大溪水","丙辰":"沙中土","丁巳":"沙中土",
    "戊午":"天上火","己未":"天上火","庚申":"石榴木","辛酉":"石榴木","壬戌":"大海水","癸亥":"大海水",
}


# ─── 数据类 ──────────────────────────────────────────────────────────────────

@dataclass
class Pillar:
    """一柱: 天干 + 地支"""
    tiangan: str
    dizhi: str

    @property
    def ganzhi(self) -> str:
        return self.tiangan + self.dizhi

    @property
    def tiangan_wuxing(self) -> str:
        return TIANGAN_WUXING[self.tiangan]

    @property
    def dizhi_wuxing(self) -> str:
        return DIZHI_WUXING[self.dizhi]


@dataclass
class BaziResult:
    year_pillar:  Pillar
    month_pillar: Pillar
    day_pillar:   Pillar
    hour_pillar:  Pillar

    # 五行得分
    wuxing_scores:    dict[str, float] = field(default_factory=dict)
    missing_elements: list[str]        = field(default_factory=list)
    strong_elements:  list[str]        = field(default_factory=list)

    # 日主信息
    day_master:         str = ""
    day_master_element: str = ""
    day_master_yinyang: str = ""

    # 格局
    pattern:     str = ""
    yong_shen:   str = ""   # 用神
    xi_shen:     str = ""   # 喜神
    ji_shen:     str = ""   # 忌神
    chou_shen:   str = ""   # 仇神

    # 十神
    shishen: dict[str, str] = field(default_factory=dict)

    # 新增: 神煞
    shensha: dict[str, list[str]] = field(default_factory=dict)

    # 新增: 十二长生(日主在月令的状态)
    shi_er_chang_sheng: str = ""

    # 新增: 纳音(年柱)
    nayin_year: str = ""

    # 新增: 大运列表
    da_yun: list[dict] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "year_gz":          self.year_pillar.ganzhi,
            "month_gz":         self.month_pillar.ganzhi,
            "day_gz":           self.day_pillar.ganzhi,
            "hour_gz":          self.hour_pillar.ganzhi,
            "wuxing_scores":    self.wuxing_scores,
            "missing_elements": self.missing_elements,
            "strong_elements":  self.strong_elements,
            "day_master":       self.day_master,
            "day_master_element": self.day_master_element,
            "day_master_yinyang": self.day_master_yinyang,
            "shishen":          self.shishen,
            "pattern":          self.pattern,
            "yong_shen":        self.yong_shen,
            "xi_shen":          self.xi_shen,
            "ji_shen":          self.ji_shen,
            "shensha":          self.shensha,
            "shi_er_chang_sheng": self.shi_er_chang_sheng,
            "nayin_year":       self.nayin_year,
            "da_yun":           self.da_yun,
        }

# ─── 主计算器类 ──────────────────────────────────────────────────────────────

class BaziCalculator:
    """
    公历 → 干支八字计算器
    核心流程:
      1. Solar → Lunar (lunar-python)
      2. 确定年/月/日柱干支
      3. 由出生时辰确定时柱
      4. 计算五行得分 (天干 + 地支藏干权重)
      5. 分析日主强弱, 初步判断用神
    """

    # ── 权重系数 (参照传统命理强度模型) ─────────────────────────────────────
    POSITION_WEIGHTS = {
        "year_tg":   1.0,   # 年干
        "year_dz":   1.5,   # 年支(含藏干)
        "month_tg":  2.0,   # 月干 (月令权重最重)
        "month_dz":  3.0,   # 月支
        "day_tg":    2.0,   # 日干 (日主本身, 不计入强弱统计, 单独处理)
        "day_dz":    2.0,   # 日支
        "hour_tg":   1.5,   # 时干
        "hour_dz":   1.5,   # 时支
    }

    def __init__(self, use_true_solar_time: bool = True):
        self.use_true_solar_time = use_true_solar_time

    # ── 公开接口 ─────────────────────────────────────────────────────────────

    def calculate(
        self,
        year: int,
        month: int,
        day: int,
        hour: int,
        minute: int = 0,
        longitude: Optional[float] = None,
        gender: str = "female",
    ) -> BaziResult:
        """
        主入口: 公历时间 → BaziResult
        longitude: 出生地经度, 用于真太阳时修正 (东正西负)
        gender: male/female, 用于大运排盘
        """
        adj_hour, adj_minute = self._adjust_solar_time(hour, minute, longitude)
        solar = Solar.fromYmdHms(year, month, day, adj_hour, adj_minute, 0)
        lunar = solar.getLunar()

        year_pillar  = self._year_pillar(lunar)
        month_pillar = self._month_pillar(lunar)
        day_pillar   = self._day_pillar(lunar)
        hour_pillar  = self._hour_pillar(adj_hour, day_pillar.tiangan)

        result = BaziResult(
            year_pillar=year_pillar,
            month_pillar=month_pillar,
            day_pillar=day_pillar,
            hour_pillar=hour_pillar,
        )

        result.day_master         = day_pillar.tiangan
        result.day_master_element = TIANGAN_WUXING[day_pillar.tiangan]
        result.day_master_yinyang = TIANGAN_YINYANG[day_pillar.tiangan]

        result.wuxing_scores    = self._calc_wuxing_scores(result)
        result.missing_elements = self._find_missing(result.wuxing_scores)
        result.strong_elements  = self._find_strong(result.wuxing_scores)
        result.shishen          = self._calc_shishen(result)
        result.shensha           = self._calc_shensha(result)
        result.shi_er_chang_sheng = self._calc_shi_er_chang_sheng(result)
        result.nayin_year        = self._calc_nayin(result)
        result.da_yun            = self._calc_da_yun(
            gender=gender,
            year_pillar=year_pillar,
            month_pillar=month_pillar,
            year=year, month=month, day=day,
        )

        self._analyze_pattern(result)
        return result

    # ── 柱位计算 ─────────────────────────────────────────────────────────────

    @staticmethod
    def _year_pillar(lunar) -> Pillar:
        gz = lunar.getYearInGanZhi()  # e.g. "甲子"
        return Pillar(tiangan=gz[0], dizhi=gz[1])

    @staticmethod
    def _month_pillar(lunar) -> Pillar:
        gz = lunar.getMonthInGanZhi()
        return Pillar(tiangan=gz[0], dizhi=gz[1])

    @staticmethod
    def _day_pillar(lunar) -> Pillar:
        gz = lunar.getDayInGanZhi()
        return Pillar(tiangan=gz[0], dizhi=gz[1])

    @staticmethod
    def _hour_pillar(hour: int, day_tg: str) -> Pillar:
        """
        时柱推算: 以日干起子时天干, 按五鼠遁年起月法类似规则
        五虎遁日起时: 甲己还加甲, 乙庚丙作初, 丙辛从戊起, 丁壬庚子居, 戊癸何方发, 壬子是真途
        """
        hour_dz = BaziCalculator._hour_to_dizhi(hour)

        # 日干序号 (0-9)
        day_tg_idx = TIANGAN.index(day_tg)
        # 五虎遁年起月规则 → 时柱天干起始 (甲/己→甲, 乙/庚→丙, 丙/辛→戊, 丁/壬→庚, 戊/癸→壬)
        start_tg_map = {0: 0, 1: 2, 2: 4, 3: 6, 4: 8}
        group = day_tg_idx % 5
        start_tg_idx = start_tg_map[group]

        hour_dz_idx = DIZHI.index(hour_dz)
        hour_tg_idx = (start_tg_idx + hour_dz_idx) % 10
        return Pillar(tiangan=TIANGAN[hour_tg_idx], dizhi=hour_dz)

    @staticmethod
    def _hour_to_dizhi(hour: int) -> str:
        for start, end, dz in HOUR_TO_DIZHI:
            if start <= hour < end:
                return dz
        return "子"

    # ── Transit pillar calculation (任意日期的流年/月/日柱) ───────────────────

    @staticmethod
    def calculate_transit_pillars(year: int, month: int, day: int) -> dict:
        """
        计算指定公历日期的流年柱、流月柱、流日柱。

        Args:
            year, month, day: 公历日期

        Returns:
            dict with keys:
              - year_pillar: {"tiangan": str, "dizhi": str, "ganzhi": str, "wuxing": str}
              - month_pillar: same format
              - day_pillar: same format
        """
        solar = Solar.fromYmd(year, month, day)
        lunar = solar.getLunar()

        yp = BaziCalculator._year_pillar(lunar)
        mp = BaziCalculator._month_pillar(lunar)
        dp = BaziCalculator._day_pillar(lunar)

        def _pillar_dict(p: Pillar) -> dict:
            return {
                "tiangan": p.tiangan,
                "dizhi": p.dizhi,
                "ganzhi": p.ganzhi,
                "tiangan_wuxing": TIANGAN_WUXING.get(p.tiangan, ""),
                "dizhi_wuxing": DIZHI_WUXING.get(p.dizhi, ""),
            }

        return {
            "year_pillar": _pillar_dict(yp),
            "month_pillar": _pillar_dict(mp),
            "day_pillar": _pillar_dict(dp),
        }

    @staticmethod
    def _adjust_solar_time(
        hour: int, minute: int, longitude: Optional[float]
    ) -> tuple[int, int]:
        """真太阳时修正: 以东经120度为基准, 每4分钟1度"""
        if longitude is None:
            return hour, minute
        diff_minutes = int((longitude - 120) * 4)
        total = hour * 60 + minute + diff_minutes
        total = max(0, min(total, 1439))
        return total // 60, total % 60

    # ── 神煞计算 ─────────────────────────────────────────────────────────────

    @staticmethod
    def _calc_shensha(r: BaziResult) -> dict[str, list[str]]:
        """按日干+年支计算主要神煞"""
        dm = r.day_master
        year_dz = r.year_pillar.dizhi
        month_dz = r.month_pillar.dizhi
        day_dz = r.day_pillar.dizhi
        hour_dz = r.hour_pillar.dizhi
        result = {}

        # 天乙贵人 (日干起)
        guiren = TIAN_YI_GUI_REN.get(dm, [])
        if guiren:
            found = [dz for dz in guiren if dz in [year_dz, month_dz, day_dz, hour_dz]]
            result["天乙贵人"] = found

        # 桃花 (年支起)
        tao = TAO_HUA.get(year_dz, "")
        if tao:
            found = [dz for dz in [year_dz, month_dz, day_dz, hour_dz] if dz == tao]
            if found:
                result["桃花"] = found

        # 驿马 (年支起)
        yi = YI_MA.get(year_dz, "")
        if yi:
            found = [dz for dz in [year_dz, month_dz, day_dz, hour_dz] if dz == yi]
            if found:
                result["驿马"] = found

        # 华盖 (年支起)
        hua = HUA_GAI.get(year_dz, "")
        if hua:
            found = [dz for dz in [year_dz, month_dz, day_dz, hour_dz] if dz == hua]
            if found:
                result["华盖"] = found

        # 孤辰寡宿 (年支三会局起)
        for trio, (gu, gua) in GU_CHEN_GUA_SU.items():
            if year_dz in trio:
                gc_found = [dz for dz in [year_dz, month_dz, day_dz, hour_dz] if dz == gu]
                gs_found = [dz for dz in [year_dz, month_dz, day_dz, hour_dz] if dz == gua]
                if gc_found:
                    result["孤辰"] = gc_found
                if gs_found:
                    result["寡宿"] = gs_found
                break

        return result

    # ── 十二长生 ─────────────────────────────────────────────────────────────

    @staticmethod
    def _calc_shi_er_chang_sheng(r: BaziResult) -> str:
        """日主在月令的十二长生状态"""
        dm = r.day_master
        month_dz = r.month_pillar.dizhi
        month_dz_idx = DIZHI.index(month_dz)
        stages = SHI_ER_CHANG_SHENG.get(dm, [])
        if not stages:
            return ""
        stage_idx = stages[month_dz_idx]
        return SHI_ER_STAGES[stage_idx]

    # ── 纳音 ─────────────────────────────────────────────────────────────────

    @staticmethod
    def _calc_nayin(r: BaziResult) -> str:
        """年柱纳音五行"""
        return NAYIN_MAP.get(r.year_pillar.ganzhi, "")

    # ── 大运排盘 ────────────────────────────────────────────────────────────

    @staticmethod
    def _calc_da_yun(
        gender: str,
        year_pillar: Pillar,
        month_pillar: Pillar,
        year: int, month: int, day: int,
    ) -> list[dict]:
        """
        简版大运排法:
        - 阳男/阴女 → 顺排, 阴男/阳女 → 逆排
        - 起运岁数: 按出生到下一个节气(顺排)或上一个节气(逆排)的天数/3
        - 输出前6步大运
        """
        year_tg = year_pillar.tiangan
        is_yang_year = TIANGAN_YINYANG.get(year_tg, "阳") == "阳"
        is_male = gender == "male"

        # 顺排: 阳男 or 阴女
        shun_pai = (is_yang_year and is_male) or (not is_yang_year and not is_male)

        # 月柱的天干和地支序号
        month_tg_idx = TIANGAN.index(month_pillar.tiangan)
        month_dz_idx = DIZHI.index(month_pillar.dizhi)

        # 起运岁数: 简化版本, 使用默认3岁起运
        # (精确计算需要 lunar-python 的节气时间)
        start_age = 3

        da_yun_list = []
        for step in range(6):
            if shun_pai:
                tg_i = (month_tg_idx + step + 1) % 10
                dz_i = (month_dz_idx + step + 1) % 12
            else:
                tg_i = (month_tg_idx - step - 1) % 10
                dz_i = (month_dz_idx - step - 1) % 12
            gan = TIANGAN[tg_i]
            zhi = DIZHI[dz_i]
            start = start_age + step * 10
            end = start + 10
            nayin = NAYIN_MAP.get(gan + zhi, "")
            da_yun_list.append({
                "gan_zhi": gan + zhi,
                "start_age": start,
                "end_age": end,
                "nayin": nayin,
            })
        return da_yun_list

    # ── 五行得分 ─────────────────────────────────────────────────────────────

    def _calc_wuxing_scores(self, r: BaziResult) -> dict[str, float]:
        scores: dict[str, float] = {"金": 0, "木": 0, "水": 0, "火": 0, "土": 0}
        pillars = [
            ("year",  r.year_pillar),
            ("month", r.month_pillar),
            ("day",   r.day_pillar),
            ("hour",  r.hour_pillar),
        ]
        for pos, pillar in pillars:
            # 天干得分 (日主天干仅计入整体得分, 不影响强弱判断的分子)
            tg_key = f"{pos}_tg"
            tg_w   = self.POSITION_WEIGHTS.get(tg_key, 1.0)
            wx = TIANGAN_WUXING[pillar.tiangan]
            scores[wx] += tg_w

            # 地支藏干得分
            dz_key   = f"{pos}_dz"
            dz_total = sum(pts for _, pts in DIZHI_CANGGAN[pillar.dizhi])
            for cg, pts in DIZHI_CANGGAN[pillar.dizhi]:
                ratio  = pts / dz_total
                dz_w   = self.POSITION_WEIGHTS.get(dz_key, 1.5)
                scores[TIANGAN_WUXING[cg]] += round(ratio * dz_w, 2)

        return {k: round(v, 2) for k, v in scores.items()}

    @staticmethod
    def _find_missing(scores: dict[str, float]) -> list[str]:
        return [wx for wx, s in scores.items() if s < 0.5]

    @staticmethod
    def _find_strong(scores: dict[str, float]) -> list[str]:
        avg = sum(scores.values()) / 5
        return [wx for wx, s in scores.items() if s > avg * 1.6]

    # ── 十神计算 ─────────────────────────────────────────────────────────────

    @staticmethod
    def _calc_shishen(r: BaziResult) -> dict[str, str]:
        """
        以日主为基准, 计算其他七个字(三柱六字)的十神
        十神 = 同我/生我/我生/克我/我克 × 阴阳同异
        """
        dm       = r.day_master
        dm_wx    = TIANGAN_WUXING[dm]
        dm_yy    = TIANGAN_YINYANG[dm]
        result   = {}

        targets = [
            ("年干", r.year_pillar.tiangan),
            ("月干", r.month_pillar.tiangan),
            ("时干", r.hour_pillar.tiangan),
            ("年支藏主气", list(DIZHI_CANGGAN[r.year_pillar.dizhi])[0][0]),
            ("月支藏主气", list(DIZHI_CANGGAN[r.month_pillar.dizhi])[0][0]),
            ("日支藏主气", list(DIZHI_CANGGAN[r.day_pillar.dizhi])[0][0]),
            ("时支藏主气", list(DIZHI_CANGGAN[r.hour_pillar.dizhi])[0][0]),
        ]
        for label, tg in targets:
            result[label] = BaziCalculator._shishen_of(dm, dm_wx, dm_yy, tg)
        return result

    @staticmethod
    def _shishen_of(dm: str, dm_wx: str, dm_yy: str, target_tg: str) -> str:
        t_wx = TIANGAN_WUXING[target_tg]
        t_yy = TIANGAN_YINYANG[target_tg]
        same_yy = (dm_yy == t_yy)

        if t_wx == dm_wx:
            return "比肩" if same_yy else "劫财"
        if WUXING_SHENG[t_wx] == dm_wx:   # t生dm → 印
            return "正印" if same_yy else "偏印"
        if WUXING_SHENG[dm_wx] == t_wx:   # dm生t → 食伤
            return "食神" if same_yy else "伤官"
        if WUXING_KE[dm_wx] == t_wx:      # dm克t → 财
            return "偏财" if same_yy else "正财"
        if WUXING_KE[t_wx] == dm_wx:      # t克dm → 官杀
            return "七杀" if same_yy else "正官"
        return "未知"

    # ── 格局判断 (简化版) ────────────────────────────────────────────────────

    def _analyze_pattern(self, r: BaziResult) -> None:
        """
        简化格局判断逻辑:
        - 以月令为核心, 判断日主旺衰
        - 用神取法: 身强→官杀/财星制化, 身弱→印星/比劫帮扶
        """
        dm_wx = r.day_master_element
        month_dz_wx = DIZHI_WUXING[r.month_pillar.dizhi]

        # 月令是否助日主
        is_month_helping = (
            month_dz_wx == dm_wx                          # 同五行
            or WUXING_SHENG[month_dz_wx] == dm_wx         # 月令生日主
        )

        # 简易强弱计分
        helper_score = r.wuxing_scores.get(dm_wx, 0)
        # 印星五行
        yin_wx = next(k for k, v in WUXING_SHENG.items() if v == dm_wx)
        helper_score += r.wuxing_scores.get(yin_wx, 0)
        total_score = sum(r.wuxing_scores.values()) - r.wuxing_scores.get(dm_wx, 0)

        ratio = helper_score / max(total_score, 0.1)

        if ratio >= 0.55 or (is_month_helping and ratio >= 0.45):
            r.pattern  = "身强"
            # 用神取泄耗之物: 财星/食伤
            sheng_wx   = WUXING_SHENG[dm_wx]               # 日主所生 (食伤)
            ke_wx      = WUXING_KE[dm_wx]                   # 日主所克 (财)
            r.yong_shen = sheng_wx
            r.xi_shen   = ke_wx
            r.ji_shen   = yin_wx
            r.chou_shen = dm_wx
        elif ratio <= 0.35 or (not is_month_helping and ratio <= 0.45):
            r.pattern  = "身弱"
            r.yong_shen = yin_wx                             # 印星生身
            r.xi_shen   = dm_wx                              # 比劫帮身
            r.ji_shen   = WUXING_KE[dm_wx]                  # 财星耗身
            r.chou_shen = WUXING_SHENG[dm_wx]               # 食伤泄身
        else:
            r.pattern  = "中和"
            r.yong_shen = "需结合大运细论"

    # ── 八字合婚 ─────────────────────────────────────────────────────────────

    @staticmethod
    def calculate_compatibility(bazi_a, bazi_b) -> dict:
        """
        八字合婚分析：
        1. 日主互动（A日主 vs B日主 的五行生克关系）
        2. 用神互补（A的用神是否是B的喜神）
        3. 日支互动（夫妻宫的五行生克）
        4. 五行互补度
        5. 综合评分（0-100）

        Args:
            bazi_a, bazi_b: BaziResult objects or dicts from to_dict()

        返回：结构化合婚数据
        """
        # Normalize: accept both BaziResult and dict
        def _get(obj, key, default=""):
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)

        # 1. 日主互动
        dm_a = _get(bazi_a, "day_master_element", "")
        dm_b = _get(bazi_b, "day_master_element", "")

        # A生B / B生A / A克B / B克A / 同五行
        dm_interaction = ""
        dm_detail = ""
        if dm_a == dm_b:
            dm_interaction = "比和"
            dm_detail = f"{dm_a}与{dm_b}同五行，性格相似，容易理解对方"
        elif WUXING_SHENG.get(dm_a) == dm_b:
            dm_interaction = "A生B"
            dm_detail = f"{dm_a}生{dm_b}，A对B有天然的付出与滋养倾向"
        elif WUXING_SHENG.get(dm_b) == dm_a:
            dm_interaction = "B生A"
            dm_detail = f"{dm_b}生{dm_a}，B对A有天然的付出与滋养倾向"
        elif WUXING_KE.get(dm_a) == dm_b:
            dm_interaction = "A克B"
            dm_detail = f"{dm_a}克{dm_b}，A对B有约束力，需注意相处方式"
        elif WUXING_KE.get(dm_b) == dm_a:
            dm_interaction = "B克A"
            dm_detail = f"{dm_b}克{dm_a}，B对A有约束力，需注意相处方式"
        else:
            dm_interaction = "间接关系"
            dm_detail = f"{dm_a}与{dm_b}为间接生克关系，需通过中间元素理解互动模式"

        # 2. 用神互补
        yong_a = _get(bazi_a, "yong_shen", "")
        yong_b = _get(bazi_b, "yong_shen", "")
        xi_a = _get(bazi_a, "xi_shen", "")
        xi_b = _get(bazi_b, "xi_shen", "")

        complement_score = 0
        complement_detail = ""

        # A的用神是否是B的喜神/用神
        a_helps_b = (yong_a == xi_b or yong_a == yong_b or
                     WUXING_SHENG.get(yong_a) == xi_b)
        b_helps_a = (yong_b == xi_a or yong_b == yong_a or
                     WUXING_SHENG.get(yong_b) == xi_a)

        if a_helps_b and b_helps_a:
            complement_score = 30
            complement_detail = "双方用神高度互补，彼此是对方的贵人"
        elif a_helps_b:
            complement_score = 20
            complement_detail = f"A的用神{yong_a}能助益B的喜神{xi_b}，A对B有助力"
        elif b_helps_a:
            complement_score = 20
            complement_detail = f"B的用神{yong_b}能助益A的喜神{xi_a}，B对A有助力"
        else:
            complement_score = 10
            complement_detail = "双方用神无明显互补，需通过后天努力磨合"

        # 3. 日支互动（夫妻宫）
        # day_gz format: "甲子" → last char is dizhi
        day_gz_a = _get(bazi_a, "day_gz", "")
        day_gz_b = _get(bazi_b, "day_gz", "")
        day_dz_a = day_gz_a[-1] if day_gz_a else ""
        day_dz_b = day_gz_b[-1] if day_gz_b else ""
        day_wx_a = DIZHI_WUXING.get(day_dz_a, "")
        day_wx_b = DIZHI_WUXING.get(day_dz_b, "")

        if day_wx_a == day_wx_b:
            day_interaction = "日支比和"
            day_detail = f"日支同为{day_wx_a}，夫妻宫和谐，相处融洽"
            day_score = 15
        elif WUXING_SHENG.get(day_wx_a) == day_wx_b:
            day_interaction = "日支相生(A→B)"
            day_detail = f"{day_wx_a}生{day_wx_b}，A对B有付出倾向"
            day_score = 12
        elif WUXING_SHENG.get(day_wx_b) == day_wx_a:
            day_interaction = "日支相生(B→A)"
            day_detail = f"{day_wx_b}生{day_wx_a}，B对A有付出倾向"
            day_score = 12
        elif WUXING_KE.get(day_wx_a) == day_wx_b:
            day_interaction = "日支相克(A→B)"
            day_detail = f"{day_wx_a}克{day_wx_b}，夫妻宫有摩擦，需注意沟通"
            day_score = 5
        elif WUXING_KE.get(day_wx_b) == day_wx_a:
            day_interaction = "日支相克(B→A)"
            day_detail = f"{day_wx_b}克{day_wx_a}，夫妻宫有摩擦，需注意沟通"
            day_score = 5
        else:
            day_interaction = "日支间接关系"
            day_detail = f"{day_wx_a}与{day_wx_b}为间接关系"
            day_score = 8

        # 4. 五行互补度
        scores_a = _get(bazi_a, "wuxing_scores", {})
        scores_b = _get(bazi_b, "wuxing_scores", {})
        elements = ["金", "木", "水", "火", "土"]
        missing_a = set(_get(bazi_a, "missing_elements", []))
        missing_b = set(_get(bazi_b, "missing_elements", []))

        # A缺的B有 / B缺的A有
        supply_count = 0
        supply_details = []
        for elem in elements:
            a_has = scores_a.get(elem, 0) > 1.0
            b_has = scores_b.get(elem, 0) > 1.0
            a_lacks = elem in missing_a
            b_lacks = elem in missing_b
            if a_lacks and b_has:
                supply_count += 1
                supply_details.append(f"B的{elem}能补A之缺")
            elif b_lacks and a_has:
                supply_count += 1
                supply_details.append(f"A的{elem}能补B之缺")

        supply_score = min(supply_count * 5, 25)
        supply_detail = "；".join(supply_details) if supply_details else "五行无明显互补"

        # 5. 综合评分
        # 基础分 30 + 日主互动 15 + 用神互补 complement_score + 日支互动 day_score + 五行互补 supply_score
        total_score = min(30 + 15 + complement_score + day_score + supply_score, 100)

        # 等级判定
        if total_score >= 85:
            level = "天作之合"
            level_desc = "八字高度契合，天生一对"
        elif total_score >= 70:
            level = "上等婚配"
            level_desc = "八字互补性强，相处融洽"
        elif total_score >= 55:
            level = "中等婚配"
            level_desc = "八字有一定互补，需注意磨合"
        elif total_score >= 40:
            level = "下等婚配"
            level_desc = "八字互补性弱，需较多包容与理解"
        else:
            level = "需谨慎"
            level_desc = "八字冲克较多，需慎重考虑"

        return {
            "score": total_score,
            "level": level,
            "level_desc": level_desc,
            "day_master_interaction": dm_interaction,
            "day_master_detail": dm_detail,
            "yong_shen_complement": complement_detail,
            "day_pillar_interaction": day_interaction,
            "day_pillar_detail": day_detail,
            "wuxing_supply": supply_detail,
            "detail": (
                f"日主互动：{dm_detail}\n"
                f"用神互补：{complement_detail}\n"
                f"夫妻宫：{day_detail}\n"
                f"五行互补：{supply_detail}"
            ),
        }


# ─── 辅助工具函数 ────────────────────────────────────────────────────────────

def get_current_year_ganzhi() -> str:
    """返回当前公历年份对应的干支年"""
    import datetime
    year = datetime.date.today().year
    tg_idx = (year - 4) % 10
    dz_idx = (year - 4) % 12
    return TIANGAN[tg_idx] + DIZHI[dz_idx]


def wuxing_to_english(wx: str) -> str:
    mapping = {"金": "metal", "木": "wood", "水": "water", "火": "fire", "土": "earth"}
    return mapping.get(wx, wx)
