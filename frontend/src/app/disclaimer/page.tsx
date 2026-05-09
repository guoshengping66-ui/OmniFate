import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "免责声明 - 命盘智镜",
  description: "命盘智镜免责声明与风险提示",
}

const sections = [
  {
    title: "一、命理分析的性质",
    content: `本平台提供的所有命理分析服务（包括但不限于八字分析、星盘解读、塔罗占卜、面相手相分析、奇门遁甲、紫微斗数）均基于人工智能算法和传统命理学知识生成，仅供用户个人娱乐和参考使用。

命理分析结果不构成任何形式的专业建议，包括但不限于医疗诊断、法律咨询、财务规划、投资决策、心理咨询或人生重大决策依据。用户应基于自身判断和专业知识做出决策，不应将本平台的分析结果作为唯一或主要参考依据。`,
  },
  {
    title: "二、AI 分析的局限性",
    content: `本平台使用的人工智能技术虽然经过训练和优化，但仍存在以下局限性：

1. AI 模型可能存在偏差或错误，分析结果不一定准确或完整。
2. 命理学本身属于传统文化范畴，不属于现代科学体系，分析结果不具备科学验证性。
3. 不同命理流派之间可能存在观点差异，本平台的分析仅代表特定算法逻辑下的解读。
4. AI 无法替代专业命理师的经验判断，分析结果可能存在偏差。

用户应理性看待分析结果，将其作为自我探索和反思的辅助工具，而非绝对真理。`,
  },
  {
    title: "三、改运商品说明",
    content: `本平台商城销售的改运商品（包括但不限于水晶、珠宝、香薰、符咒、书籍等）为文化创意产品。商品描述中提及的功效（如"招财纳福""增强直觉力""事业晋升"等）均基于中国传统命理文化和民间信仰概念，并非科学验证的功效声明。

这些描述不构成对该商品实际效果的保证或承诺。商品的实际效果因人而异，用户不应将商品功效描述作为购买决策的唯一依据。`,
  },
  {
    title: "四、用户行为责任",
    content: `1. 用户应理性使用本平台服务，不应过度依赖命理分析结果做出重大人生决策。
2. 用户因参考本平台分析结果而做出的任何决策，其后果由用户自行承担。
3. 本平台不对用户基于分析结果做出的任何行为或决策承担责任。
4. 用户在使用本平台服务时，应遵守所在地区的法律法规。`,
  },
  {
    title: "五、服务可用性",
    content: `1. 本平台提供的服务可能因技术维护、系统升级、第三方服务中断等原因暂时无法使用。
2. 本平台保留随时修改、暂停或终止部分或全部服务的权利，恕不另行通知。
3. 因不可抗力（包括但不限于自然灾害、政策变化、网络故障、第三方服务中断）导致的服务中断，本平台不承担责任。`,
  },
  {
    title: "六、第三方链接",
    content: `本平台可能包含第三方网站或服务的链接。这些链接仅为方便用户而提供，不代表本平台对第三方内容的认可或推荐。用户访问第三方网站的风险由用户自行承担。`,
  },
  {
    title: "七、法律适用",
    content: `本免责声明适用中华人民共和国法律。因本免责声明引起的或与本免责声明相关的任何争议，应提交至本平台运营者所在地有管辖权的人民法院解决。`,
  },
  {
    title: "八、联系方式",
    content: `如对本免责声明有任何疑问，请联系我们：

- 电子邮件：legal@khanfate.com
- 网站：https://www.khanfate.com/about`,
  },
]

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <AlertTriangle className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold mb-2">免责声明</h1>
          <p className="text-white/40 text-sm">最后更新：2026 年 5 月 8 日</p>
        </div>

        {/* Important notice banner */}
        <div className="mb-8 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <p className="text-amber-200/80 text-sm leading-relaxed text-center font-medium">
            重要提示：本平台所有命理分析结果仅供娱乐和参考，不构成任何专业建议。
            <br />
            请理性看待分析结果，不要将其作为重大人生决策的依据。
          </p>
        </div>

        {/* Content */}
        <div className="card-glass p-6 md:p-10 space-y-8">
          <p className="text-white/60 text-sm leading-relaxed">
            命盘智镜（以下简称"本平台"）在为您提供命理分析服务之前，请仔细阅读并充分理解以下免责声明。使用本平台服务即表示您已阅读并理解本声明的全部内容。
          </p>

          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-gold font-medium text-lg mb-3">{section.title}</h2>
              <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}

          {/* Operator info */}
          <div className="border-t border-white/10 pt-6">
            <h2 className="text-gold font-medium text-lg mb-3">运营主体信息</h2>
            <div className="text-white/55 text-sm leading-relaxed space-y-1">
              <p>运营者名称：[公司名称 / 个人名称]</p>
              <p>联系邮箱：legal@khanfate.com</p>
              <p>网站地址：https://www.khanfate.com</p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-gold/60 hover:text-gold text-sm transition-colors">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
