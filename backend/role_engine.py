from model_utils import embedder, cosine_similarity

# Broad job domains
ROLE_DOMAINS = {
    "Software Engineering": "software development programming backend frontend api system design coding python java react",
    
    "Data / Analytics": "data analysis sql statistics dashboards analytics reporting excel data visualization",
    
    "Machine Learning / AI": "machine learning deep learning ai model training neural networks computer vision nlp",
    
    "DevOps / Cloud": "docker kubernetes cloud infrastructure ci cd deployment automation devops aws azure",
    
    "Product Management": "product roadmap stakeholder management product strategy business planning user requirements",
    
    "Marketing": "marketing campaign brand digital marketing seo content strategy growth marketing analytics",
    
    "Human Resources": "recruitment talent acquisition employee relations hr operations hiring onboarding",
    
    "Finance / Accounting": "financial analysis accounting budgeting forecasting audit finance management",
    
    "Operations / Management": "operations strategy supply chain process management business operations leadership"
}


def detect_best_role(resume_text):

    resume_embedding = embedder.encode(resume_text)

    scores = {}

    for role, description in ROLE_DOMAINS.items():

        role_embedding = embedder.encode(description)

        similarity = cosine_similarity(resume_embedding, role_embedding)

        scores[role] = similarity

    best_role = max(scores, key=scores.get)

    return best_role