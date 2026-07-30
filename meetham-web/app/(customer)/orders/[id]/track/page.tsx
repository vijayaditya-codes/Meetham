'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { useTrackingStore } from '@/lib/zustand/tracking-store';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { MapPin, Phone, ShieldCheck, Clock, Store, Compass, CheckCircle2, UserCheck, AlertTriangle, Navigation } from 'lucide-react';

interface Params {
  id: string;
}

function TrackOrderContent({ params }: { params: Params }) {
  const router = useRouter();
  const id = params.id;

  // Zustand tracking state (updated in real-time by useOrderTracking hook)
  const riderLocation = useTrackingStore((state) => state.riderLocation);
  const deliveryStatus = useTrackingStore((state) => state.deliveryStatus);

  // 1. Fetch initial REST snapshot of order tracking info
  const { data: orderSnapshot, isLoading, error } = useQuery({
    queryKey: ['order-track', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}/track`);
      return res.data.data.order;
    },
  });

  // 2. Activate Socket.io real-time listener hook
  useOrderTracking(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-2">
        <Compass className="animate-spin text-emerald-600" size={32} />
        <span className="text-sm font-semibold">Initiating tracking feed...</span>
      </div>
    );
  }

  if (error || !orderSnapshot) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white border border-slate-200 p-8 rounded-3xl text-center shadow-sm">
        <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
        <h3 className="text-lg font-bold text-slate-800">Tracking unavailable</h3>
        <p className="text-slate-500 text-xs mt-2">
          Unable to fetch order information. Please verify your order ID.
        </p>
        <Button onClick={() => router.push('/discover')} className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
          Back to Discover
        </Button>
      </div>
    );
  }

  // Merge static snapshot data with live socket overrides
  const currentStatus = deliveryStatus || orderSnapshot.assignment?.status || 'UNASSIGNED';
  const assignment = orderSnapshot.assignment;
  const restaurant = orderSnapshot.restaurant;
  const customerAddress = orderSnapshot.deliveryAddress;
  const riderCoords = riderLocation || {
    lat: assignment?.currentLat || restaurant.latitude,
    lng: assignment?.currentLng || restaurant.longitude,
  };

  // Mathematical journey interpolation onto SVG map coordinates:
  // Normalize rider's position between restaurant (start) and customer (end) coordinates
  const startLat = restaurant.latitude;
  const startLng = restaurant.longitude;
  const endLat = customerAddress?.latitude || (startLat + 0.012);
  const endLng = customerAddress?.longitude || (startLng - 0.012);

  // Compute percentage along the straight line
  const dTotal = Math.sqrt(Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2));
  const dRider = Math.sqrt(Math.pow(riderCoords.lat - startLat, 2) + Math.pow(riderCoords.lng - startLng, 2));
  
  let journeyRatio = dTotal > 0 ? dRider / dTotal : 0;
  if (journeyRatio > 1) journeyRatio = 1;
  if (journeyRatio < 0) journeyRatio = 0;

  // If status is DELIVERED, set to 100% complete
  if (currentStatus === 'DELIVERED') {
    journeyRatio = 1;
  }

  // Coordinates along our visual SVG path (from x1: 50, y1: 150 to x2: 350, y2: 50)
  const pathStartX = 50;
  const pathStartY = 150;
  const pathEndX = 350;
  const pathEndY = 50;

  const riderX = pathStartX + (pathEndX - pathStartX) * journeyRatio;
  const riderY = pathStartY + (pathEndY - pathStartY) * journeyRatio;

  // Timeline steps mapper
  const steps = [
    { label: 'Assigned', state: ['ASSIGNED', 'ARRIVED_AT_RESTAURANT', 'PICKED_UP', 'EN_ROUTE', 'DELIVERED'] },
    { label: 'At Restaurant', state: ['ARRIVED_AT_RESTAURANT', 'PICKED_UP', 'EN_ROUTE', 'DELIVERED'] },
    { label: 'Picked Up', state: ['PICKED_UP', 'EN_ROUTE', 'DELIVERED'] },
    { label: 'Out for Delivery', state: ['EN_ROUTE', 'DELIVERED'] },
    { label: 'Delivered', state: ['DELIVERED'] }
  ];

  const getStepProgress = () => {
    const statusOrder = ['ASSIGNED', 'ARRIVED_AT_RESTAURANT', 'PICKED_UP', 'EN_ROUTE', 'DELIVERED'];
    const idx = statusOrder.indexOf(currentStatus);
    return idx >= 0 ? ((idx + 1) / statusOrder.length) * 100 : 20;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tracking Map & Status Panel */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Live Map Box */}
            <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Compass size={20} className="text-emerald-600 animate-spin-slow" />
                  Swiggy-style Live Tracking
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Active Coordinates: {riderCoords.lat.toFixed(5)}, {riderCoords.lng.toFixed(5)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 flex flex-col items-center">
                {/* SVG Visual Map Grid */}
                <div className="relative w-full max-w-lg h-60 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                  {/* Glowing street lines pattern background */}
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(16,185,129,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.3)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Delivery Route Path */}
                    <path
                      d={`M ${pathStartX} ${pathStartY} L ${pathEndX} ${pathEndY}`}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="4"
                    />
                    <path
                      d={`M ${pathStartX} ${pathStartY} L ${pathEndX} ${pathEndY}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeDasharray="6,6"
                      className="animate-[dash_15s_linear_infinite]"
                      style={{
                        strokeDashoffset: -20,
                      }}
                    />

                    {/* Restaurant Node */}
                    <g transform={`translate(${pathStartX}, ${pathStartY})`}>
                      <circle r="14" fill="#065f46" className="animate-pulse" />
                      <circle r="10" fill="#10b981" />
                      <foreignObject x="-8" y="-8" width="16" height="16">
                        <Store className="text-slate-950" size={16} />
                      </foreignObject>
                    </g>
                    
                    {/* Customer Destination Node */}
                    <g transform={`translate(${pathEndX}, ${pathEndY})`}>
                      <circle r="14" fill="#1e1b4b" className="animate-pulse" />
                      <circle r="10" fill="#4f46e5" />
                      <foreignObject x="-8" y="-8" width="16" height="16">
                        <MapPin className="text-white" size={16} />
                      </foreignObject>
                    </g>

                    {/* Live Rider Node (Smooth lerp positioning) */}
                    {currentStatus !== 'UNASSIGNED' && currentStatus !== 'FAILED' && (
                      <motion.g
                        animate={{ x: riderX, y: riderY }}
                        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                      >
                        {/* Glow halo */}
                        <circle r="18" fill="rgba(16,185,129,0.25)" className="animate-ping" />
                        <circle r="11" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                        <foreignObject x="-7" y="-7" width="14" height="14">
                          <Navigation className="text-slate-950 rotate-45" size={14} />
                        </foreignObject>
                      </motion.g>
                    )}
                  </svg>
                  
                  {/* Overlay labels */}
                  <span className="absolute bottom-4 left-6 text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1.5">
                    <Store size={10} /> {restaurant.name}
                  </span>
                  <span className="absolute top-4 right-6 text-[10px] text-indigo-400 font-extrabold uppercase bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1.5">
                    <MapPin size={10} /> {customerAddress?.label || 'Home'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Stepper Timeline */}
            <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status Update</span>
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border-0 px-3 py-1">
                    {currentStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>
                
                <Progress value={getStepProgress()} className="h-2 bg-slate-100 text-emerald-600 rounded-full" />

                <div className="grid grid-cols-5 gap-2 mt-6 text-center">
                  {steps.map((step, idx) => {
                    const isActive = step.state.includes(currentStatus);
                    return (
                      <div key={idx} className="space-y-2">
                        <div className={`mx-auto h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'border-slate-250 bg-white text-slate-400'}`}>
                          {isActive ? <CheckCircle2 size={14} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                        </div>
                        <div className={`text-[10px] font-bold ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer OTP Dropoff & Rider Details Panel */}
          <div className="space-y-6">
            
            {/* Handoff Verification OTP Card */}
            <Card className="bg-slate-900 border-slate-850 text-white rounded-3xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full"></div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
                  <ShieldCheck size={18} />
                  Handoff Verification
                </div>
                
                <div>
                  <h3 className="text-sm text-slate-400 font-medium">Show this Code to Rider</h3>
                  <div className="text-3xl font-black text-emerald-400 tracking-widest mt-2 bg-slate-950 py-3 rounded-2xl border border-slate-800/80 text-center shadow-inner font-mono">
                    {assignment?.otpForDropoff || '------'}
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Provide this code to your rider upon delivery. It guarantees that your surplus food is correctly handed off.
                </p>
              </CardContent>
            </Card>

            {/* Rider Profile Card */}
            {assignment?.partner && (
              <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg border border-emerald-100">
                      {assignment.partner.user.name[0]}
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Delivery Rider</div>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{assignment.partner.user.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-medium">
                        Rating: ⭐ 4.9 • {assignment.partner.vehicleType}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 my-4"></div>

                  <a href={`tel:${assignment.partner.user.phone || '9876543210'}`} className={cn(buttonVariants({ variant: 'secondary' }), "w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl border-0 flex items-center justify-center")}>
                    <Phone size={14} className="mr-2" /> Contact Rider
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Delivery Info Details */}
            <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Clock size={16} className="text-emerald-600" />
                  Trip Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order Subtotal</span>
                    <span className="font-semibold text-slate-700">₹{Number(orderSnapshot.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(orderSnapshot.deliveryFee) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Delivery Fee</span>
                      <span className="font-semibold text-slate-700">₹{Number(orderSnapshot.deliveryFee).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black text-slate-900">
                    <span>Total Amount</span>
                    <span>₹{Number(orderSnapshot.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TrackOrderPage({ params }: { params: any }) {
  const unwrappedParams = use(params) as Params;
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-2">
        <Compass className="animate-spin text-emerald-600" size={32} />
        <span className="text-sm font-semibold">Loading track layouts...</span>
      </div>
    }>
      <TrackOrderContent params={unwrappedParams} />
    </Suspense>
  );
}
