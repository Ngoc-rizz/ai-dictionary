from fastapi import APIRouter, HTTPException, responses
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Định nghĩa model
class SenseModel(BaseModel) :
    english_definitions: list[str]
    parts_of_speech: list[str]
    tags: list[str]
    class Config: 
        extra = 'allow'
class ExamplePayload(BaseModel):
    word: str
    reading: str
    level: str | None = None
    sense: SenseModel

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("Chưa đặt GOOGLE_API_KEY. Hãy thêm nó vào tệp .env")
genai.configure(api_key=api_key)

# Khởi tạo Model (Yêu cầu Gemini trả về JSON)
generation_config = genai.GenerationConfig(response_mime_type= "application/json")
model =  genai.GenerativeModel('gemini-2.5-flash', generation_config=generation_config)

router = APIRouter()

# Call model ai
async def callModelToGenerate (prompt: str) :
    try :
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e :
        raise HTTPException(status_code=503, detail=f"Error: {e}")

@router.post("/")
async def generate_example_endpoint(payload: ExamplePayload): 
    sense = payload.sense 
    pos_str = ", ".join(sense.parts_of_speech)
    tags_str = ", ".join(sense.tags)
    prompt = f"""
            Hãy tạo MỘT (1) câu ví dụ tiếng Nhật cho người học.
            Dưới đây là thông tin về từ:
            - Từ (Word): "{payload.word}"
            - Cách đọc (Reading): "{payload.reading}"
            - Cấp độ (Level): "{payload.level or 'Không xác định'}"
            - Nghĩa (Meaning): "{sense.english_definitions[0]}"
            - Loại từ (Parts of Speech): "{pos_str}"
            - Tags Ngữ cảnh (Tags): "{tags_str}"

            Yêu cầu:
                1. Câu ví dụ phải sử dụng từ này đúng với nghĩa và ngữ cảnh (Tags) đã cho.
                2. Câu phải tự nhiên và phổ biến.
                3. Trả về MỘT đối tượng JSON DUY NHẤT với 2 trường: "sentence" và "translation" (tiếng Việt).
                4. (QUAN TRỌNG) Trường "sentence" PHẢI ở định dạng 'Kanji(Hiragana)', 
                ví dụ: 私(わたし)はご飯(ごはん)を食(た)べます。
                Nếu chỉ là Hiragana/Katakana, thì không cần ngoặc (ví dụ: パン).
                5. (CỰC KỲ QUAN TRỌNG) Định dạng 'Kanji(Reading)' phải áp dụng CHỈ cho phần Kanji,
               KHÔNG bao gồm Hiragana đi kèm (Okurigana).
               
               VÍ DỤ ĐÚNG: 好(す)きです。
               VÍ DỤ SAI: 好き(すき)です。 HOẶC 好き(す)です。
               
               VÍ DỤ ĐÚNG: 美味(おい)しいです。
               VÍ DỤ SAI: 美味しい(おいしい)です。
            """
    try: 
        response_str = await callModelToGenerate(prompt)
        example_object = json.loads(response_str)
        return example_object

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI không trả về JSON hợp lệ.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi: {str(e)}")