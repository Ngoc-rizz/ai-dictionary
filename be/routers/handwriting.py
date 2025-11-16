from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY") 
if not API_KEY:
    raise RuntimeError("GOOGLE_API_KEY environment variable is not set.")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

router = APIRouter()

class HandwritingPayload(BaseModel):
    image_data: str 

async def recognize_word(base64_data_url: str):
    try:
        parts = re.split(r'[:;,]', base64_data_url, maxsplit=3)
        if len(parts) != 4 or parts[2] != 'base64':
            raise ValueError("Invalid Data URL format.")
        
        mime_type = parts[1]
        base64_data = parts[3]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Data URL format.")

    image_part = {
        "inline_data": {
            "mime_type": mime_type,
            "data": base64_data
        },
    }

    text_part = {
        "text": """
            Hãy nhận dạng chữ viết tay tiếng Nhật trong ảnh này. 
            Chỉ trả về MỘT TỪ (word) hoặc MỘT KÝ TỰ (character) duy nhất mà bạn chắc chắn nhất. 
            Không trả về cả câu.
        """
    }

    try:
        response = await model.generate_content_async(
            contents={"parts": [image_part, text_part]},
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        return json.loads(response.text.strip())
    except Exception as e:
        print(f"Error recognizing word: {e}")
        raise HTTPException(status_code=500, detail="Failed to recognize the word.")

# SỬA LỖI 4: Thay đổi '@app.post' thành '@router.post'
@router.post("/")
async def recognize_handwriting(payload: HandwritingPayload):
    try:
        image_data = payload.image_data
        result = await recognize_word(image_data)
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))