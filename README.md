# Saturnino

> Everything in its orbit.

Saturnino is a local-first project and task manager for organizing work without an account. A focused Kanban workspace brings project progress, priorities and deadlines into one place, with a compact interface inspired by the application's orbital identity.

Built as a React portfolio project, Saturnino combines practical task management with careful keyboard interactions, responsive layouts and data integrity. Work stays on your device, while English and Portuguese interfaces and light and dark themes make the workspace your own.

## Live Demo

[Open Saturnino](https://saturnino-ten.vercel.app)

Explore the application in your browser or install it from your browser menu when supported. No sign-in, API keys or configuration are required.

## Application Preview

Real application screenshots using fictional project data.

![Desktop Kanban board in dark mode](docs/images/kanban-desktop-dark.webp)

| Tablet · Light mode                                                        | Mobile · Light mode                                                        |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ![Tablet Kanban board in light mode](docs/images/kanban-tablet-light.webp) | ![Mobile Kanban board in light mode](docs/images/kanban-mobile-light.webp) |

## Features

- **Projects and tasks:** create, edit and organize work, track completion and keep favorite projects close through a customizable sidebar.
- **Kanban and list views:** move cards across four columns with drag and drop or keyboard-accessible menus. Add tasks directly to a column.
- **Focused task details:** edit in a side panel on desktop or a full-screen panel on mobile, with explicit saving, unsaved-change protection and concurrent-edit detection.
- **Search and planning:** combine filters, choose a sort order and set deadlines with a localized calendar.
- **Dashboard and preferences:** review progress and upcoming deadlines, switch themes and languages, and adjust desktop navigation.
- **Backup and offline use:** export JSON backups or CSV, restore a validated workspace and use the cached application after a completed online visit.

Projects and tasks belong to the current browser profile and origin. There is no cloud synchronization; changing devices or clearing browser data can make records unavailable. Keep JSON backups, especially before moving your workspace or clearing storage.

## Tech Stack

React 19 · JavaScript · Vite 8 · Tailwind CSS 4 · React Router · Dexie / IndexedDB · React Hook Form · Radix UI · dnd-kit · DayPicker · i18next · Workbox.

Quality checks use Vitest, React Testing Library, ESLint, Prettier and GitHub Actions. The application is hosted on Vercel.

## Getting Started

Use Node.js 26, the version used by CI, and npm.

```bash
git clone https://github.com/arafamdev/saturnino.git
cd saturnino
npm ci
npm run dev
```

Open the local URL printed by Vite. Run `npm test` for the test suite, `npm run lint` for linting and `npm run build` for a production build. Use `npm run preview` to preview that build, including offline caching.

## Author

**Arafam Mussa Silla**

[GitHub](https://github.com/arafamdev) · [LinkedIn](https://www.linkedin.com/in/arafam-mussa-silla-5a7866446/) · [Portfolio](https://arafam.dev)
