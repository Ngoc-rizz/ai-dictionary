from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import jisho, generate, handwriting, conjugate

app = FastAPI(title="Kanji Mindmap API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jisho.router, prefix="/api/jisho", tags=["Jisho"])
app.include_router(generate.router, prefix="/api/generate-examples", tags=["Generate"])
app.include_router(handwriting.router, prefix="/api/handwriting", tags=["Handwriting"])
app.include_router(conjugate.router, prefix="/api/conjugate", tags=["Conjugate"])

@app.get("/")
def root():
    return {"message": "Kanji Mindmap API running"}
