from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load lightweight embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

def calculate_match(resume, job):
    resume_vec = model.encode([resume])
    job_vec = model.encode([job])

    score = cosine_similarity(resume_vec, job_vec)[0][0]
    return float(score)
