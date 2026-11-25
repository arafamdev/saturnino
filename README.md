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
