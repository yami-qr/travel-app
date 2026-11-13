# Itinera

A trip planner for building day-by-day itineraries, tracking budgets, and keeping a packing checklist.

## Features

- **Trips:** create a trip with a destination, dates, and a budget. Trips are saved in the browser.
- **Itinerary:** each day lists its activities, with a time, cost, and category. Activities can be reordered or removed.
- **Budget:** a progress bar shows the amount spent against the budget, with a warning when you go over. A breakdown shows spending by category.
- **Packing list:** add items and tick them off.
- **Validation:** forms explain what needs fixing before they save.

## Tech stack

- React 18 with TypeScript, built with Vite
- React Router for pages
- Vitest and React Testing Library for tests
- `localStorage` for saving data, with a small service that handles blocked or corrupt storage

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Then open the address shown in the terminal, usually http://localhost:5173.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm test` | Run the test suite once |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |

## Project structure

```
src/
  components/   Trip cards, forms, budget bar, packing list
  pages/        Trip detail page
  services/     Saving and loading trips
  types/        Trip, Day, Activity, and PackingItem types
  utils/        Budget, itinerary, and trip logic (pure functions, unit-tested)
```

The budget and itinerary logic lives in plain functions in `src/utils`, separate from the UI, so it is easy to test.

## Status

Core features are complete. Ideas for next steps: a map of each day's stops, live weather for the destination, currency conversion, and syncing trips to a server.
