"""
api/routers/billing.py — 全渠道动态定价与星尘充值引擎
- GET  /geo-config          地理位置感知定价分流
- POST /redeem              卡密/兑换码验证
- POST /verify-tx           USDT 链上哈希自动校验
- POST /webhooks/paypal     PayPal Webhook 接收
"""
from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import (
    User, Order, RedeemCode, CryptoOrder, CreditTransaction, OrderStatus,
)
from auth.dependencies import get_current_user, require_user
from config import get_settings

logger = logging.getLogger("billing")

# ── USDT 链上交易时间窗口校验 ───────────────────────────────────────────────
# 用户提交的交易哈希，链上 timestamp 必须在此时间窗口内
# 48 小时：给用户充足时间提交，同时防止重放旧交易
TX_MAX_AGE_SECONDS = 48 * 3600  # 48 hours

router = APIRouter()            # /api/billing/*
webhook_router = APIRouter()    # /api/webhooks/*

settings = get_settings()

# ── PayPal Webhook IP Whitelist ──────────────────────────────────────────────
# PayPal publishes their IP ranges: https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-headers/
# These are the known PayPal webhook source IPs (as of 2024).
PAYPAL_IP_PREFIXES = [
    "173.0.80.", "173.0.81.", "173.0.82.", "173.0.83.",
    "173.0.84.", "173.0.85.", "173.0.86.", "173.0.87.",
    "173.0.88.", "173.0.89.", "173.0.90.", "173.0.91.",
    "173.0.92.", "173.0.93.", "173.0.94.", "173.0.95.",
]

# ── Redeem Code Rate Limiting ────────────────────────────────────────────────
from collections import defaultdict
_redeem_rate_store: dict[str, list[float]] = defaultdict(list)


# ═══════════════════════════════════════════════════════════════════════════════
#  Tron Address Helpers — Base58Check ↔ Hex 转换
# ═══════════════════════════════════════════════════════════════════════════════

