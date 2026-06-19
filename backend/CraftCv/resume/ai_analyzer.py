import openai
import json
from django.conf import settings
from PyPDF2 import PdfReader
import docx

openai.api_key = settings.OPENAI_API_KEY

class CVAnalyzer:
    def __init__(self):
        self.client = openai.OpenAI()
    
    def extract_text(self, file_path, file_type):
        if file_type == 'pdf':
            reader = PdfReader(file_path)
            return "\n".join(page.extract_text() for page in reader.pages)
        elif file_type == 'docx':
            doc = docx.Document(file_path)
            return "\n".join(para.text for para in doc.paragraphs)
        return ""
    
    def analyze(self, file_path, file_type, job_title=None):
        text = self.extract_text(file_path, file_type)
        
        prompt = f"""Analyze this CV/Resume and provide a detailed vulnerability assessment:

CV Content:
{text[:4000]}  # Truncate for token limit

{f"Target Job: {job_title}" if job_title else ""}

Provide JSON response with this structure:
{{
    "ats_score": <0-100>,
    "overall_assessment": "<2-3 sentence summary>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "critical_issues": ["<issue that could get CV rejected>"],
    "suggestions": ["<actionable improvement 1>"],
    "keyword_optimization": {{
        "missing_keywords": ["<keyword 1>"],
        "recommended_additions": ["<phrase 1>"]
    }},
    "formatting_issues": ["<formatting problem 1>"],
    "impact_score": <0-100>,
    "readability_score": <0-100>
}}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert ATS (Applicant Tracking System) specialist and career coach with 15 years of experience."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            return {
                "error": str(e),
                "ats_score": 0,
                "overall_assessment": "Analysis failed. Please try again."
            }

# Celery task
from celery import shared_task

@shared_task
def process_cv_analysis(upload_id):
    from .models import UploadedCV
    upload = UploadedCV.objects.get(id=upload_id)
    upload.processing_status = 'processing'
    upload.save()
    
    try:
        analyzer = CVAnalyzer()
        result = analyzer.analyze(upload.file.path, upload.file_type)
        
        upload.ats_score = result.get('ats_score', 0)
        upload.vulnerability_report = result
        upload.strengths = result.get('strengths', [])
        upload.weaknesses = result.get('weaknesses', [])
        upload.suggestions = result.get('suggestions', [])
        upload.keyword_match = result.get('keyword_optimization', {})
        upload.processing_status = 'completed'
        
    except Exception as e:
        upload.processing_status = 'failed'
        upload.vulnerability_report = {'error': str(e)}
    
    upload.save()