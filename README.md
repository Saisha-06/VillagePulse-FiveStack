# VillagePulse Frontend (React + Vite)

This is a minimal, milestone-ready frontend that connects (read-only) to your backend API.

## Features (Milestone Scope)
- React + Vite project inside `/frontend`
- Core UI components: Navbar, list view, detail view
- Live GET requests to your backend using `fetch`
- Basic responsive layout using CSS Grid / Flexbox
- Error + loading states
- Environment-based API base URL

## Expected Backend Endpoints (adjust if different)
- `GET /api/items` -> returns an array of items or `{ data: [...] }`
- `GET /api/items/:id` -> returns a single item (object) or `{ data: { ... } }`

Each item should have at least an `id` (or `_id`) and ideally `title`/`name`, `description`/`summary`.

## Quick Start

1. Put this folder at the root of your repository as `/frontend`.
2. Create `.env` with your API URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```
3. Install and run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open the shown local URL (default: http://localhost:5173).

## Adjusting Routes
Edit `src/api/client.js` to match your backend. Example:
```js
// If your backend exposes /api/v1/resources
export const api = {
  listItems: () => http('/api/v1/resources'),
  getItem: (id) => http(`/api/v1/resources/${id}`),
}
```

## Post-Milestone Ideas
- Add a Create Item form (POST)
- Add Update/Delete (PUT/PATCH/DELETE)
- Add pagination, search, and filters
- Add toasts, skeleton loaders, and nicer empty states
