import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use the latest Flash model for extreme speed and precision
model = genai.GenerativeModel('gemini-2.5-flash')

def calculate_match_and_missing_skills(resume_text, job_description):
    """Computes a semantic match score and missing skills via GenAI."""
    if not resume_text or not job_description:
        return 0.0, []
        
    prompt = f"""
    You are an expert technical ATS. Analyze the following Resume against the Job Description.
    Return a strictly formatted JSON object with exactly two keys:
    1. "semantic_score": A float between 0.0 and 1.0 representing how well the resume matches the JD.
    2. "missing_skills": A list of up to 5 critical missing technical skills or domain concepts. Do not use generic words.
    
    Job Description:
    {job_description}
    
    Resume:
    {resume_text}
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        data = json.loads(response.text)
        return float(data.get("semantic_score", 0.0)), data.get("missing_skills", [])
    except Exception as e:
        print(f"Gemini API Error (Match): {e}")
        return 0.0, ["Rate limit exceeded. Please try again shortly."]

def ask_gemini_resume_question(question, resume_text, job_description):
    """Handle interactive chat questions via Gemini."""
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
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API Error (Chat): {e}")
        return "I'm currently receiving too many requests! Please wait a moment and try again."

def generate_github_insights(github_data, job_description):
    """Generates a personalized developer assessment by cross-referencing GitHub raw data against the JD."""
    if not github_data or not job_description:
        return "Not enough GitHub data to form an assessment."
        
    prompt = f"""
    You are an expert technical recruiter analyzing a candidate's GitHub profile against a Job Description.
    
    Job Description:
    {job_description}
    
    Candidate's GitHub Data:
    {json.dumps(github_data)}
    
    Task: Write a concise, professional, 2-3 sentence technical assessment. Identify exactly where their GitHub languages align strongly with the Job Description's required tech stack, and explicitly call out any glaring missing languages or mismatches based solely on their GitHub. Do not use markdown bolding or stars, just plain text.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini GitHub parsing error: {e}")
        return "Unable to generate deep GitHub insights."
