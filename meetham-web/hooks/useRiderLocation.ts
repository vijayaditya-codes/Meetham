import { useEffect, useState } from 'react';
import { connectSocket } from '../lib/socket';

export function useRiderLocation(
  activeOrderId: string | null,
  activeAssignmentId: string | null,
  startLat: number = 19.0760,
  startLng: number = 72.8777
) {
  const [coords, setCoords] = useState({ lat: startLat, lng: startLng });

  useEffect(() => {
    if (!activeOrderId) return;

    const socket = connectSocket();

    // Start coordinates
    let currentLat = startLat;
    let currentLng = startLng;
    
    // Simulate navigation route towards a mockup customer location
    const targetLat = startLat + 0.012;
    const targetLng = startLng - 0.012;
    
    // Send location updates every 8 seconds
    const interval = setInterval(() => {
      const step = 0.08; // speed factor
      currentLat += (targetLat - currentLat) * step;
      currentLng += (targetLng - currentLng) * step;
      
      const newCoords = { lat: currentLat, lng: currentLng };
      setCoords(newCoords);

      // Emit coordinate ping to backend
      socket.emit('location:update', {
        orderId: activeOrderId,
        assignmentId: activeAssignmentId || undefined,
        lat: currentLat,
        lng: currentLng,
      });
      
      console.log('[Rider Socket Emit location:update]:', newCoords);
    }, 8000);

    return () => {
      clearInterval(interval);
    };
  }, [activeOrderId, activeAssignmentId, startLat, startLng]);

  return coords;
}
