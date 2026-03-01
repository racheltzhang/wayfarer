'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AppState {
  likedIds: Set<string>
  savedIds: Set<string>
  followingIds: Set<string>
  toggleLike: (tripId: string) => void
  toggleSave: (tripId: string) => void
  toggleFollow: (userId: string) => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [likedIds,     setLikedIds]     = useState<Set<string>>(new Set())
  const [savedIds,     setSavedIds]     = useState<Set<string>>(new Set())
  // Pre-follow a couple of people so the Following tab has content in the demo
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set(['u1', 'u2']))

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
      toggleLike:   id => toggle(likedIds,     setLikedIds,     id),
      toggleSave:   id => toggle(savedIds,     setSavedIds,     id),
      toggleFollow: id => toggle(followingIds, setFollowingIds, id),
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
