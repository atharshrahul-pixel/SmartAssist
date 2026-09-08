# Docker guide

## What Docker provides

Docker packages the application and its runtime dependencies into portable images. Instead of installing Node.js, Python, FFmpeg, Nginx, and npm dependencies separately on every machine, Docker Compose builds and starts the frontend and backend as coordinated containers.

Docker is optional for development, but this repository includes it so the complete application can be demonstrated and deployed consistently.

## Architecture

```text
Browser
  │ http://localhost:5173
  ▼
frontend container (Nginx + compiled React application)
  │ http://localhost:5000/api
  ▼
backend container (Node.js/Express + Whisper dependencies)
  │
  ├── Firebase Firestore, using a mounted service-account key
  ├── Gemini API (primary)
  ├── Groq API (first fallback)
  └── OpenAI API (second fallback)
```

If all AI providers fail, the backend uses deterministic keyword matching. This allows the triage route to continue returning a supported specialist recommendation without an LLM response.

## Docker files in this repository

| File | Purpose |
| --- | --- |
| `compose.yaml` | Starts the complete application with `docker compose up`. |
| `Dockerfile` | Builds the React frontend and serves the static build through Nginx. |
| `nginx.conf` | Makes React Router routes work after a browser refresh. |
| `.dockerignore` | Keeps frontend build context small and excludes local configuration. |
| `backend/Dockerfile` | Builds the Express API with Python, FFmpeg, and Whisper dependencies. |
| `backend/.dockerignore` | Prevents environment files and Firebase credentials from being baked into the backend image. |
| `backend/.env.example` | Lists the backend configuration variables without including secrets. |

## Prerequisites

- Docker Desktop, running with Linux containers. On Windows, Docker Desktop normally uses the WSL 2 backend.
- A Firebase project and a service-account JSON key, or a MongoDB URI if using MongoDB instead.
- At least a Gemini API key for AI triage. Groq and OpenAI keys are optional fallbacks.

No Docker Hub account is required to build and run the project locally.

## First-time setup

1. Create the backend environment file:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```

2. Keep `DB_PROVIDER=firebase` and save the Firebase Admin SDK key at:

   ```text
   backend/secrets/serviceAccountKey.json
   ```

   The `backend/secrets` directory is mounted into the backend container at `/run/secrets`. The JSON key is ignored by Git and excluded from the image.

3. Add provider keys to `backend/.env`:

   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=...
   GROQ_API_KEY=...
   OPENAI_API_KEY=...
   ```

4. Start the full stack:

   ```powershell
   docker compose up --build
   ```

5. Open `http://localhost:5173` in a browser. The backend health endpoint is `http://localhost:5000/health`.

To stop the stack, press `Ctrl+C`. To remove stopped containers, run `docker compose down`.

## Ports and networking

| Service | Container port | Host port | Use |
| --- | ---: | ---: | --- |
| Frontend | 80 | 5173 | Browser UI |
| Backend | 7860 | 5000 | API and `/health` endpoint |

The frontend build uses `http://localhost:5000/api` because API calls originate from the browser. The backend allows `http://localhost:5173` through its CORS configuration.

## Database configuration

### Firebase (default)

Use `DB_PROVIDER=firebase`. Docker Compose sets `FIREBASE_SERVICE_ACCOUNT_PATH` to the mounted key at `/run/secrets/serviceAccountKey.json`.

### MongoDB alternative

Set the following in `backend/.env`:

```env
DB_PROVIDER=mongodb
MONGODB_URI=mongodb+srv://...
```

Firebase credentials are not used in this mode. The secrets mount is harmless and can remain in place.

## AI fallback behavior

With `AI_PROVIDER=gemini`, requests use this sequence:

```text
Gemini → Groq → OpenAI → keyword engine
```

Each provider must have a corresponding API key to be usable. A missing or rejected key moves the request to the next option. The final keyword engine does not require an external API key.

## Security rules

- Never commit `backend/.env` or `backend/secrets/serviceAccountKey.json`.
- Never add Firebase keys or API keys directly to a Dockerfile, source file, or GitHub Actions log.
- The Firebase key is mounted at runtime, not copied into the image.
- Before public deployment, use a managed secret store and restrict Firebase service-account permissions to only what the backend needs.

## Useful commands

```powershell
# Build and start in the background
docker compose up --build -d

# Follow backend logs
docker compose logs -f backend

# Rebuild after Dockerfile or dependency changes
docker compose build --no-cache

# Stop and remove containers
docker compose down
```

## Troubleshooting

- **`docker` is not recognized:** install and start Docker Desktop, then reopen PowerShell.
- **Backend exits with “serviceAccountKey.json is missing”:** add the Firebase key at `backend/secrets/serviceAccountKey.json`, or configure MongoDB.
- **Frontend cannot reach the API:** ensure `http://localhost:5000/health` responds and do not change the Compose port mappings without changing `VITE_BACKEND_URL`.
- **AI falls back to keywords:** check the backend logs for the failed provider and verify API keys and provider quotas.
- **First build is slow:** the backend installs Python/Whisper dependencies; later builds reuse Docker layers when dependency files do not change.
