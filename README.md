# SmartAssist Backend

Backend API for **SmartAssist — Triage & Specialist Appointment Booking System**.

This server powers the specialist recommendation and booking workflow for the SmartAssist web app.

## Features

- Accepts user name and problem description.
- Recommends one specialist category:
  - Dentist
  - Physiotherapist
  - Gym Trainer
  - Salon Specialist
- Uses Gemini AI when configured.
- Falls back to keyword-based recommendation if AI fails, times out, or quota is exhausted.
- Supports mock specialist listing.
- Supports temporary appointment booking with mock data.
- Handles invalid input with centralized error responses.
- Uses modular Express structure with controllers, routes, services, middleware, utils, config, constants, and mock data.

## Tech Stack

- Node.js
- Express.js
- dotenv
- cors
- Gemini API integration
- Mock/static data only

No database, authentication, admin dashboard, file uploads, reminders, ratings, or analytics are implemented.

## Folder Structure

```text
Backend/
├── config/
├── constants/
├── controllers/
├── data/
├── middleware/
├── prompts/
├── routes/
├── services/
├── utils/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Setup

Install dependencies:

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` folder:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

AI_TIMEOUT_MS=15000
AI_MAX_RETRIES=2
```

For no AI cost or no API usage, leave `AI_PROVIDER` empty:

```env
AI_PROVIDER=
GEMINI_API_KEY=
```

The backend will then use keyword recommendation only.

## Docker Deployment (Hugging Face Spaces)

The backend includes a `Dockerfile` for easy deployment to Hugging Face Spaces or other container platforms.

1. Create a new Docker Space on Hugging Face.
2. Upload the `Backend/` contents.
3. Hugging Face Spaces default port is `7860`. The `Dockerfile` is pre-configured to use this port.
4. Set your environment variables (like `AI_PROVIDER`, `GEMINI_API_KEY`, etc.) in the Space settings.

## Run Backend locally

Development:

```bash
npm run dev
```

Normal start:

```bash
npm start
```

The backend runs at:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "message": "SmartAssist backend is running"
}
```

## API Endpoints

### POST `/recommend`

Recommends a specialist from the user problem description.

Request:

```json
{
  "name": "Asha",
  "problemDescription": "I have back pain"
}
```

Success response:

```json
{
  "success": true,
  "recommendedSpecialist": "Physiotherapist",
  "source": "AI"
}
```

`source` can be:

- `AI` when Gemini returns a valid recommendation.
- `Keyword` when keyword fallback is used.

Validation error:

```json
{
  "success": false,
  "message": "Problem description is required"
}
```

### GET `/specialists`

Returns all mock specialists.

```text
GET http://localhost:5000/specialists
```

Optional category filter:

```text
GET http://localhost:5000/specialists?category=Dentist
```

Response:

```json
{
  "success": true,
  "count": 2,
  "specialists": []
}
```

### POST `/book`

Creates a temporary mock booking.

Request:

```json
{
  "userName": "Asha",
  "specialistId": "physio-001",
  "bookingDate": "2026-05-14",
  "bookingTime": "10:30 AM"
}
```

Success response:

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "booking": {
    "id": "generated-id",
    "userName": "Asha",
    "specialistId": "physio-001",
    "specialistName": "Priya Natarajan",
    "specialistCategory": "Physiotherapist",
    "bookingDate": "2026-05-14",
    "bookingTime": "10:30 AM",
    "status": "confirmed",
    "createdAt": "generated-date"
  }
}
```

## Thunder Client Test Examples

Recommendation:

```json
{
  "name": "Kavin",
  "problemDescription": "enaku tooth pain ah iruku"
}
```

Booking:

```json
{
  "userName": "Kavin",
  "specialistId": "dentist-001",
  "bookingDate": "2026-05-14",
  "bookingTime": "11:00 AM"
}
```

Invalid booking slot:

```json
{
  "userName": "Asha",
  "specialistId": "physio-001",
  "bookingDate": "2026-05-14",
  "bookingTime": "09:00 PM"
}
```

Expected:

```json
{
  "success": false,
  "message": "Selected time slot is not available for this specialist"
}
```

## AI and Fallback Behavior

The backend tries Gemini first when:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key
```

If Gemini fails because of timeout, quota, rate limit, invalid response, or API error, the app automatically falls back to keyword logic.

This keeps the user flow working even when AI is unavailable.

## Safety Notes

- Do not commit `.env`.
- Do not place API keys in frontend code.
- Do not paste API keys in README files or screenshots.
- `.env` is ignored in `.gitignore`.
- Use placeholders only in documentation.
