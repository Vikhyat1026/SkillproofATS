from fastapi import FastAPI
from pydantic import BaseModel
from ai_engine import calculate_match
from achievement_engine import calculate_achievement_score
from github_service import get_repo_count


app = FastAPI(title="SkillProof ATS")
class MatchRequest(BaseModel):
    resume_text: str
    job_description: str
class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str
    background_type: str   # "tech" or "non-tech"
    github_username: str | None = None



@app.get("/")
def home():
    return {"message": "SkillProof ATS Backend Running "}
@app.post("/match-score")
def match_score(data: MatchRequest):
    score = calculate_match(data.resume_text, data.job_description)
    return {"similarity_score": score}
@app.post("/analyze")
def analyze_candidate(data: AnalyzeRequest):

    # Semantic Score
    semantic_score = calculate_match(
        data.resume_text,
        data.job_description
    )

    # Achievement Score
    achievement_score = calculate_achievement_score(
        data.resume_text
    )

    # GitHub Score (optional)
    github_score = 0.0
    if data.background_type.lower() == "tech" and data.github_username:
        github_score = get_repo_count(data.github_username)

    # Insight Generation
    insights = []

    if semantic_score > 0.5:
        insights.append("Strong semantic match with job role")

    if achievement_score > 0.3:
        insights.append("Leadership or measurable achievements detected")

    if data.background_type.lower() == "tech":
        insights.append("Technical profile detected")
    else:
        insights.append("Non-technical profile evaluated via achievement signals")

    # Adaptive Logic
    if data.background_type.lower() == "tech":
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

    # Return response 
    # Convert to Percentage
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
    "insights": insights
}