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

## Task Management

Open **My Tasks** to manage all tasks, or open a project for its own task list. Every task belongs to a project and includes a title, description, status, priority and optional due date. Creation, editing and confirmed deletion update all relevant views reactively.

Tasks use four statuses (Backlog, To do, In progress, Done) and four priorities (Low, Medium, High, Urgent). Due dates are calendar dates; creation, modification and completion use ISO timestamps. Reopening a completed task clears its completion timestamp. Project/task writes validate the project relationship inside a database transaction, and deleting a project still deletes its tasks atomically.

Data remains in IndexedDB in the current browser profile and origin. No account or cloud service is required. Browser data clearing can remove local records; JSON backup and restore are available in Settings; offline application-shell caching is a separate upcoming roadmap feature.

## Kanban Board

Inside a project, switch between **List** and **Board**. The board groups tasks into Backlog, To do, In progress and Done. Drag a card by its handle to another column or onto another card to change its position. A column background appends the task; dropping onto a card uses that card's position. Escape cancels a drag.

Every card also offers a status selector and move-up/down buttons, so moving tasks does not require a dragging gesture. The selector inserts at the start of the chosen status. On mobile, choose the visible column using the column selector. Successful moves restore focus to the corresponding control in the destination column.

Movement re-reads persisted tasks and renumbers both affected columns in one IndexedDB transaction. A failed write preserves the previous order; a task edited during the gesture produces a conflict message. Moving to Done records completion, and reopening clears it. The board loads on demand and does not add drag-and-drop code to the global task list until opened.

## Search and Filters

Search task titles and descriptions without case or accent differences. Combine status, priority and due-date filters; **My Tasks** also filters by project. Deadlines can show overdue, today, after today or undated tasks. Completed tasks are excluded from overdue results and warnings.

Sort by manual order, earliest due date (undated tasks last), highest priority, natural title order or latest update. Sorting changes presentation only. The result count and empty-result message reflect the combined criteria; **Clear filters** restores the default view. Filters apply to both list and board and remain local to the current collection view.

While filters or an alternative sort are active, board dragging and position buttons are unavailable because hidden cards would make insertion positions ambiguous. Clear filters and select manual order to reorder. Status selectors remain available; if changing status hides a card, focus returns to the board.

## Dashboard

**Overview** shows project/task totals, open and completed tasks, overdue work and the completion rate. Status distribution includes text counts and percentages; project progress uses labelled native progress bars. The six most recently updated projects link to their details, and the next five unfinished deadlines include today and later dates.

Metrics come from a consistent read-only snapshot of projects and tasks and update reactively after local changes. No derived counters are stored in the database. Empty, loading and storage-error states have distinct feedback and retry. The civil day refreshes after local midnight and when the tab regains focus or visibility, keeping dashboard deadlines, filters and overdue labels current.

## Settings

**Settings** provides explicit light/dark theme and English/Portuguese selection, sharing the same state as the header. Desktop sidebar width, compact mode and section customization reuse the existing sidebar preferences. Resetting sidebar preferences changes layout/history only and preserves projects and favorites.

Preferences apply immediately and are saved in localStorage when available; controls remain usable in memory if storage is blocked. Projects and tasks remain separately in IndexedDB in this browser profile. No account or cross-device synchronization is required or provided by V1.

## Backup, Restore and CSV

In **Settings → Data management**, download a versioned JSON backup of all projects and tasks, or export tasks as UTF-8 CSV. JSON preserves IDs, relationships, favorites, positions and timestamps. Interface preferences are separate and are not included. Files are processed locally without an upload to a server.

To restore, select a Saturnino JSON backup (up to 20 MiB). The application validates the full format and relationships before showing the current and incoming counts. **Replace workspace** requires explicit confirmation and replaces all current projects/tasks. Download a backup first if you need to preserve the current workspace. Cancel leaves records unchanged.

Both tables are replaced in one transaction. A failed write rolls back every change. If local records change after preview, restore is refused; cancel and select the backup again to review the latest state. Unknown versions, malformed records, duplicate IDs/positions and orphan tasks are rejected.

CSV is export-only and intended for analysis. Fields are quoted and escaped; formula-like values receive a tab prefix, including Unicode variants. This changes the exported cell text and reduces spreadsheet formula interpretation, but spreadsheet applications and re-saving behavior differ. JSON is the exact restoration format.

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
