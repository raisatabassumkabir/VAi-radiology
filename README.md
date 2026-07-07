# Full-Stack Kanban & Annotation Workspace

This project contains two primary folders:
- `backend/`: Django API backend serving on `http://localhost:8000/api/`
- `frontend/`: Next.js client serving on `http://localhost:3000/`

---

## 🛠️ Getting Started

### 1. Running the Django Backend
Open a terminal in the `backend` directory and run:

```bash
# Activate virtual environment
.\venv\Scripts\activate

# Run server
python manage.py runserver
```

The server will start at `http://localhost:8000/`. API documentation/endpoints are:
- Task list/create: `http://localhost:8000/api/tasks/`
- Filter by date: `http://localhost:8000/api/tasks/?date=2026-07-06`
- Annotated Image library: `http://localhost:8000/api/annotated-images/`

---

### 2. Running the Next.js Frontend
Open a separate terminal in the `frontend` directory and run:

```bash
# Run development server
npm run dev
```

Open `http://localhost:3000` in your web browser. You can navigate between:
- **Kanban Board** at `/tasks`
- **Annotation Studio** at `/annotate`
