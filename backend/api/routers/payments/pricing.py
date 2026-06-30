"""Public pricing catalog endpoints."""

from fastapi import APIRouter, Depends, Request

from auth.dependencies import get_current_user
from database.models import User
from services.pricing import public_catalog, resolve_pricing_region

router = APIRouter()


@router.get("/pricing/catalog")
async def get_pricing_catalog(
    request: Request,
    current_user: User | None = Depends(get_current_user),
):
    region = resolve_pricing_region(request, current_user)
    return public_catalog(region)
