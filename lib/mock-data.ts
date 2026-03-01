import type { Trip, Profile, ActivitySuggestion } from './types'

// ─── Mock profiles ────────────────────────────────────────────

export const MOCK_PROFILES: Profile[] = [
  { id: 'u1', username: 'maya_chen', full_name: 'Maya Chen', avatar_url: 'https://i.pravatar.cc/104?img=47', bio: 'Tokyo obsessed. Food first.', trip_count: 12, follower_count: 847, following_count: 203, created_at: '2023-01-01' },
  { id: 'u2', username: 'james_o', full_name: 'James Ortega', avatar_url: 'https://i.pravatar.cc/104?img=11', bio: 'Road trips & pasta.', trip_count: 8, follower_count: 412, following_count: 180, created_at: '2023-03-12' },
  { id: 'u3', username: 'sofia_lim', full_name: 'Sofia Lim', avatar_url: 'https://i.pravatar.cc/104?img=5', bio: 'Kyoto is home.', trip_count: 15, follower_count: 1203, following_count: 89, created_at: '2022-11-20' },
  { id: 'u4', username: 'alex_r', full_name: 'Alex Rivera', avatar_url: 'https://i.pravatar.cc/104?img=32', bio: 'Bali → Everywhere.', trip_count: 6, follower_count: 318, following_count: 240, created_at: '2023-06-05' },
  { id: 'me', username: 'rachel_z', full_name: 'Rachel Zhang', avatar_url: 'https://i.pravatar.cc/104?img=9', bio: 'Collecting passport stamps.', trip_count: 7, follower_count: 524, following_count: 167, created_at: '2023-02-14' },
]

