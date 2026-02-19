def generate_ai_insights(semantic_score, achievement_score, github_score, background_type):
    
    insights = []

    # Semantic analysis
    if semantic_score >= 0.7:
        insights.append("Resume strongly aligns with job description")
    elif semantic_score >= 0.4:
        insights.append("Partial skill alignment detected")
    else:
        insights.append("Low keyword or semantic match with role")

    # Achievement analysis
    if background_type == "non-tech" and achievement_score >= 0.5:
        insights.append("Strong measurable achievements found")

    # GitHub analysis
    if background_type == "tech":
        if github_score >= 0.7:
            insights.append("Strong GitHub activity and technical presence")
        elif github_score > 0:
            insights.append("Basic GitHub presence detected")
        else:
            insights.append("No GitHub activity found")

    return insights