import { BookOpen } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "服务条款 - 命盘智镜",
  description: "命盘智镜用户服务条款",
}

const sections = [
  {
    title: "一、服务说明",
    content: `命盘智镜是一个基于 AI 技术的多维度命理分析平台，提供以下服务：

1. 基于出生信息的八字、星盘、奇门遁甲、紫微斗数分析
2. 塔罗牌解读
3. AI 面相和手相分析
4. 综合命盘报告与个性化建议
5. 改运商品推荐与购买
6. 事件复盘与每日运势

本服务仅供个人娱乐和参考使用，不构成任何形式的专业建议。`,
  },
  {
    title: "二、用户责任",
    content: `1. 您应确保注册信息真实有效，妥善保管账户密码。
2. 您上传的面相/手相照片应为本人照片或已获得本人授权。
3. 您不得利用本服务从事任何违法违规活动。
4. 您不得恶意攻击、干扰本服务的正常运行。
5. 您应对自己在平台上的行为承担法律责任。`,
  },
  {
    title: "三、知识产权",
    content: `1. 本平台的所有内容（包括但不限于文字、图标、设计、代码）的知识产权归命盘智镜所有。
2. AI 生成的分析报告仅供您个人使用，未经授权不得用于商业用途。
3. 您上传的照片版权归原作者所有，我们仅在分析过程中临时使用。`,
  },
  {
    title: "四、付费服务",
    content: `1. 高级分析报告和部分商品需要付费解锁。
2. 付费前请仔细确认服务内容和价格。
3. 付费完成后，虚拟服务（分析报告）不支持退款，详见退款政策。
4. 会员订阅服务可随时取消，取消后在当前付费周期结束前仍可使用。`,
  },
  {
    title: "五、免责声明",
    content: `1. 本平台提供的命理分析基于 AI 算法和传统命理知识，仅供个人娱乐和参考使用，不构成任何形式的专业建议（包括但不限于医学、法律、财务、投资、心理咨询建议）。
2. 命理学属于传统文化范畴，不属于现代科学体系，分析结果不具备科学验证性。用户应理性看待分析结果，不应将其作为重大人生决策的唯一或主要依据。
3. 改运商品为文化创意产品，功效描述基于传统命理文化概念，并非科学验证的功效声明。
4. 因不可抗力（包括但不限于自然灾害、政策变化、第三方服务中断）导致的服务中断，我们不承担责任。
5. 我们不对因您自身原因导致的账户安全问题承担责任。
6. 用户因参考本平台分析结果而做出的任何决策，其后果由用户自行承担。
7. 详细免责声明请参阅我们的《免责声明》页面。`,
  },
  {
    title: "六、服务变更与终止",
    content: `1. 我们保留随时修改、暂停或终止部分或全部服务的权利。
2. 如您违反本服务条款，我们有权暂停或终止您的账户。
3. 服务终止后，我们将按照隐私政策的规定处理您的数据。`,
  },
  {
    title: "七、条款更新",
    content: `我们保留随时修改本服务条款的权利。修改后的条款将在本页面发布，并更新顶部的"最后更新"日期。继续使用本服务即表示您接受修改后的条款。`,
  },
  {
    title: "八、联系方式",
    content: `如对本服务条款有任何疑问，请联系我们：

- 电子邮件：support@khanfate.com
- 网站：https://www.khanfate.com/about`,
  },
  {
    title: "九、运营者信息",
    content: `运营者名称：命盘智镜运营团队
联系邮箱：support@khanfate.com
网站地址：https://www.khanfate.com`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <BookOpen className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold mb-2">服务条款</h1>
          <p className="text-white/40 text-sm">最后更新：2026 年 5 月 7 日</p>
        </div>

        <div className="card-glass p-6 md:p-10 space-y-8">
          <p className="text-white/60 text-sm leading-relaxed">
            欢迎使用命盘智镜（以下简称"本平台"）。在使用本平台服务前，请仔细阅读并充分理解以下服务条款。注册或使用本平台服务即表示您同意遵守本条款。
          </p>

          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-gold font-medium text-lg mb-3">{section.title}</h2>
              <div className="text-white/55 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-gold/60 hover:text-gold text-sm transition-colors">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