// ─── Mock trips ───────────────────────────────────────────────

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    title: '10 Days in Tokyo',
    location: 'Tokyo, Japan',
    country_emoji: '🇯🇵',
    duration_days: 10,
    cover_image_url: 'https://picsum.photos/seed/tokyo99/800/500',
    description: 'The perfect Tokyo itinerary — ramen crawls, temple mornings, and Shibuya at midnight.',
    visibility: 'public',
    rating: 9.4,
    rating_count: 38,
    like_count: 128,
    tags: ['foodie', 'culture', 'solo'],
    lat: 35.68, lng: 139.69,
    author: MOCK_PROFILES[0],
    is_liked: true,
    is_saved: true,
    created_at: '2024-11-14',
    days: [
      {
        id: 'd1-1', trip_id: 'trip-1', title: 'Arrival & Shinjuku', day_number: 1,
        activities: [
          { id: 'a1', emoji: '✈️', text: 'Arrive Narita / Haneda Airport', type: 'transit', notes: 'Narita Express is easiest', position: 0 },
          { id: 'a2', emoji: '🚄', text: 'Narita Express to Shinjuku (60 min)', type: 'transit', notes: null, position: 1 },
          { id: 'a3', emoji: '🏨', text: 'Check in — Shinjuku area', type: 'stay', notes: 'Park Hyatt Shinjuku recommended', position: 2 },
          { id: 'a4', emoji: '🍜', text: 'Omoide Yokocho yakitori alley', type: 'food', notes: 'Go after 8pm for full atmosphere', position: 3 },
        ],
      },
      {
        id: 'd1-2', trip_id: 'trip-1', title: 'Harajuku & Meiji Shrine', day_number: 2,
        activities: [
          { id: 'a5', emoji: '⛩️', text: 'Meiji Jingu Shrine at sunrise', type: 'culture', notes: 'Arrive 6:30am', position: 0 },
          { id: 'a6', emoji: '🛍️', text: 'Takeshita Street, Harajuku', type: 'culture', notes: null, position: 1 },
          { id: 'a7', emoji: '🍵', text: 'Matcha at Omotesando', type: 'food', notes: null, position: 2 },
          { id: 'a8', emoji: '🌆', text: 'Shibuya crossing at night', type: 'culture', notes: 'Best from Mag\'s Park rooftop', position: 3 },
        ],
      },
      {
        id: 'd1-3', trip_id: 'trip-1', title: 'Asakusa & Ueno', day_number: 3,
        activities: [
          { id: 'a9', emoji: '⛩️', text: 'Senso-ji Temple, Asakusa', type: 'culture', notes: null, position: 0 },
          { id: 'a10', emoji: '🏛️', text: 'Tokyo National Museum, Ueno', type: 'culture', notes: null, position: 1 },
          { id: 'a11', emoji: '🍣', text: 'Sushi at Tsukiji Outer Market', type: 'food', notes: 'Sushi Dai has a line but worth it', position: 2 },
        ],
      },
    ],
  },
  {
    id: 'trip-2',
    title: 'Amalfi Coast Road Trip',
    location: 'Positano, Italy',
    country_emoji: '🇮🇹',
    duration_days: 7,
    cover_image_url: 'https://picsum.photos/seed/amalfi77/800/500',
    description: 'Lemon groves, cliffside villages, and pasta so good you might cry.',
    visibility: 'public',
    rating: 9.1,
    rating_count: 24,
    like_count: 89,
    tags: ['romantic', 'food', 'road-trip'],
    lat: 40.63, lng: 14.60,
    author: MOCK_PROFILES[1],
    is_liked: false,
    is_saved: true,
    created_at: '2024-10-02',
    days: [
      {
        id: 'd2-1', trip_id: 'trip-2', title: 'Arrival — Positano', day_number: 1,
        activities: [
          { id: 'b1', emoji: '✈️', text: 'Fly into Naples Airport', type: 'transit', notes: null, position: 0 },
          { id: 'b2', emoji: '🚗', text: 'Private transfer to Positano (90 min)', type: 'transit', notes: null, position: 1 },
          { id: 'b3', emoji: '🏨', text: 'Check in to cliffside hotel', type: 'stay', notes: 'Le Sirenuse is worth the splurge', position: 2 },
          { id: 'b4', emoji: '🍋', text: 'Sunset cocktails on the terrace', type: 'night', notes: null, position: 3 },
        ],
      },
      {
        id: 'd2-2', trip_id: 'trip-2', title: 'Positano Beach & Town', day_number: 2,
        activities: [
          { id: 'b5', emoji: '🏖️', text: 'Morning swim at Spiaggia Grande', type: 'outdoors', notes: null, position: 0 },
          { id: 'b6', emoji: '🛍️', text: 'Browse ceramic shops in town', type: 'culture', notes: null, position: 1 },
          { id: 'b7', emoji: '🐟', text: 'Lunch at Da Adolfo (boat access only)', type: 'food', notes: 'Call ahead to reserve', position: 2 },
        ],
      },
    ],
  },
  {
    id: 'trip-3',
    title: 'Bali: Temples & Rice Fields',
    location: 'Ubud, Indonesia',
    country_emoji: '🇮🇩',
    duration_days: 12,
    cover_image_url: 'https://picsum.photos/seed/bali55/800/500',
    description: 'Spiritual retreats, volcanic rice terraces, and the best smoothie bowls on earth.',
    visibility: 'public',
    rating: 8.9,
    rating_count: 51,
    like_count: 203,
    tags: ['wellness', 'culture', 'outdoors'],
    lat: -8.50, lng: 115.26,
    author: MOCK_PROFILES[3],
    is_liked: false,
    is_saved: false,
    created_at: '2024-09-18',
    days: [
      {
        id: 'd3-1', trip_id: 'trip-3', title: 'Arrival — Seminyak', day_number: 1,
        activities: [
          { id: 'c1', emoji: '✈️', text: 'Arrive Ngurah Rai Airport, Denpasar', type: 'transit', notes: null, position: 0 },
          { id: 'c2', emoji: '🏨', text: 'Check in to villa in Seminyak', type: 'stay', notes: null, position: 1 },
          { id: 'c3', emoji: '🌅', text: 'Potato Head Beach Club at sunset', type: 'night', notes: null, position: 2 },
        ],
      },
      {
        id: 'd3-2', trip_id: 'trip-3', title: 'Ubud — Rice Fields & Temples', day_number: 2,
        activities: [
          { id: 'c4', emoji: '🌿', text: 'Tegalalang Rice Terraces at dawn', type: 'outdoors', notes: null, position: 0 },
          { id: 'c5', emoji: '🐒', text: 'Sacred Monkey Forest Sanctuary', type: 'culture', notes: null, position: 1 },
          { id: 'c6', emoji: '⛩️', text: 'Pura Tirta Empul water blessing', type: 'culture', notes: null, position: 2 },
          { id: 'c7', emoji: '🍜', text: 'Dinner at Locavore restaurant', type: 'food', notes: 'Book 6 weeks ahead', position: 3 },
        ],
      },
    ],
  },
  {
    id: 'trip-4',
    title: 'Kyoto in Autumn',
    location: 'Kyoto, Japan',
    country_emoji: '🇯🇵',
    duration_days: 5,
    cover_image_url: 'https://picsum.photos/seed/kyoto22/800/500',
    description: 'Scarlet maple leaves, bamboo groves, and ryokan breakfasts. Pure magic.',
    visibility: 'public',
    rating: 9.7,
    rating_count: 67,
    like_count: 312,
    tags: ['culture', 'nature', 'solo'],
    lat: 35.01, lng: 135.76,
    author: MOCK_PROFILES[2],
    is_liked: false,
    is_saved: false,
    created_at: '2024-11-01',
    days: [
      {
        id: 'd4-1', trip_id: 'trip-4', title: 'Arrival & Gion', day_number: 1,
        activities: [
          { id: 'e1', emoji: '🚄', text: 'Shinkansen from Tokyo (2h 15m)', type: 'transit', notes: null, position: 0 },
          { id: 'e2', emoji: '🏨', text: 'Check in to ryokan in Higashiyama', type: 'stay', notes: null, position: 1 },
          { id: 'e3', emoji: '🌸', text: 'Evening stroll along Gion canal', type: 'culture', notes: null, position: 2 },
        ],
      },
      {
        id: 'd4-2', trip_id: 'trip-4', title: 'Arashiyama & Bamboo', day_number: 2,
        activities: [
          { id: 'e4', emoji: '🎋', text: 'Arashiyama Bamboo Grove at 6am', type: 'outdoors', notes: null, position: 0 },
          { id: 'e5', emoji: '🐒', text: 'Iwatayama Monkey Park', type: 'outdoors', notes: null, position: 1 },
          { id: 'e6', emoji: '🚣', text: 'Boat ride on Oi River', type: 'outdoors', notes: null, position: 2 },
          { id: 'e7', emoji: '🍵', text: 'Tea ceremony — Nishiki Market', type: 'culture', notes: null, position: 3 },
        ],
      },
    ],
  },
]

