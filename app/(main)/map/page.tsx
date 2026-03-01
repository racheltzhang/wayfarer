import MapView from '@/components/map/MapView'
import { MAP_PINS } from '@/lib/mock-data'

export default function MapPage() {
  return <MapView pins={MAP_PINS} />
}