_B58_ALPHABET = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def _b58decode(s: str) -> bytes:
    """Minimal Base58 decode (Bitcoin/Tron alphabet)."""
    n = 0
    for c in s.encode("ascii"):
        n = n * 58 + _B58_ALPHABET.index(c)
    # Leading '1' chars map to 0x00 padding bytes
    pad = len(s) - len(s.lstrip("1"))
    if n == 0:
        return b"\x00" * pad
    result = n.to_bytes((n.bit_length() + 7) // 8, "big")
    return b"\x00" * pad + result


def _tron_base58_to_hex(addr: str) -> str:
    """
    Convert Tron Base58Check address (T-prefix) to hex string (42 chars, starts with 41).
    Example: "Txxx..." → "41xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    """
    decoded = _b58decode(addr)
    # decoded = 25 bytes: 1 version (0x41) + 20 address + 4 checksum
    return decoded[:21].hex()


# Pre-compute USDT TRC20 contract in hex for direct comparison with TronGrid API responses
USDT_TRC20_CONTRACT_HEX = _tron_base58_to_hex("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")


# ═══════════════════════════════════════════════════════════════════════════════
#  Module 2: Geo-Config — 地理位置定价分流
# ═══════════════════════════════════════════════════════════════════════════════

# ── 定价表 (server-side, 客户端不可篡改) ─────────────────────────────────────
CN_PACKAGES = [
    {"id": "stardust_100",  "stardust": 100,  "price": 9.9,  "popular": False},
    {"id": "stardust_500",  "stardust": 500,  "price": 39.9, "popular": True},
    {"id": "stardust_1000", "stardust": 1000, "price": 69.9, "popular": False},
    {"id": "stardust_3000", "stardust": 3000, "price": 189.0, "popular": False},
]

GLOBAL_PACKAGES = [
    {"id": "stardust_100",  "stardust": 100,  "price": 1.99, "popular": False},
    {"id": "stardust_500",  "stardust": 500,  "price": 7.99,  "popular": True},
    {"id": "stardust_1000", "stardust": 1000, "price": 14.99, "popular": False},
    {"id": "stardust_3000", "stardust": 3000, "price": 39.99, "popular": False},
]

# ── 每个套餐对应的 PayPal custom_id（传给 PayPal custom 字段用于回调匹配）──
PACKAGE_STARDUST_MAP = {pkg["id"]: pkg["stardust"] for pkg in GLOBAL_PACKAGES + CN_PACKAGES}


def _detect_country(request: Request) -> str:
    """
    三级降级识别用户国家代码:
    1. Vercel/Cloudflare 边缘节点注入的请求头
    2. Nginx 透传的 X-Forwarded-For → geoip-lite 本地解析
    3. Accept-Language 兜底
    """
    # 第一判定链路: Vercel / Cloudflare 边缘节点
    country = (
        request.headers.get("x-vercel-ip-country")
        or request.headers.get("cf-ipcountry")
        or ""
    ).upper()

    # 第二判定链路: 真实 IP → geoip-lite 本地解析
    if not country:
        forwarded = request.headers.get("x-forwarded-for", "")
        real_ip = forwarded.split(",")[0].strip() if forwarded else ""
        if real_ip and real_ip not in ("127.0.0.1", "::1", ""):
            try:
                import geoip2.database as _geoip_db
                import geoip2.errors as _geoip_errors
                reader = _geoip_db.Reader("/usr/share/GeoIP/GeoLite2-Country.mmdb")
                resp = reader.country(real_ip)
                country = (resp.country.iso_code or "").upper()
            except Exception:
                pass  # geoip 库不可用，继续降级

    # 第三判定链路: Accept-Language 兜底
    if not country:
        lang = request.headers.get("accept-language", "")
        if lang.startswith("zh"):
            country = "CN"
        else:
            country = "US"

    return country


@router.get("/geo-config")
async def geo_config(
    request: Request,
):
    """
    地理位置感知定价分流 — 根据 IP 返回对应区域的定价与支付通道。
    SECURITY: region_override removed to prevent geo-pricing bypass.
    国内(CN): 人民币 + 爱发电/卡密
    海外: 美元 + PayPal/USDT
    """
    country = _detect_country(request)

    if country == "CN":
        return {
            "region": "CN",
            "currency": "CNY",
            "symbol": "￥",
            "packages": CN_PACKAGES,
            "channels": ["REDEEM", "AIFADIAN"],
            "aifadian_url": settings.AIFADIAN_URL or "https://afdian.com",
        }
    else:
        wallet_addrs = {}
        if settings.USDT_TRC20_ADDRESS:
            wallet_addrs["TRC20"] = settings.USDT_TRC20_ADDRESS
        if settings.USDT_ARBITRUM_ADDRESS:
            wallet_addrs["ARBITRUM"] = settings.USDT_ARBITRUM_ADDRESS

        return {
            "region": "GLOBAL",
            "currency": "USD",
            "symbol": "$",
            "packages": GLOBAL_PACKAGES,
            "channels": ["PAYPAL", "USDT"],
            "crypto_rate": {"USDT": settings.USDT_GRANT_RATE},
            "wallet_addresses": wallet_addrs,
        }


# ═══════════════════════════════════════════════════════════════════════════════
#  Module 3.1: Redeem — 卡密/兑换码验证
# ═══════════════════════════════════════════════════════════════════════════════

class RedeemRequest(BaseModel):
    code: str


@router.post("/redeem")
async def redeem_code(
    req: RedeemRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
    request: Request = None,
):
    """
    卡密兑换 — 事务中原子操作：
    悲观锁锁定卡密 → 校验有效性 → 标记已用 → 增加星尘余额
    """
    # ── SECURITY: Rate limit redeem attempts per user ──
    import time as _time
    now = _time.time()
    window = 60  # 1 minute
    rate_key = f"redeem:{current_user.id}"
    _redeem_rate_store[rate_key] = [t for t in _redeem_rate_store[rate_key] if t > now - window]
    if len(_redeem_rate_store[rate_key]) >= 5:
        raise HTTPException(status_code=429, detail="兑换尝试过于频繁，请稍后再试")
    _redeem_rate_store[rate_key].append(now)

    code_str = req.code.strip().upper()
    if not code_str or len(code_str) < 4:
        raise HTTPException(status_code=400, detail="请输入有效的兑换码")

    # 1. 悲观锁: SELECT ... FOR UPDATE
    result = await db.execute(
        select(RedeemCode)
        .where(RedeemCode.code == code_str)
        .with_for_update()
    )
    redeem = result.scalar_one_or_none()

    if not redeem:
        raise HTTPException(status_code=404, detail="兑换码不存在，请核对后重试")

    if redeem.is_used:
        raise HTTPException(status_code=400, detail="此兑换码已被使用")

    # 2. 标记已使用
    redeem.is_used = True
    redeem.used_by_user_id = current_user.id
    redeem.used_at = datetime.now(timezone.utc)

    # 3. 原子增加用户星尘余额（悲观锁用户行）
    user_result = await db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    )
    user = user_result.scalar_one()

    grant_amount = redeem.stardust_amount
    user.stardust_balance += grant_amount
    user.stardust_lifetime_earned += grant_amount

    # 4. 创建星尘流水
    tx = CreditTransaction(
        user_id=user.id,
        amount=grant_amount,
        balance_after=user.stardust_balance,
        reason="redeem_code",
        reference_id=redeem.id,
        status="confirmed",
    )
    db.add(tx)
    await db.commit()

    logger.info(
        f"[REDEEM] 用户 {user.id} 兑换卡密 {code_str[:4]}****, "
        f"获得 {grant_amount} 星尘, 余额 {user.stardust_balance}"
    )

    return {
        "success": True,
        "stardust_granted": grant_amount,
        "balance_after": user.stardust_balance,
        "message": f"兑换成功！获得 {grant_amount} 颗星尘",
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  Module 3.3: Verify-TX — USDT 链上哈希自动校验
# ═══════════════════════════════════════════════════════════════════════════════

class VerifyTxRequest(BaseModel):
    tx_id: str
    network: str  # "TRC20" | "ARBITRUM"


# ── TRC20 校验 ────────────────────────────────────────────────────────────────

async def _fetch_trc20_tx(tx_id: str) -> dict:
    """通过 TronGrid API 获取 TRC20 交易详情"""
    headers = {}
    if settings.TRONGRID_API_KEY:
        headers["TRON-PRO-API-KEY"] = settings.TRONGRID_API_KEY

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            "https://api.trongrid.io/wallet/gettransactionbyid",
            json={"value": tx_id},
            headers=headers,
        )
        resp.raise_for_status()
        return resp.json()


