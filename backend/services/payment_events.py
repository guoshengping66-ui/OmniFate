"""Payment provider event logging and idempotency helpers."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import PaymentEvent


async def record_payment_event(
    db: AsyncSession,
    *,
    provider: str,
    event_id: str,
    event_type: str | None = None,
    order_no: str | None = None,
    payload: dict[str, Any] | None = None,
) -> tuple[PaymentEvent, bool]:
    result = await db.execute(
        select(PaymentEvent).where(
            PaymentEvent.provider == provider,
            PaymentEvent.event_id == event_id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing, False

    event = PaymentEvent(
        provider=provider,
        event_id=event_id,
        event_type=event_type,
        order_no=order_no,
        raw_payload=payload,
        status="received",
    )
    db.add(event)
    await db.flush()
    return event, True


def mark_payment_event_processed(event: PaymentEvent, status: str = "processed") -> None:
    event.status = status
    event.processed_at = datetime.now(timezone.utc)
