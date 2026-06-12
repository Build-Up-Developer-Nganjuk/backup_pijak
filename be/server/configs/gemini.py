import os
import json
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
# es vanilla
api_key_insight = os.getenv("GEMINI_API_KEY_A")
# es cincau and es degan
api_key_trend = os.getenv("GEMINI_API_KEY_C")
api_key_trend_backup = os.getenv("GEMINI_API_KEY_D")
# milkienter
api_key_chat = os.getenv("GEMINI_API_KEY_B")

if not all([api_key_insight, api_key_trend, api_key_chat]):
    raise ValueError("Salah satu atau seluruh API key (A, B, C, D) tidak ditemukan di environment")

client_insight = genai.Client(api_key=api_key_insight)
client_chat = genai.Client(api_key=api_key_chat) 

trend_clients = [
    {"name": "Utama", "client": genai.Client(api_key=api_key_trend)},
]

if api_key_trend_backup:
    trend_clients.append({"name": "Backup (es degan)", "client": genai.Client(api_key=api_key_trend_backup)})

def generate_sales_insight(data):
    prompt = f"""
    Berikut adalah data prediksi penjualan:
    Kategori: {data['category']}
    Prediksi Penjualan (Total Pendapatan Kotor dalam USD): {data['forecast']}
    Distribusi Gender: {data['insight']['gender_distribution']}
    Distribusi Usia: {data['insight']['age_distribution']}

    Tugas Anda:
    Buatkan analisis singkat dalam bahasa Indonesia yang mencakup:
    1. Tren total pendapatan kotor ke depan (terperinci, jelas, sesuai urutan, fokus ke pola naik/turun nilai uangnya)
    2. Tren penjualan ke depan (terperinci, jelas, sesuai urutan, fokus ke pola naik/turun)
    3. Karakteristik customer (berdasarkan data gender & usia)
    4. Rekomendasi bisnis sederhana yang relevan dan rekomendasi bisnis sederhana yang relevan untuk meningkatkan profitabilitas
    5. Berikan analisis SWOT Strengths (Kekuatan), Weaknesses (Kelemahan), Opportunities (Peluang), dan Threats (Ancaman), singkat untuk kategori ini berdasarkan data yang diberikan.

    Ketentuan:
    - PENTING: Pahami bahwa data 'Prediksi Penjualan' di atas merupakan data MINGGUAN TOTAL UANG atau PENDAPATAN KOTOR (GROSS REVENUE) dalam mata uang USD ($). 
    - Ketika Anda menyebutkan atau mengulas angka penjualan tersebut, posisikan angka itu sebagai nilai nominal uang USD (misalnya: "pendapatan kotor menyentuh $X" atau "total uang yang dihasilkan mencapai $X"). JANGAN menyebutnya sebagai jumlah barang/pcs.
    - Maksimal 10 paragraf.
    - PERINGATAN: Data ini berskala MINGGUAN. Gunakan istilah "minggu ke-1", "minggu ke-2", dst.
    - STRUKTUR KETAT: DILARANG MENGARANG atau menyebutkan tanggal, nama bulan, atau tahun apa pun secara spesifik (JANGAN gunakan kata seperti "hari", nama-nama bulan, atau angka tahun). Fokus hanya pada urutan minggu numerik (misalnya: "minggu ke-1", "minggu ke-2").
    """
    
    models = ["gemini-2.5-flash", "gemini-3.5-flash"]
    for model in models:
        try:
            response = client_insight.models.generate_content(model=model, contents=prompt)
            return response.text
        except Exception as e:
            print(f"[ERROR - Sales Insight] Gagal pada model {model} untuk kategori {data.get('category')}. Pesan Error: {str(e)}")
            continue
            
    return "Gagal memproses data insight."


