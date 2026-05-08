# 个人收款码支付配置指南

## 一、获取收款码图片

### 1. 支付宝收款码

**步骤：**
1. 打开支付宝APP
2. 点击右下角「我的」
3. 点击「收付款」
4. 点击「二维码收款」
5. 点击「保存图片」

**得到的图片：** 一张包含你的收款二维码的图片

**重命名：** `alipay-qr.png`

---

### 2. 微信收款码

**步骤：**
1. 打开微信APP
2. 点击右下角「我」
3. 点击「服务」（或「支付」）
4. 点击「收付款」
5. 点击「二维码收款」
6. 点击「保存收款码」

**得到的图片：** 一张包含你的收款二维码的图片

**重命名：** `wechat-qr.png`

---

### 3. PayPal收款码

**步骤：**
1. 登录 PayPal.com
2. 点击右上角头像
3. 点击「PayPal.Me」或创建链接
4. 或者在APP中：设置 → PayPal.Me → 分享链接

**注意：** PayPal个人账户没有传统收款码，用户需要点击链接付款

**替代方案：** 使用你的PayPal邮箱，如 `your@email.com`

---

## 二、配置收款码图片

### 步骤1：放置图片到前端

```bash
# 将收款码图片放到前端public目录
cp alipay-qr.png frontend/public/qrcode-alipay.png
cp wechat-qr.png frontend/public/qrcode-wechat.png
```

### 步骤2：配置环境变量

编辑 `backend/.env` 文件：

```bash
# ═══════════════════════════════════════════════════════════════════
# 个人收款码配置
# ═══════════════════════════════════════════════════════════════════

# 支付宝收款码图片URL（部署后改为线上地址）
ALIPAY_PERSONAL_QR_URL=/qrcode-alipay.png

# 微信收款码图片URL
WECHAT_PERSONAL_QR_URL=/qrcode-wechat.png

# PayPal收款码/链接（如果有）
PAYPAL_PERSONAL_QR_URL=

# PayPal收款邮箱（没有收款码时使用）
PAYPAL_PERSONAL_EMAIL=your-email@paypal.com

# ═══════════════════════════════════════════════════════════════════
# 原有支付配置（保持不变）
# ═══════════════════════════════════════════════════════════════════

# 微信支付（商家版，暂时不用）
WECHAT_PAY_ENABLED=false

# 支付宝（商家版，暂时不用）
ALIPAY_ENABLED=false

# PayPal（企业版，暂时不用）
PAYPAL_ENABLED=false
```

---

## 三、前端使用方法

### 方式1：在现有支付弹窗中集成

```tsx
// frontend/src/components/payment/PaymentModal.tsx

import { QRPaymentModal } from "./QRPaymentModal"

export function PaymentModal({ open, onClose, amount, readingId }) {
  const [showQR, setShowQR] = useState(false)

  return (
    <>
      {/* 原有的支付选择弹窗 */}
      {open && !showQR && (
        <div className="fixed inset-0 z-50 ...">
          {/* 选择支付宝/微信支付后 */}
          <button onClick={() => setShowQR(true)}>
            选择支付宝支付
          </button>
        </div>
      )}

      {/* 个人收款码支付弹窗 */}
      <QRPaymentModal
        open={showQR}
        onClose={() => setShowQR(false)}
        amount={amount}
        readingId={readingId}
        onSuccess={(orderNo) => {
          // 支付成功回调
          console.log("支付成功:", orderNo)
          onClose()
        }}
      />
    </>
  )
}
```

### 方式2：直接在报告页面使用

```tsx
// frontend/src/app/reading/[id]/page.tsx

import { QRPaymentModal } from "@/components/payment/QRPaymentModal"

export default function ReadingPage() {
  const [showPayment, setShowPayment] = useState(false)
  const readingId = "xxx"
  const unlockPrice = 49.9

  return (
    <div>
      {/* 解锁按钮 */}
      <button
        onClick={() => setShowPayment(true)}
        className="btn-gold"
      >
        解锁完整报告 ¥{unlockPrice}
      </button>

      {/* 支付弹窗 */}
      <QRPaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        amount={unlockPrice}
        description="解锁完整分析报告"
        readingId={readingId}
        onSuccess={() => {
          // 刷新页面状态
          window.location.reload()
        }}
      />
    </div>
  )
}
```

---

## 四、安全机制说明

### 已实现的安全措施

| 功能 | 说明 |
|-----|------|
| **订单过期** | 30分钟自动过期，防止占单 |
| **订单状态管理** | pending → processing → paid/cancelled |
| **防重复支付** | 同一订单只能支付一次 |
| **支付验证** | 提交截图后需要系统确认 |
| **订单号生成** | 唯一随机订单号，防止猜测 |
| **金额验证** | 单笔不超过5万元 |

### 支付流程

