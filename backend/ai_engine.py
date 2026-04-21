"""
ai_engine.py
------------
Hybrid AI Engine for SkillProof ATS.

- Core scoring (Semantic Fit): 100% local via sentence-transformers.
  No API calls. No rate limits. Works offline.

- Sage Chat: Powered by Gemini 1.5 Flash (requires GEMINI_API_KEY).
  Falls back gracefully if the API is unavailable.

- GitHub Deep Scan: Powered by Gemini 1.5 Flash (optional).
"""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from skill_engine import get_missing_skills
from model_utils import embedder, cosine_similarity

load_dotenv()

# --------------------------------------------------------------------------
# Model Initialization
# --------------------------------------------------------------------------

# Gemini client (used for Chat and GitHub Deep Scan)
_gemini_available = False
try:
    _api_key = os.getenv("GEMINI_API_KEY")
    if _api_key:
        genai.configure(api_key=_api_key)
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        _gemini_available = True
    else:
        print("[WARN] GEMINI_API_KEY not set. Chat will use fallback mode.")
except Exception as e:
    print(f"[WARN] Gemini init error: {e}.")


# --------------------------------------------------------------------------
# Core: Lightweight Semantic Match (Local ONNX)
# --------------------------------------------------------------------------

def calculate_match_and_missing_skills(resume_text: str, job_description: str):
    """
    Computes a semantic match score using ONNXRuntime for zero-dependency local analysis.
    """
    if not resume_text or not job_description or not embedder:
        return 0.0, []

    try:
        # Encode both texts using the lightweight ONNX version
        resume_emb = embedder.encode(resume_text)
        jd_emb = embedder.encode(job_description)

        # Calculate similarity (normalized dot product)
        similarity = cosine_similarity(resume_emb, jd_emb)

        # Scale slightly to match original distribution if needed
        # all-MiniLM-L6-v2 embeddings are typically well-separated
        semantic_score = max(0.0, min(1.0, similarity))

        # Extract missing skills locally via skill_engine
        missing_skills = get_missing_skills(resume_text, job_description, top_n=7)

        return round(semantic_score, 4), missing_skills

    except Exception as e:
        print(f"ONNX Semantic Engine Error: {e}")
        return 0.0, []


# --------------------------------------------------------------------------
# Sage Chat: Gemini-powered (with graceful fallback)
# --------------------------------------------------------------------------

def ask_gemini_resume_question(question: str, resume_text: str, job_description: str) -> str:
    """
    Handle interactive Sage chat questions.
    Uses Gemini if available, otherwise provides a rule-based fallback.
    """
    if _gemini_available:
        prompt = f"""
You are 'Sage', an expert, friendly, and talkative AI career counselor and ATS strategist for 'SkillProof ATS'.
You love to chat, answer general questions playfully, explain what you do, and engage in friendly conversation. 
You DO NOT always have to do analysis. If the user asks a general question, answer it warmly and naturally.
If the user asks about their resume, provide actionable insights but keep the tone conversational.

Job Description context:
{job_description if job_description else 'None provided yet'}

Resume context:
{resume_text if resume_text else 'None provided yet'}

User's message: {question}
"""
        try:
            response = _gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API Error (Chat): {e}")
            # Fall through to fallback below

    # Offline fallback — basic helpful response
    return (
        "Hi! I'm Sage, your AI career advisor. It looks like my AI engine is "
        "temporarily unavailable. Please try again in a moment, or check that your "
        "GEMINI_API_KEY is set correctly. In the meantime, review your Analysis Results "
        "above for insights on your resume match!"
    )


# --------------------------------------------------------------------------
# GitHub Deep Scan: 100% Local Analysis Engine
# --------------------------------------------------------------------------

# Normalize GitHub language names to skill_engine canonical terms
_LANG_ALIAS_MAP = {
    "jupyter notebook": "python",
    "html": "html",
    "css": "css",
    "scss": "sass",
    "shell": "bash",
    "dockerfile": "docker",
    "hcl": "terraform",
    "makefile": "bash",
    "vim script": "vim",
}


