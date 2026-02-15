from fastapi import FastAPI
from pydantic import BaseModel
from ai_engine import calculate_match


app = FastAPI(title="SkillProof ATS")
class MatchRequest(BaseModel):
    resume_text: str
    job_description: str


@app.get("/")
def home():
    return {"message": "SkillProof ATS Backend Running 🚀"}
@app.post("/match-score")
def match_score(data: MatchRequest):
    score = calculate_match(data.resume_text, data.job_description)
    return {"similarity_score": score}