```
1. 用户下单 → 创建订单（30分钟有效期）
      ↓
2. 展示收款码 → 用户扫码支付
      ↓
3. 用户点击「已完成支付」→ 提交验证
      ↓
4. 系统等待确认（轮询检查）
      ↓
5. 管理员确认收款 → 解锁内容
```

---

## 五、测试支付

### 开发环境测试

```bash
# 1. 启动后端
cd backend
uvicorn main:app --reload

# 2. 启动前端
cd frontend
npm run dev

# 3. 测试创建订单
curl -X POST http://localhost:8000/api/personal-payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0.01,
    "currency": "CNY_ALIPAY",
    "description": "测试支付"
  }'

# 4. 返回结果
{
  "success": true,
  "order_no": "QR20240508123456ABC12345",
  "amount": 0.01,
  "qr_code_url": "/api/personal-payments/qr/alipay",
  "expires_at": "2024-05-08T12:34:56",
  ...
}
```

### 测试收款码

```bash
# 访问收款码图片
http://localhost:8000/api/personal-payments/qr/alipay
http://localhost:8000/api/personal-payments/qr/wechat
```

---

## 六、上线部署

### 步骤1：上传收款码图片

```bash
# 使用OSS或CDN存储收款码
# 推荐：阿里云OSS、腾讯云COS、七牛云

# 上传后获取公网URL，更新配置
ALIPAY_PERSONAL_QR_URL=https://your-cdn.com/qrcode-alipay.png
WECHAT_PERSONAL_QR_URL=https://your-cdn.com/qrcode-wechat.png
```

### 步骤2：配置生产环境

```bash
# backend/.env（生产环境）
ALIPAY_PERSONAL_QR_URL=https://your-cdn.com/qrcode-alipay.png
WECHAT_PERSONAL_QR_URL=https://your-cdn.com/qrcode-wechat.png
SECRET_KEY=your-production-secret-key
```

### 步骤3：部署后端

```bash
# 如果使用Vercel
vercel deploy

# 如果使用其他平台
# 确保设置了正确的环境变量
```

---

## 七、收款确认流程

### 方式1：手动确认（推荐初期使用）

1. 用户扫码支付后，截图发给你
2. 你核实收款后，调用确认接口：

```bash
# 确认订单
curl -X POST "http://localhost:8000/api/personal-payments/confirm?order_no=QR20240508123456"
```

3. 系统自动解锁对应内容

### 方式2：定期对账（推荐）

1. 每天/每周对账一次
2. 查看所有 `processing` 状态的订单
3. 对照支付宝/微信账单确认
4. 批量调用确认接口

```sql
-- 查看待确认订单
SELECT * FROM orders WHERE status = 'processing';

-- 查看已支付订单
SELECT * FROM orders WHERE status = 'paid';
```

---

## 八、常见问题

### Q: 收款码图片显示不出来？

**解决方案：**
1. 检查图片路径是否正确
2. 确保图片在 `frontend/public/` 目录下
3. 检查 `.env` 中的URL配置

### Q: 订单一直显示等待确认？

**解决方案：**
1. 检查你是否收到款项
2. 调用确认接口：
   ```bash
   curl -X POST "http://localhost:8000/api/personal-payments/confirm?order_no=你的订单号"
   ```
3. 确认订单状态已更新

### Q: 支付金额不对怎么办？

**解决方案：**
- 订单创建后金额不可修改
- 订单过期后会自动取消
- 用户需要重新下单

### Q: 如何查看收款记录？

**解决方案：**
```sql
-- 查看所有订单
SELECT * FROM orders ORDER BY created_at DESC;

-- 查看指定用户的订单
SELECT * FROM orders WHERE user_id = 'xxx';

-- 查看今日收款
SELECT * FROM orders
WHERE status = 'paid'
AND DATE(paid_at) = DATE('now');
```

---

## 九、重要提醒

### ⚠️ 风险提醒

1. **个人收款码有日限额**
   - 支付宝：一般5000元/天
   - 微信：一般5000-10000元/天
   - 超过限额无法收款

2. **大额收款风险**
   - 单月超过10万可能被风控
   - 可能需要提供交易证明

3. **税务风险**
   - 个人收款用于经营 = 偷税漏税
   - 建议：尽早注册个体工商户

4. **无发票能力**
   - 个人收款无法开具发票
   - 如果客户需要发票，需要公司账户

### ✅ 建议

1. **初期**：用个人收款码测试市场
2. **1-2个月后**：注册个体工商户
3. **正规运营**：使用商家收款码

---

## 十、技术支持

如有问题，检查以下文件：

| 文件 | 用途 |
|-----|------|
| `backend/api/routers/personal_payments.py` | 支付后端逻辑 |
| `frontend/src/components/payment/QRPaymentModal.tsx` | 支付前端组件 |
| `backend/config.py` | 配置参数 |
| `backend/.env` | 环境变量 |
