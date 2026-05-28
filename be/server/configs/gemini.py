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


async def stream_trend_and_grounding(category: str, trend_status: str, forecast_summary: str):
    """
    Generator untuk Streaming Analisis Pasar Global + Google Search.
    Dilengkapi sistem Mid-Stream Fallback jika kuota mendadak habis di tengah jalan.
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

    Tugas Anda:
    Hubungkan hasil prediksi internal kami dengan realitas pasar dunia nyata saat ini berdasarkan instruksi berikut:
    {instruction}

    Ketentuan:
    - Gunakan bahasa Indonesia profesional dan komunikatif.
    - Berikan insight yang taktis dan actionable.
    - Jangan sebutkan tanggal spesifik, gunakan narasi tren saat ini (Tahun 2026).
    """

    config_with_search = types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())]
    )

    models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash"]
    sources = []
    quota_exhausted_mid_stream = False

    for model in models:
        try:
            response_stream = client.models.generate_content_stream(
                model=model,
                contents=prompt,
                config=config_with_search
            )
            
            for chunk in response_stream:
                if chunk.text:
                    yield "data: " + json.dumps({"text": chunk.text}) + "\n\n"
                
                if chunk.candidates and chunk.candidates[0].grounding_metadata:
                    meta = chunk.candidates[0].grounding_metadata
                    if meta.grounding_chunks:
                        for g_chunk in meta.grounding_chunks:
                            if g_chunk.web and g_chunk.web.uri:
                                source_item = {
                                    "title": g_chunk.web.title,
                                    "url": g_chunk.web.uri
                                }
                                if source_item not in sources:
                                    sources.append(source_item)
                await asyncio.sleep(0.01)
            
            break

        except APIError as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                quota_exhausted_mid_stream = True
                break
            continue
        except Exception:
            continue

    if quota_exhausted_mid_stream or not sources:
        fallback_prompt = prompt + "\n\n(PENTING: Jangan gunakan Google Search Tool. Buat analisis mendalam langsung menggunakan internal knowledge basis data Anda mengenai kondisi tren pasar di tahun 2026)."
        
        for model in models:
            try:
                fallback_stream = client.models.generate_content_stream(
                    model=model,
                    contents=fallback_prompt
                )
                for chunk in fallback_stream:
                    if chunk.text:
                        yield "data: " + json.dumps({"text": chunk.text}) + "\n\n"
                    await asyncio.sleep(0.01)
                break
            except Exception:
                continue

    if sources:
        yield "data: " + json.dumps({"sources": sources}) + "\n\n"
        
    yield "data: [DONE]\n\n"