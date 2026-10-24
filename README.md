# pagKASarap

A React product management app for browsing and managing a food menu.

## Features

- Product cards with cuisine filters, search, and sorting
- Dedicated product pages with descriptions and specifications
- Add, edit, and remove dishes with form validation and image uploads
- Cart quantity controls, per-dish subtotals, and order totals
- Overall inventory value, low-stock warnings, and sold-out labels

Product changes are saved in the browser's local storage. The cart is kept in memory for the current session.

## Run locally

Install Node.js with npm, then run these commands from the project folder:

```sh
npm ci
npm run dev
```

## Checks and production build

```sh
npm run lint
npm run build
npm run preview
```

Built with React, Vite, and Lucide icons.
