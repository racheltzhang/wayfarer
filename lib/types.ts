// ─── Core domain types ────────────────────────────────────────

export interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  trip_count: number
  follower_count: number
  following_count: number
  created_at: string
}

export interface Activity {
  id: string
  emoji: string
  text: string
  type: ActivityType
  notes: string | null
  position: number
}

export type ActivityType = 'food' | 'culture' | 'outdoors' | 'stay' | 'night' | 'transit' | 'other'

export interface Day {
  id: string
  trip_id: string
  title: string
  day_number: number
  activities: Activity[]
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface Trip {
  id: string
  title: string
  location: string
  country_emoji: string
  duration_days: number
  cover_image_url: string | null
  description: string | null
  visibility: 'public' | 'friends' | 'private'
  rating: number | null
  rating_count: number
  like_count: number
  tags: string[]
  days: Day[]
  author: Profile
  created_at: string
  // dates & season
  start_date?: string | null
  end_date?: string | null
  season?: Season | null
  approx_date_label?: string | null  // e.g. "Around March 2026, ~2 weeks"
  // viewer-specific state
  is_liked?: boolean
  is_saved?: boolean
  // coordinates for map
  lat?: number
  lng?: number
}

export interface Rating {
  id: string
  trip_id: string
  user_id: string
  score: number // 1–10
  created_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Photo {
  id: string
  trip_id: string
  url: string
  caption: string | null
  position: number
}

// ─── Create flow types ────────────────────────────────────────

export interface DraftActivity {
  emoji: string
  text: string
  type: ActivityType
}

export interface DraftDay {
  title: string
  activities: DraftActivity[]
}

export interface TripDraft {
  title: string
  location: string
  startDate: string | null
  endDate: string | null
  coverImageUrl: string | null
  description: string
  visibility: 'public' | 'friends' | 'private'
  rating: number | null
  tags: string
  days: DraftDay[]
}

// ─── API response shapes ──────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  nextCursor: string | null
}

export interface ApiError {
  message: string
  code?: string
}

// ─── Map types ────────────────────────────────────────────────

export interface MapPin {
  tripId: string
  title: string
  location: string
  rating: number | null
  coverImageUrl: string | null
  lat: number
  lng: number
}

// ─── Suggestion types ─────────────────────────────────────────

export interface ActivitySuggestion {
  emoji: string
  name: string
  type: ActivityType
}

// ─── Been / visited log ───────────────────────────────────────

export interface BeenMemory {
  emoji: string
  text: string
}

export interface BeenStop {
  emoji: string
  place: string
  note: string
}

export interface BeenItineraryDay {
  title: string        // e.g. "Day 1", "Arrival", "Amalfi drive"
  stops: BeenStop[]
}

export interface BeenTripData {
  tripId: string          // original trip id (if logging against a discovered trip)
  location: string
  dateType: 'exact' | 'approximate'
  startDate: string | null
  endDate: string | null
  approxMonth: string | null   // e.g. "March"
  approxYear: string | null    // e.g. "2024"
  approxSeason: Season | null
  notes: string
  photos: string[]
  memories: BeenMemory[]
  itinerary: BeenItineraryDay[]
}
