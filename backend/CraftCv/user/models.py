from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.URLField(blank=True)
    auth_provider = models.CharField(
        max_length=20, 
        choices=[('email', 'Email'), ('google', 'Google')],
        default='email'
    )
    is_premium = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    linkedin = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)
    headline = models.CharField(max_length=200, blank=True)
    summary = models.TextField(blank=True)