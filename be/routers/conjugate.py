from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

generation_config = genai.GenerationConfig(response_mime_type="application/json")
model = genai.GenerativeModel('gemini-2.5-flash', generation_config=generation_config)

router = APIRouter()

class ConjugatePayload(BaseModel):
    word: str
    reading: str
    part_of_speech: str 

async def call_ai_to_conjugate(payload: ConjugatePayload): 
    prompt = f"""
        Bạn là một chuyên gia ngữ pháp tiếng Nhật.
        Hãy chia động từ sau đây ra các thể thông dụng.

        - Từ (Word): "{payload.word}"
        - Cách đọc (Reading): "{payload.reading}"
        - Loại từ (Type): "{payload.part_of_speech}"

        Yêu cầu:
        1. Chỉ trả về MỘT đối tượng JSON.
        2. Đối tượng JSON phải chứa các trường sau:
        - "dictionary" (Thể từ điển - V-ru)
        - "masu" (Thể lịch sự - V-masu)
        - "nai" (Thể phủ định - V-nai)
        - "te" (Thể te - V-te)
        - "ta" (Thể quá khứ - V-ta)
        - "potential" (Thể khả năng - V-eru)
        - "passive" (Thể bị động - V-areru)
        
        --- CÁC THỂ MỚI (N4/N3) ---
        - "volitional" (Thể ý định - V-you)
        - "imperative" (Thể mệnh lệnh - V-ro/V-e)
        - "prohibitive" (Thể cấm chỉ - V-na)
        - "conditional_ba" (Thể điều kiện - V-eba)
        - "causative" (Thể sai khiến - V-aseru)

        VÍ DỤ KẾT QUẢ CHO TỪ "行く" (iku):
        {{
        "dictionary / Thể từ điển": "行く",
        "masu / Thể lịch sự": "行きます",
        "nai / Thể phủ định": "行かない",
        "te / Thể Te": "行って",
        "ta / Thể quá khứ" : "行った",
        "potential / Thể khả năng": "行ける",
        "passive / Thể bị động ": "行かれる",
        "volitional": "行こう",
        "imperative": "行け",
        "prohibitive": "行くな",
        "conditional_ba": "行けば",
        "causative": "行かせる"
        }}
    """
    try:
        response = await model.generate_content_async(prompt)
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi Gemini: {e}")

@router.post("/")
async def conjugate_word(payload: ConjugatePayload):
    try:
        conjugations = await call_ai_to_conjugate(payload)
        return conjugations
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))