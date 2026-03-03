'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import CreateFlow from '@/components/create/CreateFlow'
import { useAppState } from '@/lib/app-state'
import { MOCK_TRIPS } from '@/lib/mock-data'

function CreatePageInner() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const { publishedTrips } = useAppState()

  let tripToEdit = null
  if (editId) {
    // Look in user's published trips first, then mock trips
    tripToEdit = publishedTrips.find(t => t.id === editId)
      ?? MOCK_TRIPS.find(t => t.id === editId)
      ?? null
  }

  return <CreateFlow initialTrip={tripToEdit} />
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text3)' }}>Loading…</div>}>
      <CreatePageInner />
    </Suspense>
  )
}
