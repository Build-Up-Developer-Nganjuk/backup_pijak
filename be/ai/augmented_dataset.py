import pandas as pd
import numpy as np

np.random.seed(42)

df_orig = pd.read_csv('ai/data/retail_sales_dataset.csv')
df_orig['Date'] = pd.to_datetime(df_orig['Date'])

start_date = pd.to_datetime('2023-01-01')
end_date   = pd.to_datetime('2026-04-30')
date_range = pd.date_range(start=start_date, end=end_date, freq='D')

categories = ['Beauty', 'Electronics', 'Clothing'] 

gender_weights = {
    'Beauty':      {'Male': 0.25, 'Female': 0.75},
    'Electronics': {'Male': 0.65, 'Female': 0.35},
    'Clothing':    {'Male': 0.45, 'Female': 0.55},
}

age_params = {
    'Beauty':      {'mean': 27, 'std': 5},
    'Electronics': {'mean': 32, 'std': 7},
    'Clothing':    {'mean': 29, 'std': 6},
}

quantity_range = {
    'Electronics': (1, 2),
    'Clothing':    (1, 3),
    'Beauty':      (1, 5),
}

price_range = {
    'Electronics': (200, 1500),
    'Clothing':    (50, 400),
    'Beauty':      (30, 200),
}

category_yearly_trend = {
    'Electronics': {2023: 1.00, 2024: 1.12, 2025: 0.95, 2026: 0.90},
    'Clothing':    {2023: 1.00, 2024: 1.18, 2025: 1.05, 2026: 0.92},
    'Beauty':      {2023: 1.00, 2024: 1.20, 2025: 1.10, 2026: 1.03},
}

def get_crisis_factor(date):
    if date >= pd.to_datetime('2026-01-01'):
        return 0.88
    elif date >= pd.to_datetime('2025-07-01'):
        return 0.95
    else:
        return 1.0 

def get_seasonal_factor(date):
    month = date.month
    day   = date.day
    year  = date.year

    ramadan_ranges = {
        2023: ((3, 22), (4, 20)),
        2024: ((3, 11), (4,  9)),
        2025: ((3,  1), (3, 30)),
        2026: ((2, 18), (3, 19)),
    }
    if year in ramadan_ranges:
        (sm, sd), (em, ed) = ramadan_ranges[year]
        start_r = pd.Timestamp(year, sm, sd)
        end_r   = pd.Timestamp(year, em, ed)
        if start_r <= date <= end_r:
            return 1.25

    if month == 12 and day >= 10:
        return 1.40
    if month == 11 and 9 <= day <= 13:
        return 1.35
    if month == 10 and 8 <= day <= 12:
        return 1.20
    if date.dayofweek >= 5:
        return 1.08

    return 1.0

augmented_rows = []

for current_date in date_range:
    year           = current_date.year
    crisis_factor  = get_crisis_factor(current_date)
    seasonal_factor = get_seasonal_factor(current_date)

    for cat in categories:
        daily_transaction_count = np.random.randint(3, 6)
        trend_factor = category_yearly_trend.get(cat, {}).get(year, 1.0)

        g_weights = gender_weights[cat]
        a_params  = age_params[cat]
        q_min, q_max = quantity_range[cat]
        p_min, p_max = price_range[cat]

        for i in range(daily_transaction_count):
            gender = np.random.choice(
                list(g_weights.keys()),
                p=list(g_weights.values())
            )
            age = max(18, min(60, int(np.random.normal(a_params['mean'], a_params['std']))))
            qty = np.random.randint(q_min, q_max + 1)
            price_unit = np.random.randint(p_min, p_max)

            noise          = np.random.uniform(0.97, 1.03)
            amount_factor  = trend_factor * seasonal_factor * crisis_factor * noise

            adjusted_price = int(price_unit * amount_factor)
            adjusted_price = max(p_min, adjusted_price)
            total_amount   = qty * adjusted_price

            augmented_rows.append({
                'Transaction ID': f'AUG-{current_date.strftime("%Y%m%d")}-{cat[:3].upper()}-{i}',
                'Date':           current_date,
                'Customer ID':    f'CUST-{np.random.randint(10000, 99999)}',
                'Gender':         gender,
                'Age':            age,
                'Product Category': cat,
                'Quantity':       qty,
                'Price per Unit': adjusted_price,
                'Total Amount':   total_amount,
            })

df_aug = pd.DataFrame(augmented_rows)

df_final = df_aug.sort_values('Date').reset_index(drop=True)

df_final['check'] = df_final['Quantity'] * df_final['Price per Unit']
error_count = (df_final['Total Amount'] != df_final['check']).sum()
print("Validasi konsistensi:")
print("Data tidak konsisten:", error_count)
df_final = df_final.drop(columns=['check'])

print("DISTRIBUSI GENDER PER KATEGORI")
print(df_aug.groupby(['Product Category', 'Gender']).size().unstack())

print("RATA-RATA USIA PER KATEGORI")
print(df_aug.groupby('Product Category')['Age'].mean().round(1))

print("RATA-RATA QUANTITY PER KATEGORI")
print(df_aug.groupby('Product Category')['Quantity'].mean().round(2))

print("STATISTIK HARGA PER KATEGORI PER TAHUN")
df_final['Year'] = df_final['Date'].dt.year
print(df_final.groupby(['Product Category', 'Year'])['Price per Unit']
      .agg(['mean', 'min', 'max']).round(0))
df_final = df_final.drop(columns=['Year'])

print("TOTAL AMOUNT PER TAHUN PER KATEGORI")
df_final['Year'] = df_final['Date'].dt.year
print(df_final.groupby(['Year', 'Product Category'])['Total Amount'].sum().unstack().round(0))
df_final = df_final.drop(columns=['Year'])

output_filename = 'ai/data/new_retail_sales_augmented.csv'
df_final.to_csv(output_filename, index=False)

print("Augmentasi Berhasil")
print(f"Total Baris : {len(df_final):,}")
print(f"Rentang     : {df_final['Date'].min().date()} s/d {df_final['Date'].max().date()}")
print(f"File        : {output_filename}")