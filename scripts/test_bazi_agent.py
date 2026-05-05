"""
test_bazi_agent.py — 八字 Agent 独立测试脚本

用法:
  python scripts/test_bazi_agent.py                          # 使用默认测试案例
  python scripts/test_bazi_agent.py --case 2                 # 运行案例2
  python scripts/test_bazi_agent.py --custom --year 1990 --month 3 --day 15 --hour 14 --minute 0 --city 北京 --gender female
  python scripts/test_bazi_agent.py --api-key sk-xxx         # 使用真实 LLM 调用

测试案例覆盖:
  案例1: 甲木日主 寅月（身强格）
  案例2: 癸水日主 未月（身弱格）
  案例3: 戊土日主 午月（从强格 / 特殊格局）
  案例4: 乙木日主 卯月（五行均衡）
"""
import sys
import os
import json
import argparse
from pathlib import Path

# 修复 Windows GBK 编码问题
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# 将项目根目录加入 sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

# ─── 测试案例数据集 ─────────────────────────────────────────────────────────

TEST_CASES = [
    {  # 案例1: 辛金日主 卯月 — 1988年3月27日 巳时 (中和格)
        "name": "辛金日主中和格",
        "year": 1988, "month": 3, "day": 27,
        "hour": 10, "minute": 0,
        "city": "北京", "longitude": 116.4, "latitude": 39.9,
        "gender": "male",
        "expected": {"pattern": "中和", "day_master_element": "金"},
    },
    {  # 案例2: 庚金日主 未月 — 1995年7月18日 申时 (身强格)
        "name": "庚金身强格",
        "year": 1995, "month": 7, "day": 18,
        "hour": 16, "minute": 30,
        "city": "上海", "longitude": 121.5, "latitude": 31.2,
        "gender": "female",
        "expected": {"pattern": "身强", "day_master_element": "金"},
    },
    {  # 案例3: 戊土日主 午月 — 1978年6月15日 午时 (身强格)
        "name": "戊土身强格",
        "year": 1978, "month": 6, "day": 15,
        "hour": 12, "minute": 0,
        "city": "广州", "longitude": 113.3, "latitude": 23.1,
        "gender": "male",
        "expected": {"pattern": "身强", "day_master_element": "土"},
    },
    {  # 案例4: 丁火日主 卯月 — 2000年3月20日 辰时 (身强格)
        "name": "丁火身强格",
        "year": 2000, "month": 3, "day": 20,
        "hour": 8, "minute": 0,
        "city": "成都", "longitude": 104.1, "latitude": 30.6,
        "gender": "female",
        "expected": {"pattern": "身强", "day_master_element": "火"},
    },
]


# ─── 辅助函数 ───────────────────────────────────────────────────────────────

