# SmartAssist Frontend

SmartAssist is an AI-powered triage and specialist appointment booking interface built with React and Vite.

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
The frontend communicates with the backend hosted on Hugging Face. The base API URL is configured in the component files. Ensure your backend CORS settings allow requests from this Vercel domain.

## Scripts
- `npm run dev` - Start development server.
- `npm run build` - Build for production.
- `npm run lint` - Run ESLint.
- `npm run preview` - Preview production build.
