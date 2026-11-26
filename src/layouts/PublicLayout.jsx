import { Outlet } from 'react-router'

import PublicFooter from '@/components/shared/PublicFooter'
import LandingHeader from '@/features/landing/components/LandingHeader'

import useScrollToLocation from '@/hooks/useScrollToLocation'

function PublicLayout() {
  useScrollToLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  )
}

export default PublicLayout
