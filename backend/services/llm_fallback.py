"""LLM 容灾 Fallback — DeepSeek 主力 + 备用模型自动切换"""
import logging
import time
from typing import Optional

import httpx

from config import get_settings

logger = logging.getLogger("llm_fallback")
settings = get_settings()

# 备用模型列表（按优先级排序）
FALLBACK_MODELS = [
    {"provider": "deepseek", "model": "deepseek-v4-flash", "base_url": "https://api.deepseek.com"},
    {"provider": "openai", "model": "gpt-4o-mini", "base_url": "https://api.openai.com/v1"},
    {"provider": "anthropic", "model": "claude-haiku-4-5-20251001", "base_url": "https://api.anthropic.com"},
]

# 限流/超时状态追踪
_circuit_breaker: dict[str, dict] = {}  # model_key → {"failures": int, "opened_at": float}
FAILURE_THRESHOLD = 3
CIRCUIT_BREAKER_TTL = 300  # 5 分钟后自动恢复


def _get_model_status(model_key: str) -> str:
    """检查熔断器状态"""
    state = _circuit_breaker.get(model_key)
    if not state:
        return "closed"
    if time.time() - state["opened_at"] > CIRCUIT_BREAKER_TTL:
        del _circuit_breaker[model_key]
        return "closed"
    return "open"


def _record_failure(model_key: str):
    state = _circuit_breaker.get(model_key, {"failures": 0, "opened_at": 0})
    state["failures"] += 1
    if state["failures"] >= FAILURE_THRESHOLD:
        state["opened_at"] = time.time()
        logger.warning(f"[FALLBACK] 模型 {model_key} 熔断开启，等待 {CIRCUIT_BREAKER_TTL}s")
    _circuit_breaker[model_key] = state


def _record_success(model_key: str):
    _circuit_breaker.pop(model_key, None)


def _get_api_key(provider: str) -> Optional[str]:
    if provider == "deepseek":
        return settings.OPENAI_API_KEY
    elif provider == "openai":
        return settings.OPENAI_API_KEY  # 可替换为独立 key
    elif provider == "anthropic":
        return settings.OPENAI_API_KEY  # 可替换为独立 key
    return None


async def generate_with_fallback(
    messages: list[dict],
    temperature: float = 0.3,
    max_tokens: int = 4096,
    primary_model: Optional[str] = None,
) -> dict:
    """
    带容灾的 LLM 调用
    返回: {"content": str, "model_used": str, "retried": bool}
    """
    models_to_try = []

    # 主力模型
    pm = primary_model or settings.OPENAI_MODEL
    models_to_try.append({
        "provider": "deepseek",
        "model": pm,
        "base_url": settings.OPENAI_BASE_URL or "https://api.deepseek.com",
    })

    # 备用模型
    for fb in FALLBACK_MODELS:
        if fb["model"] != pm:
            models_to_try.append(fb)

    last_error = None
    retried = False

    for i, model_cfg in enumerate(models_to_try):
        model_key = f"{model_cfg['provider']}:{model_cfg['model']}"

        # 检查熔断器
        if _get_model_status(model_key) == "open":
            logger.info(f"[FALLBACK] 跳过熔断模型: {model_key}")
            continue

        api_key = _get_api_key(model_cfg["provider"])
        if not api_key:
            continue

        try:
            headers = _build_headers(model_cfg["provider"], api_key)
            body = _build_body(model_cfg, messages, temperature, max_tokens)

            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    f"{model_cfg['base_url']}/chat/completions",
                    headers=headers,
                    json=body,
                )

            if resp.status_code == 429 or resp.status_code >= 500:
                _record_failure(model_key)
                last_error = f"HTTP {resp.status_code}: {resp.text[:200]}"
                logger.warning(f"[FALLBACK] {model_key} 请求失败: {last_error}")
                retried = True
                continue

            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            _record_success(model_key)

            if i > 0:
                logger.info(f"[FALLBACK] 使用备用模型: {model_key}")

            return {
                "content": content,
                "model_used": model_key,
                "retried": retried,
            }

        except httpx.TimeoutException:
            _record_failure(model_key)
            last_error = f"{model_key} 超时"
            logger.warning(f"[FALLBACK] {last_error}")
            retried = True
            continue
        except Exception as e:
            _record_failure(model_key)
            last_error = str(e)
            logger.warning(f"[FALLBACK] {model_key} 异常: {last_error}")
            retried = True
            continue

    raise RuntimeError(f"所有 LLM 模型均不可用，最后错误: {last_error}")


def _build_headers(provider: str, api_key: str) -> dict:
    if provider == "anthropic":
        return {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def _build_body(model_cfg: dict, messages: list[dict], temperature: float, max_tokens: int) -> dict:
    if model_cfg["provider"] == "anthropic":
        # Anthropic 格式转换
        system_msg = ""
        user_msgs = []
        for m in messages:
            if m["role"] == "system":
                system_msg = m["content"]
            else:
                user_msgs.append(m)
        body = {
            "model": model_cfg["model"],
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": user_msgs,
        }
        if system_msg:
            body["system"] = system_msg
        return body

    return {
        "model": model_cfg["model"],
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
