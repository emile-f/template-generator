# Template Generator Frontend

Lightweight Vite + React + TypeScript single-page app to send `project_id`, `customer_id`, `prompt`, and `template` to the template-generation backend, preview responses, and copy outputs.

## Quick start

1. Install dependencies: `npm install`
2. Copy env file and adjust if needed: `cp .env.example .env`
3. Run the dev server: `npm run dev`
4. Build for production: `npm run build`

## Scripts

- `npm run dev` — start Vite dev server.
- `npm run build` — type-check then build for production.
- `npm run preview` — preview the production build.
- `npm run lint` — run ESLint.
- `npm run test` — run Vitest unit tests.
- `npm run format` / `npm run format:write` — check or fix formatting with Prettier.

## Environment

- `VITE_API_URL`: Full endpoint for the generate-template API. Defaults to `https://bc7z6q05yc.execute-api.us-west-1.amazonaws.com/dev/generate-template` if unset.

## Features

- Glassmorphism UI with animated gradient blobs and Space Grotesk typography.
- Form with `project_id`, `customer_id`, `prompt`, and `template` (required for prompt/template). IDs fall back to demo-friendly defaults when left blank.
- Buttons for submit, reset, and loading of sample data.
- Loading state with spinner + disabled inputs during requests.
- Response panel showing raw JSON, heuristics-based preview text and image URLs, copy-to-clipboard actions, and retry-able error banner.
- Accessibility touches: labels, focus outlines, aria-live status messaging.

## Testing

- Vitest unit test for the API client covering success, HTTP error, and timeout cases (`src/lib/api.test.ts`).

## Deploying

- Build the static site with `npm run build`; upload the `dist/` directory to your static hosting (e.g., S3 static site with `index.html` as index/error page). Ensure the API endpoint allows CORS from the hosting origin.
