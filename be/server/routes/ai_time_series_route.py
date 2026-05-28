from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from controllers.ai_time_series_controller import forecast_controller
from validates.ai_time_series_validate import ForecastRequest

from configs.gemini import stream_trend_and_grounding, client
from pydantic import BaseModel
from typing import List, Dict
from google.genai.errors import APIError

router = APIRouter()

CHAT_SESSIONS: Dict[str, List[Dict]] = {}


class ChatMessage(BaseModel):
    role: str 
    text: str

class ChatConsultationRequest(BaseModel):
    session_id: str 
    category: str
    context_insight: str
    history: List[ChatMessage] 
    message: str


@router.post("/forecast")
async def forecast(payload: ForecastRequest):
    result = forecast_controller(
        category=payload.category,
        weeks=payload.weeks
    )
    return result


@router.get("/stream-trends")
async def stream_market_trends(
    category: str = Query(..., description="Kategori produk, misal: Clothing"),
    trend_status: str = Query(..., description="MENINGKAT atau MENURUN"),
    forecast_summary: str = Query(..., description="Ringkasan angka untuk kontekstualisasi")
):
    """
    Endpoint Server-Sent Events (SSE) untuk mengalirkan teks analisis real-time
    serta mengirimkan metadata link sumber berita di akhir stream.
    """
    return StreamingResponse(
        stream_trend_and_grounding(category, trend_status, forecast_summary),
        media_type="text/event-stream"
    )


@router.post("/chat-consultation")
async def chat_consultation(payload: ChatConsultationRequest):
    try:
        s_id = payload.session_id

        if s_id not in CHAT_SESSIONS:
            CHAT_SESSIONS[s_id] = [
                {
                    "role": "user",
                    "parts": [{"text": f"Berikut konteks bisnis toko saya saat ini untuk kategori {payload.category}: {payload.context_insight}."}]
                },
                {
                    "role": "model",
                    "parts": [{"text": "Pesan dimengerti. Saya sudah memegang data tren internal toko Anda. Ada strategi bisnis atau promosi yang ingin Anda diskusikan?"}]
                }
            ]

        active_history = CHAT_SESSIONS[s_id]

        chat = client.chats.create(
            model="gemini-3.5-flash",
            history=active_history
        )
        
        response = chat.send_message(payload.message)
        
        updated_history = chat.get_history()
        
        CHAT_SESSIONS[s_id] = [
            {"role": msg.role, "parts": [{"text": p.text for p in msg.parts}]} 
            for msg in updated_history
        ]
        
        return {
            "reply": response.text
        }
        
    except APIError as e:
        raise HTTPException(status_code=502, detail=f"Gemini API Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clear-chat")
async def clear_chat(session_id: str):
    if session_id in CHAT_SESSIONS:
        del CHAT_SESSIONS[session_id]
    return {"status": "success", "message": "Riwayat chat berhasil dihapus dari memori RAM server"}