def _parse_trc20_usdt_transfer(tx_data: dict) -> Optional[dict]:
    """
    从 TRC20 交易中解析 USDT 转账信息。
    返回 { to_address_hex, amount_usdt } 或 None。
    to_address_hex 为 21 字节 Tron hex 格式 (42 chars, starts with 41)。
    """
    # 1. 检查交易是否成功
    ret_list = tx_data.get("ret", [])
    if not ret_list or ret_list[0].get("contractRet") != "SUCCESS":
        return None

    # 2. 检查是否是 USDT 合约调用
    raw_data = tx_data.get("raw_data", {})
    contract = raw_data.get("contract", [{}])
    if not contract:
        return None

    contract_info = contract[0]
    if contract_info.get("type") != "TriggerSmartContract":
        return None

    param = contract_info.get("parameter", {}).get("value", {})
    contract_address = param.get("contract_address", "")

    # 验证是 USDT 合约 — 两边都用 hex 格式比较
    # TronGrid API 返回的 contract_address 是 hex 格式 (如 "41a614...")
    contract_hex = contract_address.replace("0x", "").lower()
    if contract_hex != USDT_TRC20_CONTRACT_HEX.lower():
        return None

    # 3. 解析 contract data
    #    TRC20 transfer(address,uint256) 的 data 格式:
    #    4 bytes method id (a9059cbb) + 32 bytes address (padded) + 32 bytes amount
    data = param.get("data", "")
    # Without 0x prefix: 8(method) + 64(address) + 64(amount) = 136 hex chars
    if not data or len(data) < 136:
        return None

    # 去掉 0x 前缀和 method id
    if data.startswith("0x"):
        data_hex = data[2:]     # skip "0x"
    else:
        data_hex = data
    data_hex = data_hex[8:]     # skip method id "a9059cbb" (8 hex chars)

    # 提取 to_address: 32 bytes ABI-encoded, last 20 bytes are the actual address
    # Prepend Tron version byte 0x41 to get full 21-byte hex address
    to_addr_20bytes = data_hex[24:64]  # 40 hex chars = 20 bytes
    to_address_hex = "41" + to_addr_20bytes  # 42 hex chars = 21 bytes (full Tron hex)

    # 提取 amount
    amount_hex = data_hex[64:128]
    amount_raw = int(amount_hex, 16)
    amount_usdt = amount_raw / 1e6  # USDT 6 位精度

    return {
        "to_address_hex": to_address_hex.lower(),
        "amount_usdt": amount_usdt,
    }


