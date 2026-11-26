import { useContext } from 'react'

import { SidebarProjectsContext } from '../context/SidebarContext'

export function useSidebarProjects() {
  return useContext(SidebarProjectsContext)
}
