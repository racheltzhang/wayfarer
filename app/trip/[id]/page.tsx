import TripDetail from '@/components/detail/TripDetail'

interface Props {
  params: { id: string }
}

export default function TripPage({ params }: Props) {
  return <TripDetail id={params.id} />
}
