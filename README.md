# person-website

A personal portfolio site built with Next.js App Router.

## What’s here

- `/` — landing page with decorative UI and contact links
- `/photoblog` — photo gallery with fullscreen modal viewing
- `/games-and-toys` — archive of small interactive projects

## Getting started

### Requirements

- Node.js 20.9 or newer

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — start the production server
- `npm run lint` — run ESLint

## Project structure

- `src/app/layout.tsx` — root layout and metadata
- `src/app/page.tsx` — homepage
- `src/app/photoblog/page.tsx` — photoblog route
- `src/app/games-and-toys/page.tsx` — games-and-toys archive
- `src/app/components/` — shared UI components
- `src/assets/` — imported static assets
- `public/` — public static files

## Notes

- The app uses Next.js, React, TypeScript, and Tailwind CSS.
- Content for the photoblog is stored in `src/app/photoblog/photos.json`.
- The games-and-toys page is backed by files under `public/games-and-toys/`.
