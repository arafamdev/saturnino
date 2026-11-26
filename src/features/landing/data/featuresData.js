import {
  ChartNoAxesCombined,
  Columns3,
  Flag,
  Layers,
  ListChecks,
  Moon,
} from 'lucide-react'

export const features = [
  {
    id: 'visual-kanban',
    icon: Columns3,
    title: 'Visual Kanban',
    description:
      'See your work move from idea to completion with a clear, visual workflow.',
  },
  {
    id: 'project-management',
    icon: Layers,
    title: 'Project Management',
    description:
      'Keep every project organized in its own space, without losing sight of the bigger picture.',
  },
  {
    id: 'task-management',
    icon: ListChecks,
    title: 'Task Management',
    description:
      'Break complex work into manageable tasks and stay focused on your next step.',
  },
  {
    id: 'smart-priorities',
    icon: Flag,
    title: 'Smart Priorities',
    description: 'Give your most important tasks the attention they deserve.',
  },
  {
    id: 'progress-tracking',
    icon: ChartNoAxesCombined,
    title: 'Progress Tracking',
    description:
      'Understand how far you have come and see what is left to accomplish.',
  },
  {
    id: 'personal-workspace',
    icon: Moon,
    title: 'Your Space, Your Way',
    description:
      'Choose between light and dark themes for a workspace that feels right for you.',
  },
]
