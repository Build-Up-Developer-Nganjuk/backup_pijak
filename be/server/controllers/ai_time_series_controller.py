from services.ai_time_series_service import forecast_with_insight

def forecast_controller(category: str, weeks: int):
    return forecast_with_insight(category, weeks)