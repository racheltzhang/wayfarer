'use client'

import { AppStateProvider } from '@/lib/app-state'
import { ToastProvider } from '@/components/ui/Toast'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AppStateProvider>
  )
}
