'use client'

import BottomNav from '@/components/ui/BottomNav'
import { ToastProvider } from '@/components/ui/Toast'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <main className="flex flex-col flex-1 overflow-hidden">
        {children}
      </main>
      <BottomNav />
    </ToastProvider>
  )
}
