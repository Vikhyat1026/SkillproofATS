from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel

from ai_engine import calculate_match
from achievement_engine import calculate_achievement_score
from github_service import analyze_github_profile
from resume_parser import extract_text_from_pdf
from insight_engine import generate_ai_insights

app = FastAPI(title="SkillProof ATS")


# ---------- Request Models ----------

class MatchRequest(BaseModel):
    resume_text: str
    job_description: str


class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str
    background_type: str   # tech / non-tech / technical / etc
    github_username: str | None = None


# ---------- Routes ----------

@app.get("/")
def home():
    return {"message": "SkillProof ATS Backend Running"}


@app.post("/match-score")
def match_score(data: MatchRequest):
    score = calculate_match(data.resume_text, data.job_description)
    return {"similarity_score": score}


# ---------- PDF Upload Endpoint ----------

@app.post("/analyze")
async def analyze_pdf(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    background_type: str = Form(""),
    github_username: str | None = Form(None)
):

    resume_text = extract_text_from_pdf(file.file)

    data = AnalyzeRequest(
        resume_text=resume_text,
        job_description=job_description,
        background_type=background_type,
        github_username=github_username
    )

    return analyze_candidate(data)


# ---------- Core Logic ----------

def analyze_candidate(data: AnalyzeRequest):

    # Normalize profile type (FRONTEND SAFE)
    profile_type = data.background_type.lower()

    if profile_type in ["technical", "tech"]:
        profile_type = "tech"
    else:
        profile_type = "non-tech"

    # Semantic Score
    semantic_score = calculate_match(
        data.resume_text,
        data.job_description
    )

    # Achievement Score
    achievement_score = calculate_achievement_score(
        data.resume_text
    )

    # GitHub Score
    github_score = 0.0
    if profile_type == "tech" and data.github_username:
        github_score = analyze_github_profile(data.github_username)

    # Adaptive Weight Logic
    if profile_type == "tech":
        final_score = (
            0.6 * semantic_score +
            0.25 * github_score +
            0.15 * achievement_score
        )
    else:
        final_score = (
            0.6 * semantic_score +
            0.4 * achievement_score
        )

    # AI Insight Engine
    ai_insights = generate_ai_insights(
        semantic_score,
        achievement_score,
        github_score,
        profile_type
    )

    # Convert Scores to Percentage
    semantic_pct = int(semantic_score * 100)
    achievement_pct = int(achievement_score * 100)
    github_pct = int(github_score * 100)
    final_pct = int(final_score * 100)

    # Match Level Logic
    if final_pct >= 70:
        match_level = "Strong Match"
    elif final_pct >= 40:
        match_level = "Moderate Match"
    else:
        match_level = "Low Match"

    return {
        "overall_match": f"{final_pct}%",
        "match_level": match_level,
        "breakdown": {
            "semantic_fit": f"{semantic_pct}%",
            "achievement_strength": f"{achievement_pct}%",
            "github_strength": f"{github_pct}%"
        },
        "insights": ai_insights
    }