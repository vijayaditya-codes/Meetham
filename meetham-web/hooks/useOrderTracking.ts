import { useEffect } from 'react';
import { connectSocket } from '../lib/socket';
import { useTrackingStore } from '../lib/zustand/tracking-store';

export function useOrderTracking(orderId: string) {
  const setRiderLocation = useTrackingStore((state) => state.setRiderLocation);
  const setDeliveryStatus = useTrackingStore((state) => state.setDeliveryStatus);
  const resetTracking = useTrackingStore((state) => state.resetTracking);

  useEffect(() => {
    if (!orderId) return;

    const socket = connectSocket();

    // Join order room
    socket.emit('order:join', orderId);

    // Listen for location changes
    socket.on(`order:${orderId}:location`, (data: { lat: number; lng: number }) => {
      setRiderLocation({ lat: data.lat, lng: data.lng });
    });

    // Listen for status changes
    socket.on(`order:${orderId}:status`, (data: { status: string }) => {
      setDeliveryStatus(data.status);
    });

    return () => {
      socket.emit('order:leave', orderId);
      socket.off(`order:${orderId}:location`);
      socket.off(`order:${orderId}:status`);
      resetTracking();
    };
  }, [orderId, setRiderLocation, setDeliveryStatus, resetTracking]);
}
