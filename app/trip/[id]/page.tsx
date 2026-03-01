import { notFound } from 'next/navigation'
import TripDetail from '@/components/detail/TripDetail'
import { MOCK_TRIPS } from '@/lib/mock-data'

interface Props {
  params: { id: string }
}

export async function generateStaticParams() {
  return MOCK_TRIPS.map(t => ({ id: t.id }))
}

export default function TripPage({ params }: Props) {
  const trip = MOCK_TRIPS.find(t => t.id === params.id)
  if (!trip) notFound()
  return <TripDetail trip={trip} />
}
