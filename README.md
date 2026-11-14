# Itinera

A trip planner for building day-by-day itineraries, tracking budgets, and keeping a packing checklist.

**Live demo:** https://itinera-olive.vercel.app

## Features

- **Quick start:** type a destination in the hero, or pick one of the suggested countries and places, and the new-trip form opens with it filled in.
- **Trips:** create a trip with a destination, dates, and a budget. Trips are saved in the browser.
- **Itinerary:** each day lists its activities, with a time, cost, and category. Activities can be reordered or removed.
- **Budget:** a progress bar shows the amount spent against the budget, with a warning when you go over. A breakdown shows spending by category.
- **Packing list:** add items and tick them off.
- **Summary tiles:** totals for trips, days, activities, and spending across every trip.
- **Validation:** forms explain what needs fixing before they save.

## Design

- The home page has a hero with a live phone preview of your latest trip, a destinations section, a feature overview, your trips, and a tech stack section.
- All artwork is drawn in SVG by the `Scenery` component, so the app ships no image files.
- The new-trip form opens in a dialog that traps focus, closes on Escape, and returns focus to the button that opened it.
- The layout adapts from phone to desktop widths, and animations are turned off for people who prefer reduced motion.

## Tech stack

- React 18 with TypeScript, built with Vite
- React Router for pages
- Vitest and React Testing Library for tests
- `localStorage` for saving data, with a small service that handles blocked or corrupt storage
- Plain CSS with custom properties for the colour and spacing tokens

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
  components/   Page sections, trip cards, forms, modal, icons, and scenery artwork
  data/         Destinations, sample trips, and site links
  pages/        Home page and trip detail page
  services/     Saving and loading trips
  styles/       Stylesheets: tokens and base, site chrome, home, trips, detail
  types/        Trip, Day, Activity, and PackingItem types
  utils/        Budget, itinerary, date, and statistics logic (pure functions, unit-tested)
```

The budget and itinerary logic lives in plain functions in `src/utils`, separate from the UI, so it is easy to test.

## Deployment

The app is deployed on Vercel. `vercel.json` sends every path to `index.html`, so links to a trip page work when opened directly.

## Status

Core features are complete. Ideas for next steps: a map of each day's stops, live weather for the destination, currency conversion, and syncing trips to a server.