def generate_github_insights(github_data: dict, job_description: str) -> str:
    """
    Generates a professional GitHub Deep Scan assessment using only local logic.
    No API calls. No rate limits. Works offline.

    Cross-references the candidate's GitHub language breakdown against
    the skills required in the Job Description using skill_engine.
    """
    if not github_data:
        return "No GitHub data was provided for the deep scan."

    from skill_engine import extract_skills

    # --- 1. Extract raw GitHub signals ---
    raw_langs: dict = github_data.get("language_breakdown", {})
    total_commits: int = github_data.get("total_commits", 0)
    total_stars: int = github_data.get("total_stars", 0)
    active_repos: int = github_data.get("active_repos", 0)
    total_repos: int = github_data.get("total_repos_scanned", 0)

    if not raw_langs and total_commits == 0:
        return "GitHub profile appears to be empty or private — no public repositories found."

    # --- 2. Normalize GitHub languages to lowercase canonical names ---
    github_tech = set()
    for lang in raw_langs.keys():
        normalized = lang.lower()
        aliased = _LANG_ALIAS_MAP.get(normalized, normalized)
        github_tech.add(aliased)

    # --- 3. Extract required skills from JD using local skill_engine ---
    jd_skills = extract_skills(job_description) if job_description else set()

    # --- 4. Compute alignment and gaps ---
    aligned = github_tech & jd_skills               # In both GitHub AND JD
    missing_from_github = jd_skills - github_tech   # JD requires but GitHub doesn't show
    bonus_skills = github_tech - jd_skills          # Candidate has extras not in JD

    # Sort by specificity (multi-word = more specific, listed first)
    aligned_sorted = sorted(aligned, key=lambda x: len(x.split()), reverse=True)
    missing_sorted = sorted(missing_from_github, key=lambda x: len(x.split()), reverse=True)
    bonus_sorted = sorted(bonus_skills, key=lambda x: len(x.split()), reverse=True)

    # --- 5. Build the professional narrative ---
    parts = []

    # Activity summary
    activity_parts = []
    if total_commits > 0:
        activity_parts.append(f"{total_commits} commits")
    if total_stars > 0:
        activity_parts.append(f"{total_stars} stars")
    if active_repos > 0:
        activity_parts.append(f"{active_repos} recently active repo{'s' if active_repos > 1 else ''}")

    if total_repos > 0:
        activity_str = f"{total_repos} public repo{'s' if total_repos > 1 else ''}"
        if activity_parts:
            activity_str += f" ({', '.join(activity_parts)})"
        parts.append(f"GitHub profile shows {activity_str}.")

    # Language overview
    if raw_langs:
        lang_display = list(raw_langs.keys())[:5]
        parts.append(f"Primary languages detected: {', '.join(lang_display)}.")

    # JD alignment
    if aligned_sorted:
        top_aligned = aligned_sorted[:5]
        fit_note = "directly matching the role requirements" if len(top_aligned) >= 3 else "matching role requirements"
        parts.append(f"Strong JD alignment in: {', '.join(top_aligned)} — {fit_note}.")
    elif jd_skills:
        parts.append("No direct language overlap found between GitHub profile and JD tech stack.")

    # Gaps
    if missing_sorted:
        top_missing = missing_sorted[:4]
        parts.append(
            f"JD-required skills not evidenced on GitHub: {', '.join(top_missing)}. "
            f"Consider adding relevant projects or contributions."
        )

    # Bonus skills
    if bonus_sorted:
        top_bonus = bonus_sorted[:3]
        parts.append(f"Additional skills on GitHub beyond the JD scope: {', '.join(top_bonus)}.")

    if not parts:
        return "GitHub profile analysis complete. Insufficient public data for detailed insights."

    return " ".join(parts)
