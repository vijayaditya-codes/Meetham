'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/axios';
import { connectSocket } from '@/lib/socket';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Power, MapPin, Navigation, ShoppingBag, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RiderHomePage() {
  const router = useRouter();
  
  const [isOnline, setIsOnline] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [countdown, setCountdown] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch partner info on mount
  useEffect(() => {
    async function loadPartner() {
      try {
        const res = await api.get('/delivery-partners/me/assignments'); // Warm up backend queries
        // Let's query state from availability
        const infoRes = await api.patch('/delivery-partners/me/availability', { availability: 'OFFLINE' });
        setPartnerInfo(infoRes.data.data.partner);
        setIsOnline(infoRes.data.data.partner.availability === 'ONLINE');
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPartner();
  }, []);

  // Socket setup for assignment offers
  useEffect(() => {
    if (!isOnline) {
      setActiveOffer(null);
      return;
    }

    const socket = connectSocket();

    socket.on('assignment:new', (offer: any) => {
      console.log('[Socket] Incoming delivery offer:', offer);
      setActiveOffer(offer);
      setCountdown(30);
    });

    return () => {
      socket.off('assignment:new');
    };
  }, [isOnline]);

  // Countdown timer for active offer
  useEffect(() => {
    if (!activeOffer) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setActiveOffer(null);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeOffer]);

  const toggleOnline = async (onlineState: boolean) => {
    try {
      const state = onlineState ? 'ONLINE' : 'OFFLINE';
      const res = await api.patch('/delivery-partners/me/availability', { availability: state });
      setPartnerInfo(res.data.data.partner);
      setIsOnline(onlineState);
    } catch (error) {
      alert('Failed to update availability status.');
    }
  };

  const handleAccept = async () => {
    if (!activeOffer) return;
    try {
      await api.post(`/delivery-assignments/${activeOffer.assignmentId}/accept`);
      router.push(`/active-delivery?id=${activeOffer.assignmentId}&orderId=${activeOffer.orderId}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept assignment. Did it expire?');
      setActiveOffer(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
        <p className="text-slate-400 animate-pulse font-medium text-sm">Loading rider console...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-md w-full mx-auto px-4 py-8 space-y-6">
      {/* Header Profile */}
      <div className="flex items-center justify-between bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-black text-white">Rider Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Vehicle: {partnerInfo?.vehicleType} • {partnerInfo?.licensePlate || 'No License Plate'}</p>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          <Badge className={isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Badge>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Duty Status</span>
        </div>
      </div>

      {/* Online Toggle Switch */}
      <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl rounded-3xl text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-base">Go Active</h3>
              <p className="text-xs text-slate-400">Toggle on to receive delivery requests.</p>
            </div>
            
            <Button
              onClick={() => toggleOnline(!isOnline)}
              variant={isOnline ? 'destructive' : 'default'}
              className={isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'}
            >
              <Power size={18} className="mr-2" />
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Incoming Order Card Overlay */}
      {activeOffer ? (
        <Card className="bg-emerald-950/40 border-emerald-500/30 backdrop-blur-xl rounded-3xl text-white animate-bounce-short">
          <CardHeader className="p-6 pb-2">
            <div className="flex justify-between items-center">
              <Badge className="bg-emerald-600 text-white border-0 font-extrabold px-3 py-1 flex items-center gap-1.5 animate-pulse">
                <Clock size={12} /> {countdown}s left
              </Badge>
              <span className="text-xs font-bold text-emerald-400">NEW DELIVERY OFFER</span>
            </div>
            <CardTitle className="text-lg font-black text-white mt-3">
              {activeOffer.restaurantName}
            </CardTitle>
            <CardDescription className="text-slate-300 text-xs">
              {activeOffer.restaurantAddress}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 pt-2 space-y-4">
            <div className="grid grid-cols-2 gap-4 border-y border-emerald-500/10 py-4">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated Time</div>
                <div className="text-base font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  <Clock size={16} className="text-emerald-500" />
                  {activeOffer.estimatedMinutes} mins
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Distance</div>
                <div className="text-base font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  <Navigation size={16} className="text-emerald-500" />
                  {Number(activeOffer.distanceKm).toFixed(1)} km
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setActiveOffer(null)}
                variant="outline"
                className="flex-1 bg-transparent hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              >
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold"
              >
                Accept Order
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-slate-900/20 rounded-3xl border border-slate-800/40 p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
          <MapPin size={40} className="text-slate-800" />
          <div>
            <h3 className="font-bold text-slate-400 text-sm">
              {isOnline ? 'Waiting for deliveries...' : 'You are currently offline'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto">
              {isOnline ? 'Stay on this page and we will alert you when orders arrive.' : 'Toggle Online to start accepting orders near you.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
