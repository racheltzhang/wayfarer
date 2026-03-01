'use client'

import { useToast } from '@/components/ui/Toast'

export default function FeedHeader() {
  const { showToast } = useToast()

  return (
    <div className="px-5 pt-14 pb-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="font-head text-[26px] font-normal">Hello, Rachel ✦</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>Discover where friends are exploring</p>
      </div>
      <button className="btn-icon" onClick={() => showToast('🔔 No new notifications')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
    </div>
  )
}
