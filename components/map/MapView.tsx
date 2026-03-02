'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { MapPin } from '@/lib/types'
import { MOCK_TRIPS } from '@/lib/mock-data'

interface Props { pins: MapPin[] }

const FILTER_CHIPS = ['All Trips', 'Friends', 'My Saves', 'Top Rated', 'Asia', 'Europe']
const DEFAULT_VIEW: [number, number] = [30, 15]
const DEFAULT_ZOOM = 3

export default function MapView({ pins }: Props) {
  const router        = useRouter()
  const mapRef        = useRef<HTMLDivElement>(null)
  const leafletRef    = useRef<any>(null)
  const markersRef    = useRef<Map<string, any>>(new Map())

  const [activeFilter,  setActiveFilter]  = useState('All Trips')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [isGeocoding,   setIsGeocoding]   = useState(false)
  const [geocodeError,  setGeocodeError]  = useState(false)

  // Trips that match the text search (for bottom carousel)
  const filteredTrips = MOCK_TRIPS.filter(t =>
    searchQuery === '' ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Initialize map once ─────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return

    import('leaflet').then(L => {
      if (!mapRef.current) return

      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: true })
        .setView(DEFAULT_VIEW, DEFAULT_ZOOM)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      pins.forEach(pin => {
        const icon = L.divIcon({
          className: '',
          html: '<div class="wayfarer-pin"></div>',
          iconSize: [10, 10],
        })
        const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map)
        marker.bindTooltip(pin.title, {
          permanent: false, className: 'leaflet-tooltip', direction: 'top', offset: [0, -8],
        })
        marker.on('click', () => {
          const trip = MOCK_TRIPS.find(t => t.id === pin.tripId)
          if (trip) router.push(`/trip/${trip.id}`)
        })
        markersRef.current.set(pin.tripId, marker)
      })

      leafletRef.current = map
    })

    return () => {
      leafletRef.current?.remove()
      leafletRef.current = null
      markersRef.current.clear()
    }
  }, [pins, router])

  // ── Dim/highlight pins based on search text ─────────────────
  useEffect(() => {
    markersRef.current.forEach((marker, tripId) => {
      const trip = MOCK_TRIPS.find(t => t.id === tripId)
      if (!trip) return
      const matches =
        searchQuery === '' ||
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchQuery.toLowerCase())
      marker.setOpacity(matches ? 1 : 0.15)
    })
  }, [searchQuery])

  // ── Geocode + pan map on search (debounced 550ms) ───────────
  useEffect(() => {
    setGeocodeError(false)

    if (!searchQuery.trim()) {
      // Reset to world view when cleared
      leafletRef.current?.setView(DEFAULT_VIEW, DEFAULT_ZOOM, { animate: true })
      return
    }

    const timer = setTimeout(async () => {
      if (!leafletRef.current) return
      setIsGeocoding(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()

        if (data[0]) {
          const { lat, lon, boundingbox } = data[0]
          if (boundingbox && leafletRef.current) {
            // boundingbox = [south, north, west, east]
            leafletRef.current.fitBounds(
              [[+boundingbox[0], +boundingbox[2]], [+boundingbox[1], +boundingbox[3]]],
              { maxZoom: 12, animate: true, padding: [30, 30] }
            )
          } else {
            leafletRef.current?.setView([+lat, +lon], 10, { animate: true })
          }
        } else {
          setGeocodeError(true)
        }
      } catch {
        setGeocodeError(true)
      } finally {
        setIsGeocoding(false)
      }
    }, 550)

    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <div className="flex flex-col relative overflow-hidden" style={{ height: 'calc(100dvh - 64px)' }}>
      {/* Map */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pt-14 px-4 pb-3"
        style={{ background: 'linear-gradient(to bottom, rgba(11,11,20,1) 0%, rgba(11,11,20,0) 100%)' }}
      >
        {/* Search */}
        <div
          className="flex items-center gap-2.5 rounded-[14px] px-4 py-3 mb-2.5"
          style={{
            background: 'rgba(20,20,42,0.9)', backdropFilter: 'blur(16px)',
            border: `1px solid ${geocodeError ? 'var(--rose)' : 'var(--border)'}`,
            transition: 'border-color 0.2s',
          }}
        >
          {isGeocoding ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
              style={{ color: 'var(--gold)', flexShrink: 0, animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
              style={{ color: geocodeError ? 'var(--rose)' : 'var(--text3)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
          <input
            type="text"
            placeholder="Search any city or destination…"
            className="bg-transparent border-none outline-none text-sm w-full"
            style={{ color: 'var(--text)' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ flexShrink: 0, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 1 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* "Not found" hint */}
        {geocodeError && (
          <div style={{
            fontSize: 11, color: 'var(--rose)', background: 'rgba(11,11,20,0.8)',
            borderRadius: 8, padding: '4px 10px', marginBottom: 6, display: 'inline-block',
          }}>
            Location not found — try a different name
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              className={`chip flex-shrink-0 ${activeFilter === chip ? 'active' : ''}`}
              onClick={() => setActiveFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pb-20 rounded-t-[20px]"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      >
        <div className="px-5 py-4">
          <div className="text-sm font-medium mb-3.5" style={{ color: 'var(--text2)' }}>
            {filteredTrips.length} {searchQuery ? `itinerar${filteredTrips.length === 1 ? 'y' : 'ies'} matching "${searchQuery}"` : 'itineraries near this area'}
          </div>
          {filteredTrips.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {filteredTrips.map(trip => (
                <button
                  key={trip.id}
                  className="flex-shrink-0 w-40 rounded-[10px] overflow-hidden active:scale-[0.96] transition-transform"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  onClick={() => router.push(`/trip/${trip.id}`)}
                >
                  <div className="relative h-[90px]">
                    {trip.cover_image_url && (
                      <Image src={trip.cover_image_url} alt={trip.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="p-2.5 text-left">
                    <div className="text-xs font-semibold leading-snug mb-0.5 truncate">{trip.title}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text2)' }}>{trip.location}</div>
                    <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold" style={{ color: 'var(--gold)' }}>
                      <span>★</span> {trip.rating?.toFixed(1) ?? '—'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text3)', paddingBottom: 4 }}>
              No matching itineraries yet in this area
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
