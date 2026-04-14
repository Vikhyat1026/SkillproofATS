from role_engine import detect_best_role
def generate_ai_insights(semantic_score, achievement_score, github_score, profile_type, resume_text, missing_skills=None):

    insights = []
    alternative_roles = []

    # Strong match
    if semantic_score >= 0.7:
        insights.append("Match: Strong - Candidate aligns well with this role.")

    # Moderate match
    elif semantic_score >= 0.45:
        insights.append("Match: Moderate - Candidate partially fits this role.")

    # Low match → suggest better role
    else:

        suggested_role = detect_best_role(resume_text)

        insights.append("Match: Low")
        insights.append(f"Candidate is better suitable for: {suggested_role}")
        alternative_roles.append(suggested_role)

    # Achievement insight
    if achievement_score > 0.7:
        insights.append("Resume shows strong measurable achievements.")

    # GitHub insight
    if github_score > 0.6:
        insights.append("GitHub profile indicates strong technical implementation skills.")

    # Missing Skills insight
    if missing_skills and len(missing_skills) > 0:
        insights.append(f"Consider adding missing skills to improve alignment: {', '.join(missing_skills)}")

    return insights, alternative_roles