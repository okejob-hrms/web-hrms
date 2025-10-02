import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getLocationName } from '@/lib/geocode';
import { MapPin } from 'lucide-react';

export function LocationBadge({ lat, lng }: { lat: number; lng: number }) {
  const [location, setLocation] = useState('Loading...');

  useEffect(() => {
    if (!lat || !lng) {
      setLocation('Unknown');
      return;
    }

    getLocationName(lat, lng).then((name) => {
      setLocation(name);
    });
  }, [lat, lng]);

  return (
    <Badge variant="default" className="bg-blue-50 border-primary text-primary">
      <MapPin />
      <div className="whitespace-normal break-words max-w-full">{location}</div>
    </Badge>
  );
}
