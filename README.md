# SmartAssist

SmartAssist is an AI-powered triage and specialist appointment booking application. This repository contains the React/Vite frontend and Express.js backend.

## Tech Stack
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Language:** JavaScript (ESM)

## Features
- **AI-Powered Triage:** Communicates with the SmartAssist backend to classify health concerns.
- **Specialist Discovery:** Dynamic listing of medical and wellness specialists.
- **Appointment Booking:** Real-time slot selection and booking confirmation.
- **Legal & Support:** Includes Privacy Policy, Terms of Service, and Support pages.

## Deployment
- **Live Site:** [https://smart-assist-frontend-one.vercel.app](https://smart-assist-frontend-one.vercel.app)
- **Deployment Platform:** Vercel

## Configuration

For local Docker use, copy `backend/.env.example` to `backend/.env` and provide your Firebase and AI credentials. The service-account key must be stored at `backend/config/serviceAccountKey.json`; it is intentionally ignored by Git and Docker build contexts.

## Run with Docker

Prerequisites: Docker Desktop and Docker Compose.

```bash
# macOS/Linux
cp backend/.env.example backend/.env
# Add your Firebase service-account key at backend/config/serviceAccountKey.json
# Add GEMINI_API_KEY, GROQ_API_KEY, and OPENAI_API_KEY to backend/.env
docker compose up --build
```

On Windows PowerShell, use `Copy-Item backend/.env.example backend/.env` instead of `cp`.

Open `http://localhost:5173`. The frontend is served in one container and calls the backend at `http://localhost:5000/api` in the browser. The backend is available at `http://localhost:5000`.

The AI provider order is Gemini → Groq → OpenAI → deterministic keyword matching. Keep API keys out of Git.

## Scripts
- `npm run dev` - Start development server.
- `npm run build` - Build for production.
- `npm run lint` - Run ESLint.
- `npm run preview` - Preview production build.
