from fastapi import APIRouter, HTTPException
import httpx
import google.generativeai as genai
import os
import re
from dotenv import load_dotenv

router = APIRouter()

JISHO_URL = "https://jisho.org/api/v1/search/words"

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')


async def get_pitch_accent_from_ai(word: str, reading: str):
    try:
        prompt = f"""
            Bạn là một chuyên gia về ngữ âm tiếng Nhật.
            Hãy cung cấp mẫu nhấn âm (pitch accent pattern) theo tiêu chuẩn NHK cho từ sau:

            - Từ: "{word}"
            - Cách đọc: "{reading}"

            Yêu cầu:
            1. Trả về MỘT CHUỖI DUY NHẤT.
            2. Chuỗi này mô tả mẫu nhấn âm, dùng 'L' (Low) và 'H' (High) cho MỖI MORA (âm tiết) của CÁCH ĐỌC.
            3. Luôn bắt đầu bằng 'L' (trừ khi là Atamadaka [1]).

            VÍ DỤ MẪU:
            - Input: "食べる" (たべる) [3 moras] -> Output: "LHH"
            - Input: "橋" (はし) [2 moras, accent 2] -> Output: "LH"
            - Input: "箸" (はし) [2 moras, accent 1] -> Output: "HL"
            - Input: "日本" (にほん) [3 moras, accent 2] -> Output: "LHH"
            - Input: "心" (こころ) [3 moras, accent 2] -> Output: "LHL"

            CHỈ TRẢ VỀ CHUỖI MẪU (ví dụ: "LHH"), KHÔNG GIẢI THÍCH.
            """
        response = await model.generate_content_async(prompt)
        
        result_text = response.text.strip().replace("`", "")
        print("AI trả về:", repr(result_text))

        # Kiểm tra xem có phải là chuỗi L/H không
        if re.fullmatch(r"[LH]+", result_text):
            return result_text
        else:
            return None # Trả về None nếu AI trả về linh tinh

    except Exception as e:
        print(f"Lỗi khi gọi AI lấy nhấn âm: {e}")
        return None # Không làm crash nếu lỗi

@router.get("/")
async def search(word: str):
    if not word:
        raise HTTPException(status_code=400, detail="Thiếu từ cần tra")

    # --- BƯỚC A: GỌI API JISHO ---
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{JISHO_URL}?keyword={word}")
            res.raise_for_status()
            jisho_response = res.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Lỗi kết nối Jisho API: {e}")

    # --- BƯỚC B: GỌI AI ĐỂ LẤY NHẤN ÂM ---
    pitch_accent_info = None
    
    # Chỉ gọi AI nếu Jisho tìm thấy kết quả
    if jisho_response.get("data"):
        try:
            # Lấy từ và cách đọc của kết quả đầu tiên
            main_entry = jisho_response["data"][0]
            word_to_check = main_entry["japanese"][0].get("word", word)
            reading_to_check = main_entry["japanese"][0].get("reading")
            print("AI trả về:", repr(reading_to_check))
            
            if reading_to_check:
                pitch_accent_info = await get_pitch_accent_from_ai(word_to_check, reading_to_check)
        except Exception:
            pass

    # --- BƯỚC C: "TIÊM" (Inject) NHẤN ÂM VÀO KẾT QUẢ ---
    if pitch_accent_info and jisho_response.get("data"):
        jisho_response["data"][0]["pitch_pattern"] = pitch_accent_info

    # Trả về đối tượng jisho_response đã được "tiêm"
    return jisho_response