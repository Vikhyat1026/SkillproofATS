import re

# Action verbs 
ACTION_VERBS = [
    "managed", "led", "organized", "developed", "improved",
    "increased", "reduced", "handled", "executed", "created",
    "planned", "coordinated", "built"
]

def calculate_achievement_score(resume_text: str):
    text = resume_text.lower()

    # 1️⃣ Action verbs count
    verb_score = sum(1 for verb in ACTION_VERBS if verb in text)

    # 2️⃣ Numbers detection (%, digits, etc.)
    numbers = re.findall(r"\d+%|\d+", text)
    number_score = len(numbers)

    # Simple scoring logic
    raw_score = verb_score + number_score

    # Normalize score between 0 and 1
    final_score = min(raw_score / 10, 1.0)

    return round(final_score, 2)