async def _verify_trc20_tx(tx_id: str) -> dict:
    """
    TRC20 USDT 交易全链路校验。
    返回 { amount_usdt, network } 或抛出 HTTPException。
    """
    tx_data = await _fetch_trc20_tx(tx_id)

    # 检查交易是否存在
    if not tx_data or tx_data.get("Error"):
        raise HTTPException(status_code=400, detail="链上未找到此交易，请确认 TxID 是否正确")

    parsed = _parse_trc20_usdt_transfer(tx_data)
    if not parsed:
        raise HTTPException(status_code=400, detail="此交易不是有效的 USDT 转账")

    # 校验收款地址 — 两边都用 hex 格式比较
    # parsed["to_address_hex"] 已经是 42 hex chars (41 + 20 bytes)
    # 将配置的 Base58Check 地址转为 hex 进行比较
    expected_hex = _tron_base58_to_hex(settings.USDT_TRC20_ADDRESS).lower()
    actual_hex = parsed["to_address_hex"].lower()

    if actual_hex != expected_hex:
        raise HTTPException(
            status_code=400,
            detail="收款地址不匹配，请确认转账目标地址正确"
        )

    # 校验交易时间戳 — 防止重放旧交易
    raw_data = tx_data.get("raw_data", {})
    tx_timestamp_ms = raw_data.get("timestamp")
    if tx_timestamp_ms:
        tx_time = tx_timestamp_ms / 1000  # milliseconds → seconds
        now = time.time()
        if now - tx_time > TX_MAX_AGE_SECONDS:
            raise HTTPException(
                status_code=400,
                detail="此交易时间过久，请重新发起一笔转账（48小时内有效）"
            )
        if tx_time > now + 300:  # 允许 5 分钟时钟偏差
            raise HTTPException(
                status_code=400,
                detail="交易时间异常，请检查链上状态后重试"
            )

    if parsed["amount_usdt"] <= 0:
        raise HTTPException(status_code=400, detail="转账金额为 0")

    return {
        "amount_usdt": round(parsed["amount_usdt"], 6),
        "network": "TRC20",
    }


# ── Arbitrum (EVM) 校验 ──────────────────────────────────────────────────────

USDT_ARBITRUM_CONTRACT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"  # Arbitrum USDT

async def _verify_arbitrum_tx(tx_id: str) -> dict:
    """
    Arbitrum USDT (ERC-20) 交易全链路校验。
    使用公共 RPC 读取交易收据, 校验 Log events。
    """
    rpc_url = "https://arb-mainnet.g.alchemy.com/v2/demo"  # 公共 fallback

    async with httpx.AsyncClient(timeout=15) as client:
        # 获取交易详情
        tx_resp = await client.post(rpc_url, json={
            "jsonrpc": "2.0",
            "method": "eth_getTransactionByHash",
            "params": [tx_id],
            "id": 1,
        })
        tx_data = tx_resp.json().get("result")

        if not tx_data:
            raise HTTPException(status_code=400, detail="链上未找到此交易，请确认 TxID 是否正确")

        # 获取交易收据（包含 logs/events）
        receipt_resp = await client.post(rpc_url, json={
            "jsonrpc": "2.0",
            "method": "eth_getTransactionReceipt",
            "params": [tx_id],
            "id": 2,
        })
        receipt = receipt_resp.json().get("result")

        if not receipt or receipt.get("status") != "0x1":
            raise HTTPException(status_code=400, detail="交易失败或状态异常")

    # 解析 USDT Transfer event (topic[0] = Transfer(address,address,uint256))
    transfer_topic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    usdt_contract = USDT_ARBITRUM_CONTRACT.lower()

    logs = receipt.get("logs", [])
    usdt_logs = [
        log for log in logs
        if log.get("address", "").lower() == usdt_contract
        and len(log.get("topics", [])) >= 3
        and log["topics"][0] == transfer_topic
    ]

    if not usdt_logs:
        raise HTTPException(status_code=400, detail="交易中未发现 USDT Transfer 事件")

    # 解析转入金额
    best_log = None
    best_amount = 0

    for log in usdt_logs:
        to_addr = "0x" + log["topics"][2][-40:]
        if to_addr.lower() != settings.USDT_ARBITRUM_ADDRESS.lower():
            continue
        amount_raw = int(log["data"], 16)
        if amount_raw > best_amount:
            best_amount = amount_raw
            best_log = log

    if not best_log:
        raise HTTPException(
            status_code=400,
            detail="未找到转入目标地址的 USDT 转账记录"
        )

    # 校验交易时间戳 — 防止重放旧交易
    tx_timestamp_hex = tx_data.get("timestamp")
    if tx_timestamp_hex:
        try:
            tx_time = int(tx_timestamp_hex, 16)  # hex → int (seconds)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400,
                detail="交易时间戳格式异常，请确认 TxID 正确"
            )
        now = time.time()
        if now - tx_time > TX_MAX_AGE_SECONDS:
            raise HTTPException(
                status_code=400,
                detail="此交易时间过久，请重新发起一笔转账（48小时内有效）"
            )
        if tx_time > now + 300:  # 允许 5 分钟时钟偏差
            raise HTTPException(
                status_code=400,
                detail="交易时间异常，请检查链上状态后重试"
            )

    amount_usdt = best_amount / 1e6  # USDT 6 位精度

    return {
        "amount_usdt": round(amount_usdt, 6),
        "network": "ARBITRUM",
    }


