'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Trip, DraftActivity } from './types'

interface AppState {
  likedIds:         Set<string>
  savedIds:         Set<string>
  followingIds:     Set<string>
  publishedTrips:   Trip[]
  savedActivities:  DraftActivity[]          // clipboard: activities copied from other trips
  toggleLike:       (tripId: string) => void
  toggleSave:       (tripId: string) => void
  toggleFollow:     (userId: string) => void
  publishTrip:      (trip: Trip) => void
  saveActivity:     (act: DraftActivity) => void
  removeActivity:   (index: number) => void
  clearActivities:  () => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [likedIds,        setLikedIds]        = useState<Set<string>>(new Set())
  const [savedIds,        setSavedIds]        = useState<Set<string>>(new Set())
  // Pre-follow a couple of people so the Following tab has content in demo
  const [followingIds,    setFollowingIds]    = useState<Set<string>>(new Set(['u1', 'u2']))
  const [publishedTrips,  setPublishedTrips]  = useState<Trip[]>([])
  const [savedActivities, setSavedActivities] = useState<DraftActivity[]>([])

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
      followingIds,
      publishedTrips,
      savedActivities,
      toggleLike:    id  => toggle(likedIds,     setLikedIds,     id),
      toggleSave:    id  => toggle(savedIds,     setSavedIds,     id),
      toggleFollow:  id  => toggle(followingIds, setFollowingIds, id),
      publishTrip:   trip => setPublishedTrips(prev => [trip, ...prev]),
      saveActivity:  act  => setSavedActivities(prev => {
        // avoid exact duplicates
        if (prev.some(a => a.text === act.text && a.type === act.type)) return prev
        return [...prev, act]
      }),
      removeActivity: idx => setSavedActivities(prev => prev.filter((_, i) => i !== idx)),
      clearActivities: ()  => setSavedActivities([]),
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
