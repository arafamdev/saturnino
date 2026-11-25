import { Outlet } from 'react-router'

import LandingHeader from '@/features/landing/components/LandingHeader'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
