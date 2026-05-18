import { Shield } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "隐私政策 - 命盘智镜",
  description: "命盘智镜用户隐私保护政策",
}

const sections = [
  {
    title: "一、信息收集",
    content: `我们收集以下信息以提供命理分析服务：

1. **账户信息**：注册时提供的电子邮件地址和显示名称。
2. **出生信息**：出生年月日、时辰、出生城市及经纬度，用于生成命盘分析。
3. **面相/手相数据**：您上传的面部或手掌照片，仅用于 AI 特征提取分析，原始图片在分析完成后立即删除，不做永久存储。
4. **用户问题**：您在分析过程中提出的问题，用于提供个性化解读。
5. **支付信息**：通过第三方支付平台（支付宝、微信支付、PayPal）处理，我们不存储您的银行卡号等敏感支付信息。`,
  },
  {
    title: "二、信息使用",
    content: `我们收集的信息仅用于以下目的：

1. **命理分析**：基于您的出生信息和上传数据，通过 AI 系统生成个性化命盘分析报告。
2. **服务优化**：分析数据（已匿名化）用于改进算法准确性。
3. **商品推荐**：根据命盘分析结果，为您推荐适合的改运商品。
4. **客户服务**：回应您的咨询和反馈。`,
  },
  {
    title: "三、生物识别信息处理（敏感个人信息）",
    content: `根据《个人信息保护法》第28-32条，面部特征和手掌纹路属于敏感个人信息。我们对此类信息的处理遵循以下原则：

1. **单独同意**：在您上传面部或手掌照片前，我们会弹出单独的授权同意窗口，明确告知数据处理目的、方式和范围。您有权拒绝，拒绝不影响其他功能的使用。
2. **特定目的**：生物识别信息仅用于 AI 面相/手相特征提取分析，不用于身份认证或其他用途。
3. **最短保存期限**：原始照片在 AI 分析完成后立即删除，仅保留分析结果文本。照片不做任何备份或永久存储。
4. **安全措施**：照片在传输和处理过程中使用 HTTPS 加密，处理服务器与主数据库隔离。
5. **撤回同意**：您可随时在账户设置中撤回生物识别信息处理同意，撤回不影响此前已处理的分析结果。`,
  },
  {
    title: "四、信息存储与安全",
    content: `1. **存储位置**：您的数据存储在位于中国境内的阿里云服务器上，使用 PostgreSQL 数据库，数据传输全程 HTTPS 加密。
2. **密码安全**：密码使用 bcrypt 算法加盐哈希存储，我们无法查看您的原始密码。
3. **图片处理**：面相和手相照片仅在 AI 分析过程中临时使用，分析完成后立即从服务器删除，不做任何备份或永久存储。
4. **数据保留**：账户信息和分析报告保留至您主动删除账户。`,
  },
  {
    title: "五、第三方服务",
    content: `为提供 AI 分析服务，我们会将您的出生信息和分析请求发送至以下第三方服务：

1. **DeepSeek API**：用于 AI 命理分析推理（已签署数据处理协议）。
2. **Skyfield 天文计算库**：用于本地星盘计算，不涉及数据外传。
3. **支付服务商**：支付宝、微信支付、PayPal（仅在您发起支付时使用）。

我们不会将您的个人信息出售或共享给其他任何第三方。`,
  },
  {
    title: "六、用户权利",
    content: `您享有以下权利：

1. **查看权**：随时在「我的账户」中查看您的个人信息和分析历史。
2. **删除权**：您有权要求删除您的账户及所有相关数据。具体操作方式：
   - 登录后在「我的账户」页面点击「删除账户」按钮，系统将立即处理。
   - 或发送邮件至 privacy@khanfate.com，注明您的注册邮箱和删除请求，我们将在 7 个工作日内处理。
   - 删除后，您的个人信息、分析报告、上传的照片将被永久删除，此操作不可撤销。
3. **数据导出**：可申请导出您的分析报告数据，发送邮件至 privacy@khanfate.com 即可。
4. **撤回同意**：您可随时撤回对隐私政策的同意，但撤回不影响此前已进行的数据处理。`,
  },
  {
    title: "七、Cookie 使用",
    content: `我们使用必要的 Cookie 来维持您的登录状态和网站正常运行。我们不使用第三方追踪 Cookie，也不会利用 Cookie 进行广告投放。

您可以通过浏览器设置管理 Cookie，但禁用必要 Cookie 可能影响网站功能。`,
  },
  {
    title: "八、未成年人保护",
    content: `我们非常重视未成年人隐私保护。未满 18 周岁的用户不得使用本服务。如果我们发现未成年人的个人信息，我们将立即删除相关数据。`,
  },
  {
    title: "九、隐私政策更新",
    content: `我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，并更新顶部的"最后更新"日期。重大变更将通过电子邮件或网站公告通知您。`,
  },
  {
    title: "十、联系我们",
    content: `如果您对本隐私政策有任何疑问，请通过以下方式联系我们：

- 电子邮件：privacy@khanfate.com
- 网站：https://www.khanfate.com/about`,
  },
  {
    title: "十一、运营者信息",
    content: `运营者名称：命盘智镜运营团队
联系邮箱：privacy@khanfate.com
网站地址：https://www.khanfate.com`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="text-gold mx-auto mb-3" size={28} />
          <h1 className="text-2xl font-serif font-bold text-gold mb-2">隐私政策</h1>
          <p className="text-white/40 text-sm">最后更新：2026 年 5 月 7 日</p>
        </div>

        {/* Content */}
        <div className="card-glass p-6 md:p-10 space-y-8">
          <p className="text-white/60 text-sm leading-relaxed">
            命盘智镜（以下简称"我们"）深知个人信息对您的重要性，我们将按照法律法规的规定，保护您的个人信息及隐私安全。在使用我们的服务前，请仔细阅读本隐私政策。
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