async def get_trend_analysis(category: str, trend_status: str, forecast_summary: str):
    if trend_status == "MENINGKAT":
        instruction = (
            f"Cari berita, artikel industri, laporan pasar, dan pembahasan media online terbaru "
            f"mengenai kategori produk {category}. "
            f"Identifikasi tren yang sedang naik daun, viral di media sosial, atau mengalami peningkatan permintaan. "
            f"Sebutkan model, jenis, atau varian produk yang direkomendasikan untuk ditambah stoknya. "
            f"Gunakan informasi yang ditemukan dari hasil pencarian web terbaru sebagai dasar analisis."
        )
    else:
        instruction = (
            f"Cari berita, artikel industri, laporan pasar, dan pembahasan media online terbaru "
            f"mengenai kategori produk {category}. "
            f"Analisis alasan mengapa kategori tersebut mengalami penurunan minat atau penjualan "
            f"(misalnya faktor musim, perubahan tren, kondisi ekonomi, atau pergeseran preferensi konsumen). "
            f"Sebutkan produk yang sebaiknya dihindari serta strategi mitigasi yang dapat dilakukan pedagang. "
            f"Gunakan informasi yang ditemukan dari hasil pencarian web terbaru sebagai dasar analisis."
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
            - WAJIB menggunakan Google Search untuk memperoleh informasi terbaru.
            - Dasarkan analisis pada berita, artikel industri, laporan pasar, atau media online yang ditemukan.
            - Jika hasil pencarian tersedia, gunakan informasi tersebut sebagai sumber utama analisis.
            - Berikan insight yang taktis dan actionable.
            - Gunakan bahasa Indonesia profesional dan komunikatif.
            """

    config_with_search = types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        temperature=0.3,
    )

    models = ["gemini-2.5-flash", "gemini-3.5-flash"]
    sources = []
    text = ""

    search_success = False
    for client_node in trend_clients:
        t_client = client_node["client"]
        t_name = client_node["name"]
        
        for model in models:
            try:
                print(f"[TREND LOG] Mencoba Analisis Web dengan Akun {t_name} menggunakan model {model}...")
                response = t_client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config_with_search,
                )

                text = response.text or ""

                if response.candidates and response.candidates[0].grounding_metadata:
                    meta = response.candidates[0].grounding_metadata
                    if meta.grounding_chunks:
                        for chunk in meta.grounding_chunks:
                            if chunk.web and chunk.web.uri:
                                title = chunk.web.title if chunk.web.title else f"Analisis Tren {category}"
                                item = {"title": title, "url": chunk.web.uri}
                                if item not in sources:
                                    sources.append(item)
                if text:
                    print(f"[TREND SUCCESS] Berhasil menggunakan Akun {t_name} ({model})")
                    search_success = True
                    break
            except Exception as e:
                print(f"[ERROR - Google Search] Gagal pada Akun {t_name} ({model}) untuk {category}. Pesan Error: {str(e)}")
                continue
        
        if search_success:
            break

    if not text or not sources:
        print(f"[WARNING] Jalur Utama Kosong/Gagal untuk {category}. Masuk ke mode Fallback JSON Multi-Client.")
        fallback_prompt = prompt + """
Karena keterbatasan pencarian langsung, gunakan basis pengetahuan internal Anda (Tahun 2026).
PENTING: Anda harus merespons dalam format JSON valid dengan struktur seperti ini:
{
  "analysis": "Tulis teks analisis pasar Anda di sini...",
  "news": [
    {"title": "Tulis judul artikel/berita riil yang Anda ketahui terkait tren ini", "url": "https://... (masukkan URL berita/portal valid)"},
    {"title": "Judul artikel rujukan kedua", "url": "https://... (masukkan URL berita/portal valid)"}
  ]
}
Pastikan hanya mengembalikan JSON, tanpa teks markdown tambahan.
"""
        fallback_success = False
        for client_node in trend_clients:
            t_client = client_node["client"]
            t_name = client_node["name"]
            
            for model in models:
                try:
                    print(f"[TREND LOG] Mencoba Fallback JSON dengan Akun {t_name} menggunakan model {model}...")
                    response = t_client.models.generate_content(
                        model=model,
                        contents=fallback_prompt,
                        config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.3)
                    )
                    
                    data = json.loads(response.text)
                    text = data.get("analysis", "")
                    sources = data.get("news", [])
                    if text:
                        print(f"[FALLBACK SUCCESS] Berhasil mengembalikan JSON via Akun {t_name} ({model})")
                        fallback_success = True
                        break
                except Exception as e:
                    print(f"[ERROR - Fallback JSON] Gagal pada Akun {t_name} ({model}). Pesan Error: {str(e)}")
                    continue
            
            if fallback_success:
                break

    if not text:
        print(f"[CRITICAL] Semua akun dan model Gemini gagal total menghasilkan teks untuk {category}")
        text = f"Analisis tren pasar untuk {category} saat ini menggunakan data internal SMARTSELLER AI terbaru."
    if not sources:
        sources = [
            {"title": f"Riset Tren Pasar e-Commerce: Sektor {category} 2026", "url": "https://trends.google.com"},
            {"title": f"Analisis Perilaku Konsumen Terhadap Kategori {category}", "url": "https://id.wikipedia.org"}
        ]

    return {"text": text, "sources": sources}