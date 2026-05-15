# SmartAssist Backend

Express.js backend for the SmartAssist triage and specialist appointment booking flow.

## Setup

```bash
cd Backend
npm install
```

Create or update `.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

# Optional AI setup. Leave AI_PROVIDER empty to use keyword fallback only.
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
AI_TIMEOUT_MS=8000
```

Add your Gemini, OpenAI, or Groq API key before expecting AI recommendations. If the key is missing or the provider rejects the configured model, SmartAssist automatically falls back to keyword logic.

## Run

```bash
npm run dev
```

Production-style run:

```bash
npm start
```

Base URL:

```text
http://localhost:5000
```

## Endpoints

### POST `/recommend`

Request:

```json
{
  "name": "Asha",
  "problemDescription": "I have back pain"
}
```

Response:

```json
{
  "success": true,
  "recommendedSpecialist": "Physiotherapist",
  "source": "Keyword"
}
```

`problem` is also accepted as an alias for `problemDescription`.

### GET `/specialists`

Returns all mock specialists.

Optional category filter:

```text
/specialists?category=Physiotherapist
```

### POST `/book`

Request:

```json
{
  "userName": "Asha",
  "specialistId": "physio-001",
  "bookingDate": "2026-05-14",
  "bookingTime": "10:30 AM"
}
```

Response:

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

`name`, `date`, and `time` are accepted as aliases for `userName`, `bookingDate`, and `bookingTime`.

## Recommendation Logic

The backend attempts AI classification first when `AI_PROVIDER` is set to `gemini`, `openai`, or `groq`. If the AI key is missing, the request fails, times out, or returns anything other than one allowed specialist name, the backend automatically uses keyword-based fallback logic.

Allowed specialist outputs:

- Dentist
- Physiotherapist
- Gym Trainer
- Salon Specialist
