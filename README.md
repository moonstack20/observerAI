# Observer AI — AI-Powered Code Review Assistant

Observer AI is a full-stack web application that performs automated static analysis and AI-powered code review for **Python** and **C** source code. Users can upload files or paste code directly, and receive a detailed report covering code quality, security vulnerabilities, complexity metrics, and AI-generated suggestions — downloadable as PDF or Markdown.

**Live Demo:** [https://observer-ai.vercel.app](https://observer-ai.vercel.app)
**Backend API:** [https://observerai.onrender.com](https://observerai.onrender.com)

---

## Features

- **User Authentication** — JWT-based register/login with password strength validation
- **Multi-language support** — Python and C
- **Upload or Paste Code** — drag-and-drop file upload or direct code paste with automatic language detection
- **Static Analysis**
  - Python: Pylint, Bandit, Radon
  - C: Cppcheck, Flawfinder, Lizard
- **AI Code Review** — powered by Google Gemini, covering bugs, security issues, code smells, refactoring suggestions, and best practices
- **Downloadable Reports** — export any review as a PDF or Markdown file
- **Review History** — search, filter by language, view details, and delete past reviews
- **Dashboard** — visual overview with charts (issue distribution, recent quality scores)
- **Input Validation** — file size limits (5MB), line limits (5000), empty file/code detection

---

## Tech Stack

**Frontend:** React (Vite), React Router, Axios, Recharts, Lucide Icons
**Backend:** Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS
**Database:** PostgreSQL (hosted on Supabase)
**AI:** Google Gemini API (`gemini-flash-latest`)
**Static Analysis Tools:** Pylint, Bandit, Radon, Cppcheck, Flawfinder, Lizard
**Deployment:** Render (backend, Docker), Vercel (frontend)

---

## Database Schema (Supabase / PostgreSQL)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key |
| name | String(100) | |
| email | String(150) | Unique |
| password_hash | String(255) | bcrypt hashed |
| created_at | DateTime | |

### `projects`
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key |
| user_id | Integer | Foreign key → users.id |
| name | String(150) | |
| description | Text | |
| created_at | DateTime | |

### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key |
| project_id | Integer | Foreign key → projects.id |
| filename | String(255) | |
| file_path | String(500) | |
| language | String(20) | "python" or "c" |
| quality_score | Float | Overall score out of 10 |
| analysis_data | Text | Full analysis result, stored as JSON |
| status | String(50) | "uploaded" or "analyzed" |
| created_at | DateTime | |

### `review_findings`
Reserved table for future granular finding storage (not currently populated — analysis results are stored as JSON in `reviews.analysis_data`).

---

## API Documentation

Base URL (local): `http://127.0.0.1:5000/api`
Base URL (production): `https://observerai.onrender.com/api`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user `{name, email, password}` |
| POST | `/auth/login` | Login, returns JWT `{email, password}` |
| GET | `/auth/me` | Get current user (requires auth) |

### Upload & Analysis
| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload` | Upload a `.py`/`.c`/`.h` file (multipart/form-data) |
| POST | `/paste` | Submit pasted code `{code}`, auto-detects language |
| POST | `/analyze/<review_id>` | Run static + AI analysis on a review |
| GET | `/review/<review_id>` | Get full review details including analysis |

### Reviews / History
| Method | Endpoint | Description |
|---|---|---|
| GET | `/reviews` | List reviews, supports `?search=` and `?language=` query params |
| DELETE | `/review/<review_id>` | Delete a review |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/report/<review_id>/pdf` | Download review as PDF |
| GET | `/report/<review_id>/markdown` | Download review as Markdown |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/summary` | Returns totals, avg score, issue distribution, recent scores |

All endpoints except `/auth/register` and `/auth/login` require a `Authorization: Bearer <token>` header.

---

## Sample Test Cases

**Python — triggers Pylint conventions, Bandit HIGH security issue:**
```python
import subprocess

def run(cmd):
    subprocess.call(cmd, shell=True)

password = "hardcoded123"
```

**C — triggers Cppcheck warning, Flawfinder HIGH risk (buffer overflow):**
```c
#include <stdio.h>
#include <string.h>

void copy(char *src) {
    char dest[10];
    strcpy(dest, src);
}

int main() {
    char buf[20];
    gets(buf);
    copy(buf);
    return 0;
}
```

**Validation test cases:**
- Empty file → `"File is empty"`
- File > 5MB → `"File exceeds maximum size of 5 MB"`
- File > 5000 lines → `"File exceeds maximum of 5000 lines"`
- Unsupported extension (e.g. `.txt`) → `"Only .py, .c, .h files are allowed"`

---

## Local Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=your-postgres-connection-string
GEMINI_API_KEY=your-gemini-api-key

Run:
```bash
python3 app.py
```

### Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
VITE_API_URL=http://127.0.0.1:5000/api

Run:
```bash
npm run dev
```

---

## Deployment

- **Backend:** Deployed on Render using a Docker build (installs `cppcheck` via apt, then Python dependencies). See `backend/Dockerfile`.
- **Frontend:** Deployed on Vercel, root directory `frontend`, with `VITE_API_URL` pointing to the live Render backend.
- **Database:** Supabase PostgreSQL, connected via the Session Pooler connection string (IPv4-compatible).

---

## Project Structure
observerAI/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── extensions.py
│   ├── Dockerfile
│   ├── models/          # SQLAlchemy models
│   ├── routes/           # Flask blueprints (auth, upload, analysis, report, dashboard)
│   ├── services/          # Analysis engines, AI review, report generation
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/         # Landing, Login, Register, Dashboard, Upload, History
│   │   ├── components/    # Navbar, Sidebar, Layout, ProtectedRoute
│   │   └── services/       # API client
│   └── package.json
└── README.md
