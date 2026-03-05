'use client'

import BottomNav from '@/components/ui/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex flex-col flex-1 overflow-hidden">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
