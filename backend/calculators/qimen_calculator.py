"""
calculators/qimen_calculator.py
奇门遁甲排盘 — 关键锚点计算器
基于出生时辰计算遁局、值符、值使、八门方位等核心数据
依赖: lunar-python (节气数据)
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional
from lunar_python import Lunar, Solar


# ─── 常量表 ─────────────────────────────────────────────────────────────────

# 节气 → 遁局映射 (阳遁1-9, 阴遁1-9)
# 阳遁: 冬至→芒种 (一七四/二八五/三九六 三元)
# 阴遁: 夏至→大雪
# 简化：按节气映射到宫数，三元规律应用于 LLM 提示
JIEQI_DUNJU = {
    # 阳遁 (冬至→芒种)
    "冬至": ("阳", 1), "小寒": ("阳", 2), "大寒": ("阳", 3),
    "立春": ("阳", 8), "雨水": ("阳", 9), "惊蛰": ("阳", 1),
    "春分": ("阳", 3), "清明": ("阳", 4), "谷雨": ("阳", 5),
    "立夏": ("阳", 4), "小满": ("阳", 5), "芒种": ("阳", 6),
    # 阴遁 (夏至→大雪)
    "夏至": ("阴", 9), "小暑": ("阴", 8), "大暑": ("阴", 7),
    "立秋": ("阴", 2), "处暑": ("阴", 1), "白露": ("阴", 9),
    "秋分": ("阴", 7), "寒露": ("阴", 6), "霜降": ("阴", 5),
    "立冬": ("阴", 6), "小雪": ("阴", 5), "大雪": ("阴", 4),
}

# 六甲旬首 → 值符星 + 值使门
# 子午→天蓬/休门, 丑未→天芮/死门, 寅申→天冲/伤门
# 卯酉→天辅/杜门, 辰戌→天禽/死门, 巳亥→天心/开门
XUN_SHOU_MAP = {
    "子": ("天蓬", "休门"), "午": ("天蓬", "休门"),
    "丑": ("天芮", "死门"), "未": ("天芮", "死门"),
    "寅": ("天冲", "伤门"), "申": ("天冲", "伤门"),
    "卯": ("天辅", "杜门"), "酉": ("天辅", "杜门"),
    "辰": ("天禽", "死门"), "戌": ("天禽", "死门"),
    "巳": ("天心", "开门"), "亥": ("天心", "开门"),
}

# 九星序列 (值符星定后, 其余依此序排列)
NINE_STARS_ORDER = ["天蓬", "天芮", "天冲", "天辅", "天禽", "天心", "天柱", "天任", "天英"]

# 八门序列
EIGHT_DOORS_ORDER = ["休门", "死门", "伤门", "杜门", "开门", "惊门", "生门", "景门"]

# 八神序列
EIGHT_GODS = ["值符", "螣蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"]

# 地支 → 宫位 (坎一→离九, 简化映射)
DIZHI_GONG = {
    "子": "坎一宫", "丑": "艮八宫", "寅": "艮八宫",
    "卯": "震三宫", "辰": "巽四宫", "巳": "巽四宫",
    "午": "离九宫", "未": "坤二宫", "申": "坤二宫",
    "酉": "兑七宫", "戌": "乾六宫", "亥": "乾六宫",
}

# 地支 → 方位
DIZHI_DIRECTION = {
    "子": "正北", "丑": "东北", "寅": "东北",
    "卯": "正东", "辰": "东南", "巳": "东南",
    "午": "正南", "未": "西南", "申": "西南",
    "酉": "正西", "戌": "西北", "亥": "西北",
}

# 八门吉凶
DOOR_NATURE = {
    "开门": "吉·事业通达", "休门": "吉·休养康复",
    "生门": "吉·财运生机", "伤门": "凶·竞争伤害",
    "杜门": "平·隐蔽阻滞", "景门": "中·文书名气",
    "死门": "凶·终结停滞", "惊门": "凶·口舌是非",
}

# 九星星性
STAR_NATURE = {
    "天蓬": "水·冒险胆略", "天芮": "土·疾病修学",
    "天冲": "木·冲动行动", "天辅": "木·文教辅助",
    "天禽": "土·中正稳固", "天心": "金·谋划医术",
    "天柱": "金·破坏口才", "天任": "土·担当诚信",
    "天英": "火·名气虚荣",
}


@dataclass
class QimenResult:
    """奇门遁甲关键锚点计算结果"""
    dun_ju: str              # 阳遁/阴遁 + 局数，如 "阳遁三局"
    zhi_fu_star: str         # 值符星名
    zhi_shi_door: str        # 值使门名
    shi_chen_dizhi: str      # 时辰地支
    shi_chen_gong: str       # 时辰落宫
    shi_chen_direction: str  # 时辰方位
    jieqi_name: str          # 当前节气名
    good_doors: list[str]    # 吉门列表
    bad_doors: list[str]     # 凶门列表
    door_hints: dict[str, str]  # 八门方位提示
    god_sequence: list[str]  # 八神序列（阳顺阴逆）

    def to_dict(self) -> dict:
        return {
            "dun_ju": self.dun_ju,
            "zhi_fu_star": self.zhi_fu_star,
            "zhi_shi_door": self.zhi_shi_door,
            "shi_chen_dizhi": self.shi_chen_dizhi,
            "shi_chen_gong": self.shi_chen_gong,
            "shi_chen_direction": self.shi_chen_direction,
            "jieqi_name": self.jieqi_name,
            "good_doors": self.good_doors,
            "bad_doors": self.bad_doors,
            "door_hints": self.door_hints,
            "god_sequence": self.god_sequence,
        }


class QimenCalculator:
    """奇门遁甲排盘计算器"""

    def calculate(self, year: int, month: int, day: int, hour: int,
                  minute: int = 0, longitude: Optional[float] = None) -> QimenResult:
        """
        计算奇门遁甲时盘。
        Args:
            year, month, day, hour, minute: 公历出生时间
            longitude: 经度（用于真太阳时校正）
        """
        # 真太阳时校正
        adjusted_hour = hour
        if longitude is not None:
            offset_min = (longitude - 120) * 4
            total_min = hour * 60 + minute + int(offset_min)
            adjusted_hour = (total_min // 60) % 24

        solar = Solar.fromYmd(year, month, day)
        lunar = solar.getLunar()

        # 1. 确定时辰地支
        shichen_dizhi = self._hour_to_dizhi(adjusted_hour)

        # 2. 获取节气 → 遁局
        jieqi = lunar.getPrevJieQi() or lunar.getJieQiList()[0] if hasattr(lunar, 'getJieQiList') else "春分"
        jieqi_name = jieqi.getName() if hasattr(jieqi, 'getName') else str(jieqi)
        dun_type, dun_number = self._get_dunju(jieqi_name)

        # 3. 日柱旬首 → 值符、值使
        day_gz = lunar.getDayInGanZhi()
        xun_shou = self._get_xun_shou(day_gz)
        zhi_fu, zhi_shi = XUN_SHOU_MAP.get(xun_shou, ("天禽", "死门"))

        # 4. 时辰落宫 & 方位
        shichen_gong = DIZHI_GONG.get(shichen_dizhi, "中五宫")
        shichen_dir = DIZHI_DIRECTION.get(shichen_dizhi, "中")

        # 5. 八门吉凶
        good_doors = [d for d in EIGHT_DOORS_ORDER if "吉" in DOOR_NATURE.get(d, "")]
        bad_doors = [d for d in EIGHT_DOORS_ORDER if "凶" in DOOR_NATURE.get(d, "")]

        # 6. 八门方位提示
        door_hints = {}
        for i, door in enumerate(EIGHT_DOORS_ORDER):
            dizhi_idx = (DIZHI_DICT_ORDER.index(shichen_dizhi) + i) % 12 if shichen_dizhi in DIZHI_DICT_ORDER else i
            dir_dizhi = DIZHI_DICT_ORDER[dizhi_idx % 12]
            door_hints[door] = f"{door}({DOOR_NATURE.get(door, '')}) → {DIZHI_DIRECTION.get(dir_dizhi, '中')}"

        # 7. 八神序列（阳遁顺排，阴遁逆排）
        god_seq = list(EIGHT_GODS) if dun_type == "阳" else list(reversed(EIGHT_GODS))

        dun_ju_str = f"{dun_type}遁{dun_number}局"

        return QimenResult(
            dun_ju=dun_ju_str,
            zhi_fu_star=zhi_fu,
            zhi_shi_door=zhi_shi,
            shi_chen_dizhi=shichen_dizhi,
            shi_chen_gong=shichen_gong,
            shi_chen_direction=shichen_dir,
            jieqi_name=jieqi_name,
            good_doors=good_doors,
            bad_doors=bad_doors,
            door_hints=door_hints,
            god_sequence=god_seq,
        )

    def _hour_to_dizhi(self, hour: int) -> str:
        return ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"][
            ((hour + 1) // 2) % 12
        ]

    def _get_dunju(self, jieqi_name: str) -> tuple[str, int]:
        """根据节气名称返回 (阴阳遁类型, 局数)"""
        for name, (dun_type, num) in JIEQI_DUNJU.items():
            if name in jieqi_name or jieqi_name in name:
                return dun_type, num
        # Fallback: 按月份粗略判断
        return ("阳", 1)

    def _get_xun_shou(self, ganzhi: str) -> str:
        """从天干地支组合返回旬首地支"""
        if not ganzhi or len(ganzhi) < 2:
            return "子"
        gan = ganzhi[0]
        zhi = ganzhi[1]
        # 天干→旬首映射: 甲/己→子, 乙/庚→丑, 丙/辛→寅, ...
        gan_to_xun = {"甲":"子","己":"子","乙":"丑","庚":"丑","丙":"寅","辛":"寅",
                       "丁":"卯","壬":"卯","戊":"辰","癸":"辰"}
        return gan_to_xun.get(gan, "子")


# 地支顺序列表（用于方位推算）
DIZHI_DICT_ORDER = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]


# ─── 便捷函数 ─────────────────────────────────────────────────────────────────

def calculate_qimen(year: int, month: int, day: int, hour: int,
                    minute: int = 0, longitude: Optional[float] = None) -> QimenResult:
    """便捷函数: 计算奇门遁甲时盘"""
    calc = QimenCalculator()
    return calc.calculate(year, month, day, hour, minute, longitude)