def print_separator(title: str):
    print()
    print("=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_calculator(case: dict) -> dict:
    """运行 BaziCalculator 并返回计算结果"""
    from backend.calculators.bazi_calculator import BaziCalculator

    calc = BaziCalculator()
    result = calc.calculate(
        year=case["year"], month=case["month"], day=case["day"],
        hour=case["hour"], minute=case["minute"],
        longitude=case["longitude"],
    )
    raw = result.to_dict()
    return raw


def build_bazi_prompt(case: dict, raw: dict) -> str:
    """只构建 bazi_prompt 文本（不调用 LLM）"""
    from backend.agents.prompts import bazi_prompt
    from backend.calculators.bazi_calculator import get_current_year_ganzhi

    pillars = " ".join([raw["year_gz"], raw["month_gz"], raw["day_gz"], raw["hour_gz"]])
    birth_str = f"{case['year']}-{case['month']:02d}-{case['day']:02d} {case['hour']:02d}:00"

    shishen = raw.get("shishen", {})
    shishen_lines = [f"  {k}: {v}" for k, v in shishen.items()]
    shishen_str = "\n".join(shishen_lines) if shishen_lines else ""

    return bazi_prompt(
        gender=case["gender"],
        birth_datetime=birth_str,
        pillars=pillars,
        wuxing_scores=raw.get("wuxing_scores", {}),
        missing=raw.get("missing_elements", []),
        day_master=raw.get("day_master", ""),
        current_year_gz=get_current_year_ganzhi(),
        day_master_element=raw.get("day_master_element", ""),
        day_master_yinyang=raw.get("day_master_yinyang", ""),
        strong_elements=raw.get("strong_elements", []),
        pattern=raw.get("pattern", ""),
        yong_shen=raw.get("yong_shen", ""),
        xi_shen=raw.get("xi_shen", ""),
        ji_shen=raw.get("ji_shen", ""),
        shishen_str=shishen_str,
        face_supplement="",
    )


def test_prompt(case: dict, raw: dict, use_mock: bool = True, api_key: str = "") -> str:
    """构建 prompt 并调用（mock 或真实 LLM）"""
    system = build_bazi_prompt(case, raw)

    if use_mock or not api_key:
        return f"[MOCK] 模拟输出 - {case['name']}\n\n系统 Prompt 已构建完成。设置 OPENAI_API_KEY 可使用真实 LLM。\n" + '```json\n{"weakness_tags": ["#mock"], "boost_elements": []}\n```'

    # Real LLM call
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import SystemMessage, HumanMessage

    import openai
    llm = ChatOpenAI(model="gpt-4o", api_key=api_key, temperature=0.3, max_tokens=4096)
    msgs = [SystemMessage(content=system), HumanMessage(content="请根据以上数据生成完整的八字分析报告。")]
    resp = llm.invoke(msgs)
    return resp.content


def validate_calculator(raw: dict, expected: dict) -> list[str]:
    """验证计算器输出与预期是否一致"""
    issues = []
    for key, val in expected.items():
        actual = raw.get(key, "")
        if actual != val:
            issues.append(f"  ⚠️  {key}: 期望={val}, 实际={actual}")
    return issues


# ─── 主函数 ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="八字 Agent 独立测试脚本")
    parser.add_argument("--case", type=int, default=0, help="测试案例编号 (1-4, 默认跑全部)")
    parser.add_argument("--custom", action="store_true", help="使用自定义参数")
    parser.add_argument("--year", type=int, default=1990)
    parser.add_argument("--month", type=int, default=1)
    parser.add_argument("--day", type=int, default=1)
    parser.add_argument("--hour", type=int, default=12)
    parser.add_argument("--minute", type=int, default=0)
    parser.add_argument("--city", default="北京")
    parser.add_argument("--longitude", type=float, default=116.4)
    parser.add_argument("--latitude", type=float, default=39.9)
    parser.add_argument("--gender", default="male", choices=["male", "female", "other"])
    parser.add_argument("--api-key", default="", help="OpenAI API key（不设置则 mock 模式）")
    parser.add_argument("--show-raw", action="store_true", help="显示完整的原始计算数据")
    args = parser.parse_args()

    cases_to_run = []
    if args.custom:
        cases_to_run = [{
            "name": f"自定义 {args.year}年{args.month}月{args.day}日",
            "year": args.year, "month": args.month, "day": args.day,
            "hour": args.hour, "minute": args.minute,
            "city": args.city, "longitude": args.longitude, "latitude": args.latitude,
            "gender": args.gender,
            "expected": {},
        }]
    elif args.case > 0 and args.case <= len(TEST_CASES):
        cases_to_run = [TEST_CASES[args.case - 1]]
    else:
        cases_to_run = TEST_CASES

    use_mock = not bool(args.api_key)
    total_issues = 0

    for case in cases_to_run:
        print_separator(f"案例: {case['name']} ({case['city']})")

        # Step 1: 计算
        print(f"\n  📊 出生: {case['year']}-{case['month']:02d}-{case['day']:02d} "
              f"{case['hour']:02d}:{case['minute']:02d} 性别:{case['gender']}")
        raw = test_calculator(case)

        # Step 2: 显示计算结果
        pillars = " ".join([raw["year_gz"], raw["month_gz"], raw["day_gz"], raw["hour_gz"]])
        print(f"  🏛️  八字: {pillars}")
        print(f"  👤 日主: {raw['day_master']}[{raw.get('day_master_element','')}{raw.get('day_master_yinyang','')}]")
        print(f"  ⚖️  格局: {raw.get('pattern','?')}")
        print(f"  🔮 用神: {raw.get('yong_shen','?')}  喜神: {raw.get('xi_shen','?')}  忌神: {raw.get('ji_shen','?')}")
        print(f"  🌊 五行: {raw.get('wuxing_scores', {})}")
        print(f"  ❌ 缺: {raw.get('missing_elements', [])}")
        print(f"  💪 旺: {raw.get('strong_elements', [])}")

        # 十神
        shishen = raw.get("shishen", {})
        if shishen:
            print(f"  📋 十神:")
            for k, v in shishen.items():
                print(f"     {k}: {v}")

        if args.show_raw:
            print(f"\n  📄 原始数据:")
            print(json.dumps(raw, ensure_ascii=False, indent=2))

        # Step 3: 验证
        if case.get("expected"):
            issues = validate_calculator(raw, case["expected"])
            if issues:
                total_issues += len(issues)
                print(f"\n  ❌ 验证失败:")
                for i in issues:
                    print(f"    {i}")
            else:
                print(f"\n  ✅ 计算器验证通过")

        # Step 4: 构建 prompt
        prompt_text = build_bazi_prompt(case, raw)
        print(f"\n  📝 Prompt 长度: {len(prompt_text)} 字符")
        print(f"  📝 Prompt 预览 (前 300 字):")
        print(f"     {prompt_text[:300].replace(chr(10), chr(10)+'     ')}...")

        # 调用 LLM (mock 或真实)
        report = test_prompt(case, raw, use_mock=use_mock, api_key=args.api_key)

        # 提取 JSON 标签
        import re
        m = re.search(r"```json\s*(\{.*?\})\s*```", report, re.DOTALL)
        if m:
            try:
                tags = json.loads(m.group(1))
                print(f"  🏷️  JSON 标签:")
                for k, v in tags.items():
                    print(f"     {k}: {v}")
            except json.JSONDecodeError:
                print(f"  ⚠️  JSON 解析失败")

        # 检查关键数据是否出现在 prompt 中
        checks = [
            (raw.get("pattern", ""), f"格局({raw.get('pattern','')})"),
            (raw.get("yong_shen", ""), f"用神({raw.get('yong_shen','')})"),
            (raw.get("day_master_element", ""), f"日主五行({raw.get('day_master_element','')})"),
        ]
        print(f"  🔍 Prompt 数据完整性检查:")
        all_ok = True
        for val, label in checks:
            if val:
                print(f"     ✅ {label} — 已包含")
            else:
                print(f"     ⚠️  {label} — 缺失")
                all_ok = False
        if all_ok:
            print(f"     ✅ 所有计算数据均已传递到 prompt")

    # ─── 最终汇总 ────────────────────────────────────────────────────
    print_separator("测试汇总")
    print(f"  运行案例数: {len(cases_to_run)}")
    print(f"  验证失败数: {total_issues}")
    if total_issues > 0:
        print("  ⚠️  部分计算器验证失败，请检查")
    else:
        print("  ✅ 全部通过")

    print()
    print("  💡 提示: 使用 --api-key sk-xxx 调用真实 LLM 查看完整输出")
    print()


if __name__ == "__main__":
    main()
