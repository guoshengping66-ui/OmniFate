import { Sparkles, Globe, Bot, Gift, Shield, BookOpen } from "lucide-react"
import Link from "next/link"

const values = [
  {
    icon: Globe,
    title: "东西融合",
    desc: "融合周易八字、西方星盘、塔罗占卜、AI面相与手相五大体系，东西方玄学精华交汇。",
  },
  {
    icon: Bot,
    title: "AI 驱动",
    desc: "基于 LangGraph 多智能体架构，五个专家 Agent 并行分析，Master Agent 综合汇总。",
  },
  {
    icon: Gift,
    title: "精准改运",
    desc: "AI 根据命盘弱点自动匹配专属改运商品，从水晶到符咒，每件推荐都有命理依据。",
  },
  {
    icon: Shield,
    title: "隐私安全",
    desc: "面部照片仅用于特征提取，不留存原始图像。数据加密传输，严格保护用户隐私。",
  },
]

const team = [
  { name: "玄学研究院", desc: "资深命理师团队提供专业领域知识，确保分析逻辑符合传统经典。" },
  { name: "AI 工程团队", desc: "来自顶尖科技公司的算法工程师，构建多智能体协同推理系统。" },
  { name: "用户体验设计", desc: "专注打造沉浸式命理体验，让复杂玄学变得直观易懂。" },
]

const timeline = [
  { year: "2024 Q3", event: "项目启动，核心算法研发" },
  { year: "2024 Q4", event: "八字计算器 & 星盘引擎完成" },
  { year: "2025 Q1", event: "多 Agent 框架上线，面相/手相 CV 模型集成" },
  { year: "2025 Q2", event: "公测发布，改运商城 & 付费系统上线" },
  { year: "2026 Q1", event: "隐私合规升级，法律页面完善" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <Sparkles size={36} className="text-gold mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold text-gold mb-4">关于命盘智镜</h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            让千年玄学智慧与最前沿的人工智能相遇，<br />
            为每个人提供独一无二的生命解读。
          </p>
        </div>

        {/* Mission */}
        <div className="card-glass p-8 md:p-12 mb-12">
          <h2 className="font-serif text-2xl text-gold mb-4">我们的使命</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            命盘智镜致力于将传统命理学的精髓与 AI 技术深度结合。我们相信，
            每个人的生命轨迹都有其独特的规律和节奏——八字、星盘、面相、手相、塔罗
            都是从不同角度揭示这一规律的工具。
          </p>
          <p className="text-white/70 leading-relaxed">
            我们的 AI 系统并非替代命理师，而是将五位"专家"的知识融合在一起，
            通过 Master Agent 进行综合分析，提供比单一维度更全面、更精准的生命解读。
          </p>
        </div>

        {/* Values */}
        <h2 className="section-title mb-10">核心价值观</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {values.map((v) => (
            <div key={v.title} className="card-glow p-6">
              <v.icon size={24} className="text-gold mb-3" />
              <h3 className="font-serif font-bold text-gold mb-2">{v.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works - 5 layer architecture */}
        <div className="card-glass p-8 md:p-12 mb-12">
          <BookOpen size={24} className="text-gold mb-4" />
          <h2 className="font-serif text-2xl text-gold mb-6">五层架构体系</h2>
          <div className="space-y-5">
            {[
              {
                layer: "数据采集层",
                desc: "用户提交出生信息（年月日时分+城市经纬度）、面部照片、手掌照片、塔罗选择。多模态输入确保分析原料的丰富性。",
              },
              {
                layer: "专家调度层",
                desc: "Master Agent 根据用户需求激活对应的专家节点，五个垂直 Agent 同时开始并行计算。",
              },
              {
                layer: "专业分析层",
                desc: "八字 Agent 论断五行流年，星盘 Agent 论断宫位相位，塔罗 Agent 结合牌阵进行心理映射，面相与手相 Agent 解读图像特征。",
              },
              {
                layer: "逻辑合参层",
                desc: "Master Agent 读取五份专家报告，寻找共识、处理冲突，以「主诊医生」身份进行逻辑闭环，生成终极报告。",
              },
              {
                layer: "商业变现层",
                desc: "根据生成的「能量标签」自动匹配改运商品，在报告建议中自然植入改善方案，并支持长尾交互追问。",
              },
            ].map((item, i) => (
              <div key={item.layer} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-gold font-medium mb-1">{item.layer}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <h2 className="section-title mb-10">团队</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {team.map((m) => (
            <div key={m.name} className="card-glow p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-gold/20 mx-auto mb-4 flex items-center justify-center">
                <Sparkles size={22} className="text-gold" />
              </div>
              <h3 className="font-serif font-bold text-gold mb-2">{m.name}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <h2 className="section-title mb-10">发展历程</h2>
        <div className="card-glass p-8 mb-12">
          {timeline.map((t, i) => (
            <div key={t.year} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-gold flex-shrink-0" />
                {i < timeline.length - 1 && <div className="w-px flex-1 bg-gold/20 my-1" />}
              </div>
              <div className="pb-8">
                <span className="text-gold text-sm font-mono">{t.year}</span>
                <p className="text-white/60 text-sm mt-1">{t.event}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center card-glass p-10">
          <h2 className="font-serif text-2xl text-gold mb-4">准备好探索你的命盘了吗？</h2>
          <p className="text-white/50 mb-6">免费的初步分析，发现你的生命密码</p>
          <Link href="/reading/new" className="btn-gold inline-flex items-center gap-2 text-lg px-10 py-4">
            开始免费推命
            <Sparkles size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
