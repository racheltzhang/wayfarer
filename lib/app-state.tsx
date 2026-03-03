'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Trip, DraftActivity } from './types'

interface AppState {
  likedIds:            Set<string>
  savedIds:            Set<string>
  beenIds:             Set<string>
  followingIds:        Set<string>
  publishedTrips:      Trip[]
  // activities added to specific trips (tripId → DraftActivity[])
  tripAdditions:       Record<string, DraftActivity[]>
  // activity queued to be pre-loaded into a new trip from CreateFlow
  pendingActivity:     DraftActivity | null
  toggleLike:          (tripId: string) => void
  toggleSave:          (tripId: string) => void
  toggleBeen:          (tripId: string) => void
  toggleFollow:        (userId: string) => void
  publishTrip:         (trip: Trip) => void
  addActivityToTrip:   (tripId: string, act: DraftActivity) => void
  setPendingActivity:  (act: DraftActivity | null) => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [likedIds,        setLikedIds]        = useState<Set<string>>(new Set())
  const [savedIds,        setSavedIds]        = useState<Set<string>>(new Set())
  const [beenIds,         setBeenIds]         = useState<Set<string>>(new Set(['trip-1', 'trip-me-1']))
  const [followingIds,    setFollowingIds]    = useState<Set<string>>(new Set(['u1', 'u2']))
  const [publishedTrips,  setPublishedTrips]  = useState<Trip[]>([])
  const [tripAdditions,   setTripAdditions]   = useState<Record<string, DraftActivity[]>>({})
  const [pendingActivity, setPendingActivity] = useState<DraftActivity | null>(null)

  function toggle(
    set: Set<string>,
    setFn: React.Dispatch<React.SetStateAction<Set<string>>>,
    id: string,
  ) {
    setFn(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <AppStateContext.Provider value={{
      likedIds,
      savedIds,
      beenIds,
      followingIds,
      publishedTrips,
      tripAdditions,
      pendingActivity,
      toggleLike:    id  => toggle(likedIds,     setLikedIds,     id),
      toggleSave:    id  => toggle(savedIds,     setSavedIds,     id),
      toggleBeen:    id  => toggle(beenIds,      setBeenIds,      id),
      toggleFollow:  id  => toggle(followingIds, setFollowingIds, id),
      publishTrip:   trip => setPublishedTrips(prev => [trip, ...prev]),
      addActivityToTrip: (tripId, act) =>
        setTripAdditions(prev => ({
          ...prev,
          [tripId]: [...(prev[tripId] ?? []), act],
        })),
      setPendingActivity,
    }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
