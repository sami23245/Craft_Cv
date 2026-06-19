# CraftCV — AI-Powered Resume Builder

CraftCV is a full-stack web application that lets users build, customize, and export professional resumes with the help of AI. It supports multiple templates, drag-and-drop section ordering, Google OAuth, AI-based CV scanning, and PDF export.

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Django 6 | Core web framework |
| Django REST Framework | REST API layer |
| SimpleJWT | JWT-based authentication (access + refresh tokens) |
| django-allauth | Google OAuth 2.0 social login |
| MySQL 8+ | Primary relational database |
| Celery + Redis | Background task queue (AI processing) |
| AWS S3 | PDF file storage |
| OpenAI API | AI resume scoring and vulnerability scanning |
| django-storages | S3 file backend |
| django-cors-headers | CORS for frontend-backend communication |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| Zustand | Global state management |
| @dnd-kit | Drag-and-drop section reordering |
| Framer Motion | Animations and transitions |
| React Query (TanStack) | Server state and caching |
| Axios | HTTP client |
| React Hook Form + Zod | Form handling and validation |
| html2canvas + jsPDF | Client-side PDF export |
| @react-oauth/google | Google One Tap login |

---

## Project Structure

```
CraftCV/
├── backend/
│   └── CraftCv/
│       ├── CraftCv/          # Django project settings, urls, wsgi
│       ├── user/             # Custom user model, auth views
│       ├── resume/           # Resume, Section, UploadedCV models & views
│       ├── templates_data/   # Resume template metadata
│       ├── payments/         # Payment/subscription models
│       └── manage.py
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/         # LoginPage (email + Google OAuth)
│       │   ├── builder/      # BuilderCanvas, SortableSection
│       │   ├── templates/    # TemplateGallery
│       │   └── ai/           # CVScanner (AI analysis UI)
│       ├── store/
│       │   └── builderStore.js  # Zustand store for resume state
│       └── App.jsx
├── requirements.txt
├── docker-compose.yml
└── .env.example
```

---

## Core Features

### 1. Authentication
- Email/password registration and login
- Google OAuth 2.0 (One Tap)
- JWT access tokens (15-minute lifetime) + refresh tokens (7 days)
- Token blacklisting on logout

### 2. Resume Builder
- 10 professional templates:
  `modern_pro`, `minimal_pure`, `creative_burst`, `executive_elite`, `tech_nexus`, `academic_scholar`, `gradient_flow`, `sidebar_pro`, `compact_card`, `bold_statement`
- 11 section types:
  Header, Summary, Experience, Education, Skills, Projects, Certifications, Languages, Awards, References, Custom
- Drag-and-drop section reordering (dnd-kit)
- Custom primary color picker
- Font family selection
- Section visibility toggle
- Public shareable link with unique slug

### 3. AI CV Scanner
- Upload existing CV (PDF or DOCX)
- AI-powered analysis via OpenAI:
  - ATS (Applicant Tracking System) score
  - Strengths and weaknesses
  - Keyword match analysis
  - Improvement suggestions
  - Vulnerability report
- Background processing via Celery

### 4. PDF Export
- Client-side export using html2canvas + jsPDF
- Server-side PDF stored on AWS S3

### 5. User Profile
- Avatar URL
- Auth provider tracking (email vs Google)
- Premium status flag
- Extended profile (phone, location, LinkedIn, portfolio, headline, summary)

---

## Database Models

### `user.User` (extends AbstractUser)
| Field | Type | Description |
|-------|------|-------------|
| email | EmailField (unique) | Login identifier |
| avatar | URLField | Profile picture |
| auth_provider | CharField | `email` or `google` |
| is_premium | BooleanField | Premium subscription flag |
| created_at | DateTimeField | Account creation time |

### `resume.Resume`
| Field | Type | Description |
|-------|------|-------------|
| title | CharField | Resume title |
| type | CharField | `resume`, `cv`, or `cover_letter` |
| template | CharField | Template key |
| content | JSONField | All resume content |
| section_order | JSONField | Ordered list of section IDs |
| primary_color | CharField | Hex color code |
| font_family | CharField | Font name |
| ai_score | FloatField | AI-generated quality score |
| ai_feedback | JSONField | AI suggestions |
| pdf_file | FileField | S3 path to exported PDF |
| is_public | BooleanField | Public sharing toggle |
| public_slug | SlugField | Unique public URL slug |

### `resume.Section`
| Field | Type | Description |
|-------|------|-------------|
| type | CharField | Section type key |
| title | CharField | Display title |
| order | PositiveIntegerField | Sort order |
| is_visible | BooleanField | Visibility toggle |
| data | JSONField | Section content |

### `resume.UploadedCV`
| Field | Type | Description |
|-------|------|-------------|
| file | FileField | Uploaded file (S3) |
| file_type | CharField | `pdf` or `docx` |
| ats_score | IntegerField | ATS compatibility score |
| processing_status | CharField | `pending`, `processing`, `completed`, `failed` |
| vulnerability_report | JSONField | AI-found issues |
| strengths / weaknesses / suggestions | JSONField | AI analysis results |

---

## API Endpoints (planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register with email |
| POST | `/api/auth/login/` | Login, returns JWT pair |
| POST | `/api/auth/google/` | Google OAuth login |
| POST | `/api/auth/logout/` | Blacklist refresh token |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET/POST | `/api/resumes/` | List or create resumes |
| GET/PUT/DELETE | `/api/resumes/<id>/` | Retrieve, update, delete resume |
| POST | `/api/resumes/<id>/export-pdf/` | Generate and store PDF |
| POST | `/api/cv/upload/` | Upload CV for AI analysis |
| GET | `/api/cv/<id>/results/` | Get AI analysis results |

---

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8+
- Redis (for Celery)

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example CraftCv/.env
# Edit CraftCv/.env with your credentials

# Run migrations
cd CraftCv
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend runs at: `http://localhost:8000`
Admin panel: `http://localhost:8000/admin`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

> The Django server serves the **API only**. The React frontend is a separate app — you must run both simultaneously.

---

## Environment Variables

Create `backend/CraftCv/.env`:

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# MySQL
DB_NAME=craftcv
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_HOST=localhost
DB_PORT=3306

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=your-bucket-name

# OpenAI
OPENAI_API_KEY=your-openai-key

# Redis
REDIS_URL=redis://localhost:6379/0
```

---

## Docker Setup

```bash
docker-compose up --build
```

---

## Critical Information

### Security
- Never commit `.env` — it contains database passwords, API keys, and secret keys
- JWT access tokens expire in **15 minutes** — the frontend must auto-refresh using the refresh token
- Refresh tokens expire in **7 days** and are rotated and blacklisted on use
- CORS is restricted to `localhost:5173` (dev) and `craftcv.app` (prod)

### Why Django doesn't serve the frontend
Django is an **API-only backend** (returns JSON). The React frontend is a separate single-page application served by Vite on port 5173. In production, you would either:
- Build React (`npm run build`) and serve the `dist/` folder via Nginx
- Or deploy frontend separately (Vercel, Netlify) and backend separately (Railway, AWS)

### Celery Workers
AI CV scanning runs in the background. Without a running Celery worker, uploaded CVs will stay in `pending` status forever. Start workers with:
```bash
celery -A CraftCv worker --loglevel=info
```

### Database Migrations
After any model change:
```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Superuser (Admin)
- URL: `http://localhost:8000/admin`
- Username: `admin`
- Email: `samisamijj18@gmail.com`
- Password: `Admin@1234`

---

## License
Private project. All rights reserved.
