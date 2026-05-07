# Roommate Finder — Next.js Frontend

React/Next.js 14 frontend for the Roommate Finder Django backend.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your backend URLs
npm run dev
```

## Pages

| Route | Description |
|-------|-------------|
| /auth/login | Login page |
| /auth/register | Register page |
| /dashboard/listings | Browse & search listings |
| /dashboard/listings/[id] | Listing detail + match/message |
| /dashboard/matches | Compatibility suggestions + my matches |
| /dashboard/chat | Conversations list |
| /dashboard/chat/[id] | Real-time chat (WebSocket) |
| /dashboard/profile | Edit profile + preferences |
| /dashboard/notifications | Notification feed |
| /dashboard/admin | Admin dashboard (staff only) |

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (auth state)
- React Hook Form + Zod (validation)
- Axios (API client with JWT refresh)
- WebSocket (real-time chat)
- react-hot-toast (notifications)
