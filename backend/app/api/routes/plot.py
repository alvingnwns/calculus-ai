from __future__ import annotations

from fastapi import APIRouter

from app.api.schemas.requests import PlotRequest, PlotResponse
from app.api.services.plot_engine import build_plot_data

router = APIRouter(prefix="/plot", tags=["plot"])


@router.post("", response_model=PlotResponse)
def plot_data(request: PlotRequest) -> PlotResponse:
    return build_plot_data(request)
