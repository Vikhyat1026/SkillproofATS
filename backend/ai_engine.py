import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

# Load lightweight embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

def split_into_sentences(text: str):
    """Split text into sentences and significant bullet points."""
    # Split by periods, newlines, and bullet points
    sentences = re.split(r"[\.\n•\-]", text)
    # Filter out very short phrasing
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    return sentences

def extract_missing_skills(missing_sentences, resume_text):
    """Extract critical keywords from JD sentences that lacked coverage in the resume."""
    if not missing_sentences:
        return []
        
    combined_text = " ".join(missing_sentences)
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2), max_features=15)
    
    try:
        vectorizer.fit([combined_text])
        terms = vectorizer.get_feature_names_out()
        
        # Sort terms by their tf-idf score to prioritize important words
        tfidf_scores = vectorizer.transform([combined_text]).toarray()[0]
        term_scores = list(zip(terms, tfidf_scores))
        term_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Double check the term really isn't in the resume text
        resume_lower = resume_text.lower()
        missing_skills = []
        for term, _ in term_scores:
            # Filter out generic or very short terms
            if len(term) > 2 and term not in resume_lower and not term.isdigit():
                # Capitalize nicely
                missing_skills.append(term.title())
                if len(missing_skills) == 5: # Limit to top 5 missing skills
                    break
                    
        return missing_skills
    except Exception as e:
        return []

def calculate_match_and_missing_skills(resume_text, job_description):
    """
    Computes a semantic match score avoiding truncation by using sentence chunking.
    Returns the average max similarity for JD sentences and a list of missing skills.
    """
    resume_sentences = split_into_sentences(resume_text)
    jd_sentences = split_into_sentences(job_description)
    
    if not resume_sentences or not jd_sentences:
        return 0.0, []
        
    # Encode all chunks
    resume_vecs = model.encode(resume_sentences)
    jd_vecs = model.encode(jd_sentences)
    
    # Sim matrix: rows = JD sentences, cols = Resume sentences
    sim_matrix = cosine_similarity(jd_vecs, resume_vecs)
    
    # For each JD sentence, find the single best matching sentence in the resume
    max_sims = sim_matrix.max(axis=1)
    
    # The overall score is the average of how well each JD sentence is covered
    overall_score = float(max_sims.mean())
    
    # Identify JD sentences that have very poor coverage in the resume (threshold < 0.35)
    missing_threshold = 0.35
    missing_sentences = [jd_sentences[i] for i, sim in enumerate(max_sims) if sim < missing_threshold]
    
    # Extract specific skills/keywords from those poorly covered sentences
    missing_skills = extract_missing_skills(missing_sentences, resume_text)
    
    return overall_score, missing_skills
