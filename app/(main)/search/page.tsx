'use client'

import dynamic from 'next/dynamic'
import { useAppState } from '@/lib/app-state'
import { MAP_PINS } from '@/lib/mock-data'

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

export default function SearchPage() {
  const { beenIds, savedIds } = useAppState()

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 64px)' }}>
      {/* Pin legend */}
      <div
        className="flex items-center gap-4 px-4 py-2 flex-shrink-0"
        style={{
          background: 'rgba(11,11,20,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          position: 'absolute',
          bottom: 64,
          left: 0, right: 0,
          zIndex: 20,
        }}
      >
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text2)' }}>
          <span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
            background: '#4ECBA0', border: '1.5px solid #fff',
          }} />
          Been
        </div>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text2)' }}>
          <span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
            background: '#E8583A', border: '1.5px solid #fff',
          }} />
          Want to go
        </div>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text2)' }}>
          <span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
            background: 'var(--gold)', border: '1.5px solid #fff',
          }} />
          Other trips
        </div>
      </div>

      <MapView
        pins={MAP_PINS}
        beenTripIds={beenIds}
        savedTripIds={savedIds}
      />
    </div>
  )
}
