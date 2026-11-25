import { createBrowserRouter } from 'react-router'

import PublicLayout from '@/layouts/PublicLayout'
import AppLayout from '@/layouts/AppLayout'

import LandingPage from '@/features/landing/pages/LandingPage'
import OverviewPage from '@/features/dashboard/pages/OverviewPage'
import TasksPage from '@/features/tasks/pages/TasksPage'
import ProjectsPage from '@/features/projects/pages/ProjectsPage'
import ProjectDetailsPage from '@/features/projects/pages/ProjectDetailsPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'
import AboutPage from '@/features/about/pages/AboutPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectDetailsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
