import os
import json
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("API key tidak ditemukan di environment")

client = genai.Client(api_key=api_key)

def generate_sales_insight(data):
    """Membantu memberikan insight awal berbasis data internal"""
    prompt = f"""
    Berikut adalah data prediksi penjualan:
    Kategori: {data['category']}
    Prediksi Penjualan: {data['forecast']}
    Distribusi Gender: {data['insight']['gender_distribution']}
    Distribusi Usia: {data['insight']['age_distribution']}

    Tugas Anda:
    Buatkan analisis singkat dalam bahasa Indonesia yang mencakup:
    1. Tren penjualan ke depan (terperinci, jelas, sesuai urutan, fokus ke pola naik/turun)
    2. Karakteristik customer (berdasarkan data gender & usia)
    3. Rekomendasi bisnis sederhana yang relevan
    4. Berikan analisis SWOT Strengths (Kekuatan), Weaknesses (Kelemahan), Opportunities (Peluang), dan Threats (Ancaman), singkat untuk kategori ini berdasarkan data yang diberikan.

    Ketentuan:
    - Maksimal 10 paragraf. 
    - PERINGATAN: Data ini berskala MINGGUAN. Gunakan istilah "minggu ke-1", "minggu ke-2", dst.
    - STRUKTUR KETAT: DILARANG MENGARANG atau menyebutkan tanggal, nama bulan, atau tahun apa pun secara spesifik (JANGAN gunakan kata seperti "hari", nama-nama bulan, atau angka tahun). Fokus hanya pada urutan minggu numerik (misalnya: "minggu ke-1", "minggu ke-2").
    """
    models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash"]
    for model in models:
        try:
            response = client.models.generate_content(model=model, contents=prompt)
            return response.text
        except APIError:
            continue
    return "Gagal memproses data insight."


async def get_trend_analysis(category: str, trend_status: str, forecast_summary: str):
    """
    NON-STREAM: Ambil analisis tren + Google Search Grounding sekaligus.
    Return: { "text": str, "sources": [{ "title": str, "url": str }] }
    """
    if trend_status == "MENINGKAT":
        instruction = (
            f"Cari mengenai tren item fashion/produk {category} yang saat ini sedang naik daun, "
            f"viral di media sosial, atau banyak dicari pasar global/Indonesia. "
            f"Sebutkan model/jenis spesifik yang wajib distok pedagang."
        )
    else:
        instruction = (
            f"Cari analisis pasar kenapa penjualan kategori {category} secara global atau lokal "
            f"sedang lesu/turun saat ini (faktor musim, tren bergeser, atau ekonomi). "
            f"Sebutkan produk apa yang harus dihindari dan solusi mitigasinya."
        )

    prompt = f"""
Anda adalah Pakar Analis Tren Pasar SMARTSELLER AI.
Kategori Produk: {category}
Status Prediksi Penjualan Internal: {trend_status}
Ringkasan Angka Prediksi Mingguan: {forecast_summary}

Tugas Anda: Hubungkan hasil prediksi internal kami dengan realitas pasar dunia nyata
saat ini berdasarkan instruksi berikut:
{instruction}

Ketentuan:
- Gunakan bahasa Indonesia profesional dan komunikatif.
- Berikan insight yang taktis dan actionable.
- Jangan sebutkan tanggal spesifik, gunakan narasi tren saat ini (Tahun 2026).
"""

    config_with_search = types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        temperature=0.3,
    )

    models = ["gemini-2.5-flash", "gemini-1.5-flash"]

    for model in models:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=config_with_search,
            )

            text = response.text or ""
            sources = []

            if response.candidates:
                meta = response.candidates[0].grounding_metadata
                if meta and meta.grounding_chunks:
                    for chunk in meta.grounding_chunks:
                        if chunk.web and chunk.web.uri:
                            item = {"title": chunk.web.title, "url": chunk.web.uri}
                            if item not in sources:
                                sources.append(item)

            return {"text": text, "sources": sources}

        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                continue
            continue

    # Fallback: tanpa Google Search
    fallback_prompt = prompt + "\n\n(Gunakan internal knowledge Anda, tahun 2026.)"
    for model in models:
        try:
            response = client.models.generate_content(model=model, contents=fallback_prompt)
            return {"text": response.text or "", "sources": []}
        except Exception:
            continue

    return {"text": "Analisis tidak tersedia saat ini.", "sources": []}