# ── verify-tx 主端点 ─────────────────────────────────────────────────────────

@router.post("/verify-tx")
async def verify_crypto_tx(
    req: VerifyTxRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """
    USDT 链上哈希自动校验 — 后端闭环验证:
    1. 数据库去重 (防同一笔链上转账被重复提交)
    2. 链上 RPC 校验 (交易状态、收款地址、Token 金额)
    3. 原子发放星尘
    """
    tx_id = req.tx_id.strip()
    network = req.network.upper()

    if network not in ("TRC20", "ARBITRUM"):
        raise HTTPException(status_code=400, detail="不支持的网络类型，请选择 TRC20 或 ARBITRUM")

    if not tx_id or len(tx_id) < 10:
        raise HTTPException(status_code=400, detail="请输入有效的交易哈希")

    # 1. 数据库去重 — use pessimistic lock to prevent race conditions
    existing = await db.execute(
        select(CryptoOrder)
        .where(CryptoOrder.tx_id == tx_id)
        .with_for_update()  # Pessimistic lock prevents concurrent double-spend
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="此交易已被处理，请勿重复提交")

    # 2. 链上校验
    if network == "TRC20":
        if not settings.USDT_TRC20_ADDRESS:
            raise HTTPException(status_code=503, detail="TRC20 收款地址未配置")
        verified = await _verify_trc20_tx(tx_id)
    else:
        if not settings.USDT_ARBITRUM_ADDRESS:
            raise HTTPException(status_code=503, detail="Arbitrum 收款地址未配置")
        verified = await _verify_arbitrum_tx(tx_id)

    amount_usdt = verified["amount_usdt"]

    # 3. Minimum amount check — prevent micro-transaction abuse
    MIN_USDT_AMOUNT = 0.5  # Minimum 0.5 USDT to prevent micro-transaction abuse
    if amount_usdt < MIN_USDT_AMOUNT:
        raise HTTPException(status_code=400, detail=f"最低充值金额为 {MIN_USDT_AMOUNT} USDT")

    # 4. 计算星尘发放量
    grant_amount = int(amount_usdt * settings.USDT_GRANT_RATE)
    if grant_amount <= 0:
        raise HTTPException(status_code=400, detail="转账金额过小，不足以兑换星尘")

    # 5. 创建 CryptoOrder (防重入)
    crypto_order = CryptoOrder(
        tx_id=tx_id,
        user_id=current_user.id,
        amount_usdt=amount_usdt,
        network=network,
        stardust_granted=grant_amount,
        status="success",
        verified_at=datetime.now(timezone.utc),
    )
    db.add(crypto_order)

    # 6. 原子发放星尘
    user_result = await db.execute(
        select(User).where(User.id == current_user.id).with_for_update()
    )
    user = user_result.scalar_one()

    user.stardust_balance += grant_amount
    user.stardust_lifetime_earned += grant_amount

    # 7. 创建星尘流水
    tx_record = CreditTransaction(
        user_id=user.id,
        amount=grant_amount,
        balance_after=user.stardust_balance,
        reason="crypto_recharge",
        reference_id=crypto_order.id,
        status="confirmed",
    )
    db.add(tx_record)
    await db.commit()

    logger.info(
        f"[CRYPTO] 用户 {user.id} USDT {amount_usdt} ({network}) → "
        f"{grant_amount} 星尘, 余额 {user.stardust_balance}"
    )

    return {
        "success": True,
        "stardust_granted": grant_amount,
        "amount_usdt": amount_usdt,
        "network": network,
        "balance_after": user.stardust_balance,
        "message": f"链上校验通过！到账 {grant_amount} 颗星尘",
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  Module 3.2: PayPal Webhook — 接收 PAYMENT.SALE.COMPLETED
# ═══════════════════════════════════════════════════════════════════════════════

def _verify_paypal_webhook_signature(body: bytes, headers: dict) -> bool:
    """
    Verify PayPal webhook signature using PayPal's verify API.
    Returns True only if PayPal confirms the signature is valid.
    """
    transmission_id = headers.get("paypal-transmission-id", "")
    transmission_time = headers.get("paypal-transmission-time", "")
    cert_url = headers.get("paypal-cert-url", "")
    actual_sig = headers.get("paypal-transmission-sig", "")
    auth_algo = headers.get("paypal-auth-algo", "")

    if not all([transmission_id, transmission_time, cert_url, actual_sig, auth_algo]):
        return False

    if not settings.PAYPAL_WEBHOOK_ID:
        logger.error("[SECURITY] PAYPAL_WEBHOOK_ID is not configured — cannot verify webhook signatures")
        return False

    # Call PayPal's verify endpoint
    try:
        payload = {
            "transmission_id": transmission_id,
            "transmission_time": transmission_time,
            "cert_url": cert_url,
            "actual_sig": actual_sig,
            "auth_algo": auth_algo,
            "webhook_id": settings.PAYPAL_WEBHOOK_ID,
            "request_body": body.decode("utf-8"),
        }
        base_url = "https://api-m.sandbox.paypal.com" if settings.PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com"
        resp = httpx.post(
            f"{base_url}/v1/notifications/verify-webhook-signature",
            json=payload,
            auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET),
            timeout=10,
        )
        return resp.status_code == 200 and resp.json().get("verification_status") == "SUCCESS"
    except Exception as e:
        logger.error(f"[SECURITY] PayPal webhook verification error: {e}")
        return False


@webhook_router.post("/paypal")
async def paypal_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    PayPal Webhook 接收端 — 监听 PAYMENT.SALE.COMPLETED 事件。
    幂等性: 通过 sale_id 去重。
    """
    # ── SECURITY: Verify source IP against PayPal's known ranges ──
    client_ip = request.client.host if request.client else ""
    ip_allowed = any(client_ip.startswith(prefix) for prefix in PAYPAL_IP_PREFIXES)
    if not ip_allowed:
        # Also check X-Forwarded-For (for proxy setups)
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            first_ip = forwarded.split(",")[0].strip()
            ip_allowed = any(first_ip.startswith(prefix) for prefix in PAYPAL_IP_PREFIXES)
    if not ip_allowed:
        logger.warning(f"[SECURITY] PayPal webhook from non-whitelisted IP: {client_ip}")
        raise HTTPException(status_code=403, detail="Webhook source not allowed")

    body = await request.body()
    data = await request.json()

    event_type = data.get("event_type", "")

    if event_type != "PAYMENT.SALE.COMPLETED":
        # 非目标事件, 返回 200 (PayPal 要求对未知事件返回 200)
        return {"status": "ignored", "event_type": event_type}

    # Signature verification — always verify, both sandbox and live
    headers_dict = dict(request.headers)
    if not _verify_paypal_webhook_signature(body, headers_dict):
        logger.warning("[SECURITY] PayPal webhook signature verification failed")
        raise HTTPException(status_code=403, detail="Webhook signature verification failed")

    # 解析事件
    resource = data.get("resource", {})
    sale_id = resource.get("id", "")

    # 幂等性: 检查此 sale_id 是否已处理
    existing = await db.execute(
        select(CreditTransaction).where(
            CreditTransaction.reason == "paypal_recharge",
            CreditTransaction.reference_id == sale_id,
        )
    )
    if existing.scalar_one_or_none():
        return {"status": "already_processed", "sale_id": sale_id}

    # 提取金额和用户
    amount_str = resource.get("amount", {}).get("total", "0")
    currency = resource.get("amount", {}).get("currency", "USD")

    # custom 字段包含 userId（创建 PayPal 订单时传入的 custom_id）
    custom_id = ""
    # PayPal v2: custom_id 在 purchase_units 中
    purchase_units_data = data.get("resource", {}).get("purchase_units", [])
    if purchase_units_data:
        custom_id = purchase_units_data[0].get("custom_id", "")
    if not custom_id:
        custom_id = resource.get("custom", "") or data.get("resource", {}).get("custom_id", "")

    if not custom_id or not sale_id:
        logger.warning(f"[PAYPAL-WEBHOOK] Missing custom_id or sale_id: custom={custom_id}, sale={sale_id}")
        return {"status": "missing_data", "sale_id": sale_id}

    # 查找用户（悲观锁）
    user_result = await db.execute(
        select(User).where(User.id == custom_id).with_for_update()
    )
    user = user_result.scalar_one_or_none()
    if not user:
        logger.warning(f"[PAYPAL-WEBHOOK] User not found: {custom_id}")
        return {"status": "user_not_found", "sale_id": sale_id}

    # 计算星尘
    amount_usd = float(amount_str)
    grant_amount = int(amount_usd * settings.PAYPAL_GRANT_RATE)

    # 发放星尘
    user.stardust_balance += grant_amount
    user.stardust_lifetime_earned += grant_amount

    tx = CreditTransaction(
        user_id=user.id,
        amount=grant_amount,
        balance_after=user.stardust_balance,
        reason="paypal_recharge",
        reference_id=sale_id,
        status="confirmed",
    )
    db.add(tx)

    # ── 查找关联订单，根据 item_type 激活对应权益 ──────────────────────────
    # PayPal reference_id 对应我们的 order_no
    order_no = purchase_units_data[0].get("reference_id", "") if purchase_units_data else ""
    item_type = ""
    if order_no:
        order_result = await db.execute(
            select(Order).where(Order.order_no == order_no)
        )
        order = order_result.scalar_one_or_none()
        if order:
            order.status = OrderStatus.paid
            order.paid_at = datetime.now(timezone.utc)
            # 从 notes 中解析 item_type (格式: "item_type:xxx|reading_id:xxx")
            if order.notes and "item_type:" in order.notes:
                item_type = order.notes.split("item_type:")[1].split("|")[0]

    # 根据 item_type 激活对应权益
    if item_type in ("premium_monthly", "premium_yearly"):
        # 订阅激活
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        if item_type == "premium_yearly":
            expires = now + timedelta(days=365)
            free_events = 5
        else:
            expires = now + timedelta(days=30)
            free_events = 2
        user.is_premium = True
        user.subscription_tier = item_type
        user.premium_expires_at = expires
        user.free_event_quota = free_events
        user.free_event_quota_reset_at = now + timedelta(days=30)
        logger.info(f"[PAYPAL-WEBHOOK] 激活订阅: 用户 {user.id}, {item_type}")
    elif item_type == "unlock_report":
        # 解锁报告 — 通过 order.notes 获取 reading_id
        reading_id = ""
        if order_no and order and order.notes and "reading_id:" in order.notes:
            reading_id = order.notes.split("reading_id:")[-1]
        if reading_id:
            from sqlalchemy import update as sa_update
            await db.execute(
                sa_update(CreditTransaction.__table__).where(
                    CreditTransaction.user_id == user.id,
                    CreditTransaction.reason == "report_unlock_grant",
                    CreditTransaction.reference_id == reading_id,
                ).values(status="confirmed")
            )
        logger.info(f"[PAYPAL-WEBHOOK] 报告解锁: 用户 {user.id}, reading {reading_id}")
    elif item_type == "founder_lifetime":
        # 创始席位 — 需要调用激活逻辑
        logger.info(f"[PAYPAL-WEBHOOK] 创始席位: 用户 {user.id} (需手动激活)")

    await db.commit()

    logger.info(
        f"[PAYPAL-WEBHOOK] 用户 {user.id} PayPal ${amount_usd} ({currency}) → "
        f"{grant_amount} 星尘, 余额 {user.stardust_balance}"
    )

    return {
        "status": "success",
        "sale_id": sale_id,
        "stardust_granted": grant_amount,
    }
