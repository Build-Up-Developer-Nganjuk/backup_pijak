from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.ai_time_series_route import router as time_series_router

app = FastAPI(
    title="AI Sales Forecast API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    time_series_router,
    prefix="/api/time-series",
    tags=["Time Series"]
)