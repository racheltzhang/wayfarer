'use client'

import BottomNav from '@/components/ui/BottomNav'
import { ToastProvider } from '@/components/ui/Toast'
import { AppStateProvider } from '@/lib/app-state'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <ToastProvider>
        <main className="flex flex-col flex-1 overflow-hidden">
          {children}
        </main>
        <BottomNav />
      </ToastProvider>
    </AppStateProvider>
  )
}
