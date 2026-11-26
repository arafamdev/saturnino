# Saturnino

> Everything in its orbit.

Saturnino is a project management and productivity application designed to help people organize their projects, manage tasks, and stay focused.

## Philosophy

Organize. Focus. Evolve.

## Project Status

Currently in development.

## Tech Stack

### Core

- React 19
- JavaScript
- Vite
- React Router

### Styling and UI

- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide React
- Inter

### Testing

- Vitest
- React Testing Library
- jsdom

### Code Quality and Automation

- ESLint
- Prettier
- GitHub Actions

## Architecture

Saturnino follows a hybrid feature-based architecture, separating application configuration, business features, shared components, layouts, and utilities.

## Smart Sidebar

The sidebar lists favorite, recently visited and all projects. Project Explorer supports search, natural alphabetical/numeric sorting, creation, editing and confirmed deletion. Project changes react to IndexedDB updates through Dexie.

Choose **Customize sidebar** to hide optional sections or change their order. Drag a handle with a mouse or touch, press Up/Down on a focused handle, or use the move buttons. Workspace navigation cannot be hidden. Desktop and mobile share section preferences.

On desktop, drag the sidebar edge to resize between 224 and 400 pixels. Focus the separator and use Left/Right (16-pixel steps), Home (minimum) or End (maximum). Compact mode provides icon navigation with keyboard-accessible tooltips; expand it to access project sections and customization. Mobile always uses the full navigation drawer.

Preferences are stored locally under `saturnino:sidebar-preferences`. Older preferences are filled with defaults; invalid fields are normalized. **Reset sidebar preferences** restores section order, visibility, expansion, width and compact mode, and clears recent history. It does not change projects or favorites. If storage is unavailable, navigation remains usable, but preferences may not survive a reload.

For contributors: `SidebarProvider` owns reducer state and a shared sidebar project query. `useReducer` applies immutable preference changes; `useContext` shares them; `useEffect` persists preferences and verifies missing history references; `useRef` tracks focus targets and pointer gestures; local `useState` previews resizing without writing storage on every movement. Project data continues through the repository and Dexie, separately from UI preferences.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/arafamdev/saturnino.git
cd saturnino
```

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

## Available Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start the development server |
| `npm run build`        | Create a production build    |
| `npm run preview`      | Preview the production build |
| `npm run lint`         | Check code quality           |
| `npm run format`       | Format project files         |
| `npm run format:check` | Check code formatting        |
| `npm test`             | Run all automated tests      |
| `npm run test:watch`   | Run tests in watch mode      |

## Continuous Integration

GitHub Actions automatically checks code formatting, linting, automated tests, production builds, and production dependency security.

---

Built with purpose. Inspired by legacy.
