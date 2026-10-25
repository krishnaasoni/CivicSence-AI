# CivicSense AI — Civic & Sustainability Intelligence Platform

> **Cinematic, AI-First Civic Intelligence OS** powered by **Next.js 14 (App Router)**, **Tailwind CSS**, **Framer Motion**, **React-Leaflet**, and **FastAPI** with **Google Gemini 1.5 Flash**.

---

## ⚡ Quick Start

### 1. Backend (FastAPI + Google GenAI)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

- **Interactive API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)
- **Gemini API Key:** Add your key to `backend/.env`:
  ```env
  GEMINI_API_KEY="your-google-ai-studio-key"
  ```

---

### 2. Frontend (Next.js 14 App Router + Framer Motion)

```powershell
cd frontend
npm run dev
```

- **Web Application:** [http://localhost:3000](http://localhost:3000)

---

## 🎨 Design System & Palette

- **Cinematic Dark Slate Background:** `#0b0f19`
- **Eco / Civic Gradient:** `#10b981` (Emerald) to `#06b6d4` (Cyan)
- **Alert / Priority Highlight:** `#f59e0b` (Saffron/Amber) & `#f43f5e` (Rose)
- **Glassmorphism Panels:** `bg-slate-900/65 backdrop-blur-xl border border-slate-800` with subtle neon elevation.
- **Geospatial Map:** Dark-adapted Leaflet GIS with interactive incident markers.