export const MOCK_FRIENDS = MOCK_PROFILES.slice(0, 4)

// ─── Activity suggestions ─────────────────────────────────────

export const ACTIVITY_SUGGESTIONS: ActivitySuggestion[] = [
  { emoji: '🏨', name: 'Hotel check-in', type: 'stay' },
  { emoji: '🛖', name: 'Book a villa', type: 'stay' },
  { emoji: '🏕️', name: 'Glamping / camping', type: 'stay' },
  { emoji: '✈️', name: 'Airport arrival & transfer', type: 'transit' },
  { emoji: '🚄', name: 'Train journey', type: 'transit' },
  { emoji: '🚢', name: 'Ferry / boat transfer', type: 'transit' },
  { emoji: '🚗', name: 'Scenic road trip leg', type: 'transit' },
  { emoji: '🍽️', name: 'Dinner at local restaurant', type: 'food' },
  { emoji: '☕', name: 'Morning café & explore', type: 'food' },
  { emoji: '🍜', name: 'Street food tour', type: 'food' },
  { emoji: '🍷', name: 'Wine tasting', type: 'food' },
  { emoji: '🍦', name: 'Dessert spot locals love', type: 'food' },
  { emoji: '🧆', name: 'Cooking class', type: 'food' },
  { emoji: '🏛️', name: 'Visit historic landmark', type: 'culture' },
  { emoji: '🎨', name: 'Art museum', type: 'culture' },
  { emoji: '📸', name: 'Photography walk', type: 'culture' },
  { emoji: '🛍️', name: 'Local market shopping', type: 'culture' },
  { emoji: '⛩️', name: 'Temple / shrine visit', type: 'culture' },
  { emoji: '🎭', name: 'See a show or performance', type: 'culture' },
  { emoji: '🌅', name: 'Sunrise / sunset viewpoint', type: 'outdoors' },
  { emoji: '🏖️', name: 'Beach day', type: 'outdoors' },
  { emoji: '🏕️', name: 'Scenic hike', type: 'outdoors' },
  { emoji: '🤿', name: 'Snorkelling or diving', type: 'outdoors' },
  { emoji: '🧘', name: 'Morning yoga or spa', type: 'outdoors' },
  { emoji: '🚴', name: 'Bike ride through city', type: 'outdoors' },
  { emoji: '🌃', name: 'Rooftop bar', type: 'night' },
  { emoji: '🎭', name: 'Live music venue', type: 'night' },
  { emoji: '🍷', name: 'Cocktail bar crawl', type: 'night' },
  { emoji: '🎪', name: 'Night market', type: 'night' },
]

// ─── Map pins ─────────────────────────────────────────────────

export const MAP_PINS = MOCK_TRIPS.map(t => ({
  tripId: t.id,
  title: t.title,
  location: t.location,
  rating: t.rating,
  coverImageUrl: t.cover_image_url,
  lat: t.lat ?? 0,
  lng: t.lng ?? 0,
}))
