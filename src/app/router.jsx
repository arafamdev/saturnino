import { createBrowserRouter } from 'react-router'

import PageLoader from '@/components/shared/PageLoader'

import PublicLayout from '@/layouts/PublicLayout'
import NavigationHistoryProvider from './navigation/NavigationHistoryProvider'

const pageRoutes = [
  // Public routes
  {
    path: '/',
    element: <PublicLayout />,
    HydrateFallback: PageLoader,
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Component } =
            await import('@/features/landing/pages/LandingPage')

          return { Component }
        },
      },
      {
        path: 'about',
        lazy: async () => {
          const { default: Component } =
            await import('@/features/about/pages/AboutPage')

          return { Component }
        },
      },
    ],
  },

  // Application routes
  {
    path: '/app',
    HydrateFallback: PageLoader,
    lazy: async () => {
      const { default: Component } = await import('@/layouts/AppLayout')

      return { Component }
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Component } =
            await import('@/features/dashboard/pages/OverviewPage')

          return { Component }
        },
      },
      {
        path: 'tasks',
        lazy: async () => {
          const { default: Component } =
            await import('@/features/tasks/pages/TasksPage')

          return { Component }
        },
      },
      {
        path: 'projects',
        lazy: async () => {
          const { default: Component } =
            await import('@/features/projects/pages/ProjectsPage')

          return { Component }
        },
      },
      {
        path: 'projects/:projectId',
        lazy: async () => {
          const { default: Component } =
            await import('@/features/projects/pages/ProjectDetailsPage')

          return { Component }
        },
      },
      {
        path: 'settings',
        lazy: async () => {
          const { default: Component } =
            await import('@/features/settings/pages/SettingsPage')

          return { Component }
        },
      },
    ],
  },

  // Fallback route
  {
    path: '*',
    HydrateFallback: PageLoader,
    lazy: async () => {
      const { default: Component } = await import('@/pages/NotFoundPage')

      return { Component }
    },
  },
]

export const routes = [
  { element: <NavigationHistoryProvider />, children: pageRoutes },
]

export function createAppRouter() {
  return createBrowserRouter(routes)
}
