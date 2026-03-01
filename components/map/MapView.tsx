'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { MapPin } from '@/lib/types'
import { MOCK_TRIPS } from '@/lib/mock-data'

interface Props { pins: MapPin[] }

const FILTER_CHIPS = ['All Trips', 'Friends', 'My Saves', 'Top Rated', 'Asia', 'Europe']

export default function MapView({ pins }: Props) {
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<ReturnType<typeof import('leaflet').map> | null>(null)
  const [activeFilter, setActiveFilter] = useState('All Trips')
  const [selectedTrip, setSelectedTrip] = useState(MOCK_TRIPS[0])

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return

    // Dynamic import to avoid SSR issues
    import('leaflet').then(L => {
      if (!mapRef.current) return
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: true })
        .setView([30, 115], 3)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB',
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
        marker.bindTooltip(pin.title, { permanent: false, className: 'leaflet-tooltip', direction: 'top', offset: [0, -8] })
        marker.on('click', () => {
          const trip = MOCK_TRIPS.find(t => t.id === pin.tripId)
          if (trip) setSelectedTrip(trip)
        })
      })

      leafletRef.current = map
    })

    return () => {
      leafletRef.current?.remove()
      leafletRef.current = null
    }
  }, [pins])

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      {/* Map */}
      <div ref={mapRef} className="absolute inset-0" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-14 px-4 pb-3"
        style={{ background: 'linear-gradient(to bottom, rgba(11,11,20,1) 0%, rgba(11,11,20,0) 100%)' }}>
        {/* Search */}
        <div className="flex items-center gap-2.5 rounded-[14px] px-4 py-3 mb-2.5"
          style={{ background: 'rgba(20,20,42,0.9)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ color: 'var(--text3)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search destinations…" className="bg-transparent border-none outline-none text-sm w-full" style={{ color: 'var(--text)' }} />
        </div>
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
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-20 rounded-t-[20px]"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4">
          <div className="text-sm font-medium mb-3.5" style={{ color: 'var(--text2)' }}>
            {pins.length} itineraries near this area
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {MOCK_TRIPS.map(trip => (
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
                  <div className="text-[11px]" style={{ color: 'var(--text2)' }}>{trip.author.full_name.split(' ')[0]}</div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold" style={{ color: 'var(--gold)' }}>
                    <span>★</span> {trip.rating?.toFixed(1)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
