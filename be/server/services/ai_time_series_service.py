import os
import joblib
import numpy as np
import pandas as pd
from configs.gemini import generate_sales_insight

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "ai", "models")
DATA_PATH = os.path.join(BASE_DIR, "ai", "data", "new_retail_sales_augmented.csv")

df = pd.read_csv(DATA_PATH)
df["Date"] = pd.to_datetime(df["Date"])

def get_customer_distribution(category):
    data = df[df["Product Category"] == category].copy()
    gender_dist = data["Gender"].value_counts(normalize=True).to_dict()
    
    bins = [0, 25, 35, 45, 100]
    labels = ["18-25", "26-35", "36-45", "46+"]
    data["Age Group"] = pd.cut(data["Age"], bins=bins, labels=labels)
    age_dist = data["Age Group"].value_counts(normalize=True).to_dict()
    
    return gender_dist, age_dist

def load_model(category):
    model_path = os.path.join(MODEL_DIR, f"{category}_prophet.pkl")
    saved_data = joblib.load(model_path)
    return saved_data['model'], saved_data['floor']

def build_forecast_results(forecast, weeks):
    result = forecast[["ds", "yhat"]].tail(weeks)
    results = []
    for i, (_, row) in enumerate(result.iterrows(), start=1):
        results.append({
            "date": str(row.ds.date()),
            "sales": round(float(row.yhat), 2),
            "week_offset": i,
            "label": f"Prediksi Minggu ke-{i} ke depan"
        })
    return results

def forecast_with_insight(category, weeks):
    model, floor_val = load_model(category)
    
    future = model.make_future_dataframe(periods=weeks, freq='W')
    
    category_yearly_trend = {
        'Electronics': {2023: 1.00, 2024: 1.12, 2025: 0.95, 2026: 0.90},
        'Clothing':    {2023: 1.00, 2024: 1.18, 2025: 1.05, 2026: 0.92},
        'Beauty':      {2023: 1.00, 2024: 1.20, 2025: 1.10, 2026: 1.03},
    }
    
    future_years = future['ds'].dt.year
    trend_factors = future_years.map(category_yearly_trend.get(category, {}))
    
    crisis_factors = np.where(future['ds'] >= '2026-01-01', 0.88,
                     np.where(future['ds'] >= '2025-07-01', 0.95, 1.0))
    
    future['macro_multiplier'] = trend_factors * crisis_factors
    
    forecast = model.predict(future)
    forecast['yhat'] = np.clip(forecast['yhat'], floor_val, None)
    
    forecast_results = build_forecast_results(forecast, weeks)
    gender_dist, age_dist = get_customer_distribution(category)

    result_data = {
        "category": category,
        "insight": {
            "gender_distribution": gender_dist,
            "age_distribution": age_dist
        },
        "forecast": forecast_results
    }

    first_sales = forecast_results[0]['sales']
    last_sales = forecast_results[-1]['sales']
    trend_status = "MENINGKAT" if last_sales >= first_sales else "MENURUN"
    
    forecast_summary = f"Minggu ke-1: {first_sales}, Minggu terakhir: {last_sales}"

    try:
        result_data["description"] = generate_sales_insight(result_data)
    except Exception as e:
        result_data["description"] = f"Gagal generate insight AI: {e}"

    result_data["trend_status"] = trend_status
    result_data["forecast_summary"] = forecast_summary

    return result_data