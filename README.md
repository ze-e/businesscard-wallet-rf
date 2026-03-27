# Digital Business Card Deck

Hosted web app for capturing physical business cards, extracting structured contact data with OpenAI Vision, reviewing edits, storing a searchable deck, and exporting CSV/JSON.

## Stack
- TypeScript
- Next.js (App Router)
- PostgreSQL + Prisma
- Zod runtime validation
- OpenAI Responses API (Vision)
- PWA service worker + IndexedDB cache for offline read/search/export

## Required Setup
1. Install Node.js 20+ and npm.
2. Copy `.env.example` to `.env` and set values.
3. Install dependencies:
   - `npm install`
4. Generate Prisma client:
   - `npm run prisma:generate`
5. Run migrations:
   - `npm run prisma:migrate`
6. Start app:
   - `npm run dev`

## User API Key (BYOK)
- Open the app and go to `/settings`.
- Enter a stable user ID and your OpenAI API key.
- API key is encrypted at rest in `UserSettings.encryptedApiKey`.
- Extraction endpoint requires this key; no card extraction works until it is set.

## Offline Behavior
- Works offline for cached browsing/searching/exporting.
- New card capture/upload/extraction requires internet.

## API Endpoints
- `POST /api/cards/extract`
- `POST /api/cards`
- `POST /api/cards/merge`
- `GET /api/cards`
- `GET /api/export?format=csv|json`
- `GET/POST /api/settings/api-key`

## Notes
- Required field: `name`.
- Optional fields: company, phones, emails, websites, and all others.
- Duplicate workflow supports merge override or save-as-new.