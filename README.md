# ElectED

ElectED is a React + Vite civic education app focused on helping people understand elections in a calm, practical, and nonpartisan way. It combines interactive learning, multilingual UI support, and Gemini-powered assistance for things like voter planning, claim checking, and document explanation.

## What it includes

- A landing experience with election education highlights and quick navigation
- A process page that explains how elections work
- A guide page for voter learning and civic participation
- A quiz with adaptive Gemini coaching based on missed questions
- An Action Center for practical election help
- Grounded election Q&A with citations
- Personalized voting plans
- Election document explanation for uploaded files
- Claim checking for voting misinformation
- Ballot and manifesto plain-language summaries
- Scenario simulation for edge-case voting situations
- Saved sessions with copy, share, and export support
- Language switching for a more accessible experience

## Tech stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Firebase
- Google Gemini API
- Vitest + Testing Library

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

Copy `.env.example` to `.env` and fill in the values you want to use.

Required for Gemini features:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

You can also provide multiple Gemini keys:

```env
VITE_GEMINI_API_KEYS=key_one,key_two
```

Optional Firebase config for cloud-saved sessions:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

If Firebase is not configured, session saving falls back to local browser storage where supported by the app.

## Available scripts

```bash
npm run dev
npm run build
npm run test
npm run preview
```

## Local development

Start the dev server:

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Production build

Create a production build:

```bash
npm run build
```

The built files are generated in `dist/`.

## Notes

- This project is designed to stay neutral and avoid partisan persuasion.
- Gemini-powered answers can still vary by location and time, so users should verify deadlines and legal requirements with official election authorities.
- Uploaded document support is validated before processing, with accepted formats including PDF, TXT, PNG, JPG, and WEBP.

## Status

The current project build completes successfully with `npm run build`.
