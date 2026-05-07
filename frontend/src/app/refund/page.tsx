import { RotateCcw } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "退款政策 - 命盘智镜",
  description: "命盘智镜退款与退订政策",
}

const sections = [
  {
    title: "一、虚拟服务（分析报告）",
    content: `1. AI 命理分析报告为个性化虚拟服务，一旦生成，原则上不支持退款。
2. 如果分析报告因系统错误未能正常生成，我们将在核实后全额退款。
3. 如果您在付费后 10 分钟内主动取消且分析尚未开始，可申请退款。`,
  },
  {
    title: "二、会员订阅",
    content: `1. 月度会员：订阅后 24 小时内可申请全额退款；超过 24 小时不支持退款。
2. 年度会员：订阅后 7 天内可申请全额退款；超过 7 天按已使用月份（月度价格）扣除后退还差额。
3. 取消订阅后，会员权益将在当前付费周期结束后自动终止。
4. 退款将在 3-5 个工作日内原路退回。`,
  },
  {
    title: "三、实物商品",
    content: `1. 未拆封的实物商品可在收货后 7 天内申请退货，退货运费由买家承担。
2. 已拆封或使用的商品不支持退货（商品质量问题除外）。
3. 定制类商品（如个性化符咒、刻字饰品）不支持退货。
4. 退货流程：联系客服 → 提供订单号和退货原因 → 审核通过后寄回 → 收到退货后 3-5 个工作日退款。`,
  },
  {
    title: "四、优惠券与折扣",
    content: `1. 使用优惠券支付的部分，退款时优惠券不予退还。
2. 通过「命盘解锁」获得的商城优惠券，退款后优惠券将被回收。`,
  },
  {
    title: "五、退款申请方式",
    content: `如需申请退款，请通过以下方式联系我们：

- 电子邮件：refund@khanfate.com
- 邮件标题格式：【退款申请】订单号/订阅类型
- 请提供：注册邮箱、订单号、退款原因

我们将在收到申请后 1-3 个工作日内审核并回复。`,
  },
]

export default function RefundPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <RotateCcw className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold mb-2">退款政策</h1>
          <p className="text-white/40 text-sm">最后更新：2026 年 5 月 7 日</p>
        </div>

        <div className="card-glass p-6 md:p-10 space-y-8">
          <p className="text-white/60 text-sm leading-relaxed">
            感谢您使用命盘智镜。我们致力于提供高质量的命理分析服务。以下退款政策适用于本平台的各项付费服务。
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
