from django.db import models
from django.conf import settings
import json

class Resume(models.Model):
    TEMPLATE_CHOICES = [
        ('modern_pro', 'Modern Professional'),
        ('minimal_pure', 'Minimal Pure'),
        ('creative_burst', 'Creative Burst'),
        ('executive_elite', 'Executive Elite'),
        ('tech_nexus', 'Tech Nexus'),
        ('academic_scholar', 'Academic Scholar'),
        ('gradient_flow', 'Gradient Flow'),
        ('sidebar_pro', 'Sidebar Pro'),
        ('compact_card', 'Compact Card'),
        ('bold_statement', 'Bold Statement'),
    ]
    
    TYPE_CHOICES = [
        ('cv', 'CV'),
        ('resume', 'Resume'),
        ('cover_letter', 'Cover Letter'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='resume')
    template = models.CharField(max_length=30, choices=TEMPLATE_CHOICES, default='modern_pro')
    
    # JSON storage for drag-drop sections
    content = models.JSONField(default=dict)  # Stores sections order & data
    
    # Section visibility & order
    section_order = models.JSONField(default=list)
    
    # Colors & typography
    primary_color = models.CharField(max_length=7, default='#2563eb')
    font_family = models.CharField(max_length=50, default='Inter')
    
    # AI Analysis
    ai_score = models.FloatField(null=True, blank=True)
    ai_feedback = models.JSONField(default=list, blank=True)
    last_analyzed = models.DateTimeField(null=True, blank=True)
    
    # PDF
    pdf_file = models.FileField(upload_to='resumes/%Y/%m/', blank=True)
    is_public = models.BooleanField(default=False)
    public_slug = models.SlugField(unique=True, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Section(models.Model):
    """Reusable section definitions"""
    SECTION_TYPES = [
        ('header', 'Personal Header'),
        ('summary', 'Professional Summary'),
        ('experience', 'Work Experience'),
        ('education', 'Education'),
        ('skills', 'Skills'),
        ('projects', 'Projects'),
        ('certifications', 'Certifications'),
        ('languages', 'Languages'),
        ('awards', 'Awards & Honors'),
        ('references', 'References'),
        ('custom', 'Custom Section'),
    ]
    
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='sections')
    type = models.CharField(max_length=20, choices=SECTION_TYPES)
    title = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    data = models.JSONField(default=dict)  # Flexible content storage
    
    class Meta:
        ordering = ['order']

class UploadedCV(models.Model):
    """For AI vulnerability scanning"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploaded_cvs/%Y/%m/')
    file_type = models.CharField(max_length=10, choices=[('pdf', 'PDF'), ('docx', 'DOCX')])
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # AI Analysis Results
    ats_score = models.IntegerField(null=True, blank=True)  # 0-100
    vulnerability_report = models.JSONField(default=dict, blank=True)
    strengths = models.JSONField(default=list, blank=True)
    weaknesses = models.JSONField(default=list, blank=True)
    suggestions = models.JSONField(default=list, blank=True)
    keyword_match = models.JSONField(default=dict, blank=True)  # For job-specific optimization
    processing_status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('processing', 'Processing'), ('completed', 'Completed'), ('failed', 'Failed')],
        default='pending'
    )