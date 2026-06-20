@echo off
cd /d "%~dp0backend\CraftCv"
..\venv\Scripts\python.exe manage.py runserver
pause
