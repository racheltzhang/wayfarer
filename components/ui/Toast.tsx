'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface ToastCtx {
  showToast: (msg: string) => void
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = { current: null as ReturnType<typeof setTimeout> | null }

  const showToast = useCallback((message: string) => {
    setMsg(message)
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 2300)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="absolute bottom-[92px] left-1/2 z-[200] flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap pointer-events-none transition-all duration-300"
        style={{
          transform: `translateX(-50%) translateY(${visible ? '0' : '16px'})`,
          opacity: visible ? 1 : 0,
          background: 'var(--bg3)',
          border: '1px solid var(--gold-dim)',
          color: 'var(--text)',
        }}
      >
        {msg}
      </div>
    </ToastContext.Provider>
  )
}
