import re
from sentence_transformers import SentenceTransformer, util

# Load embedding model once
model = SentenceTransformer("all-MiniLM-L6-v2")


# General achievement concepts (not specific examples)
achievement_concepts = [
    "demonstrating measurable impact",
    "improving performance or efficiency",
    "leading or building a system",
    "solving complex problems",
    "delivering results or outcomes",
    "creating scalable solutions",
    "optimizing systems for better results"
]

# Pre-compute embeddings
concept_embeddings = model.encode(achievement_concepts, convert_to_tensor=True)


def split_into_sentences(text: str):
    """
    Split resume text into meaningful sentences.
    """
    sentences = re.split(r"[.\n]", text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    return sentences


def calculate_achievement_score(resume_text: str) -> float:
    """
    Detect achievement-style sentences using semantic similarity.
    """

    sentences = split_into_sentences(resume_text)

    if not sentences:
        return 0.0

    # Encode resume sentences
    sentence_embeddings = model.encode(sentences, convert_to_tensor=True)

    similarity_scores = []

    for emb in sentence_embeddings:
        similarity = util.cos_sim(emb, concept_embeddings)
        max_score = float(similarity.max())
        similarity_scores.append(max_score)

    # Take top signals
    similarity_scores.sort(reverse=True)

    top_scores = similarity_scores[:5] if len(similarity_scores) >= 5 else similarity_scores

    achievement_score = sum(top_scores) / len(top_scores)

    return float(achievement_score)
