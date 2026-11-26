import { LayoutDashboard, ListTodo, FolderKanban, Settings } from 'lucide-react'

export const navigationItems = [
  {
    labelKey: 'navigation.overview',
    to: '/app',
    icon: LayoutDashboard,
    end: true,
  },
  {
    labelKey: 'navigation.tasks',
    to: '/app/tasks',
    icon: ListTodo,
  },
  {
    labelKey: 'navigation.projects',
    to: '/app/projects',
    icon: FolderKanban,
  },
  {
    labelKey: 'navigation.settings',
    to: '/app/settings',
    icon: Settings,
  },
]
