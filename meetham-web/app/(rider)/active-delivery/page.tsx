'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api/axios';
import { useRiderLocation } from '@/hooks/useRiderLocation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, CheckCircle, ShieldAlert, Key, Store, Home } from 'lucide-react';

function ActiveDeliveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('id');
  const orderId = searchParams.get('orderId');

  const [assignment, setAssignment] = useState<any>(null);
  const [status, setStatus] = useState<string>('ASSIGNED');
  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook in location tracking simulator!
  // This automatically emits coordinates pings to backend socket room every 8 seconds
  const currentCoords = useRiderLocation(
    orderId,
    assignmentId,
    19.0760, // Mumbai baseline lat
    72.8777  // Mumbai baseline lng
  );

  useEffect(() => {
    async function loadAssignment() {
      if (!assignmentId) return;
      try {
        const res = await api.get('/delivery-partners/me/assignments');
        const active = res.data.data.assignments.find((a: any) => a.id === assignmentId);
        if (active) {
          setAssignment(active);
          setStatus(active.status);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssignment();
  }, [assignmentId]);

  const updateStatus = async (newStatus: string) => {
    setError(null);
    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'DELIVERED') {
        payload.otpForDropoff = otp;
      }

      const res = await api.patch(`/delivery-assignments/${assignmentId}/status`, payload);
      setAssignment(res.data.data.assignment);
      setStatus(newStatus);

      if (newStatus === 'DELIVERED') {
        alert('Delivery completed successfully!');
        router.push('/home');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message === 'INVALID_OTP'
          ? 'Invalid customer verification OTP code.'
          : err.response?.data?.message || 'Failed to update delivery status.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8">
        <p className="text-slate-400 animate-pulse font-medium text-sm">Loading assignment details...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 text-center text-slate-400">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-white">Assignment not found</h3>
        <Button onClick={() => router.push('/home')} className="mt-4 bg-emerald-500 text-slate-950">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const renderStatusAction = () => {
    switch (status) {
      case 'ASSIGNED':
        return (
          <Button
            onClick={() => updateStatus('ARRIVED_AT_RESTAURANT')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold py-3.5 rounded-2xl"
          >
            Arrived at Restaurant
          </Button>
        );
      case 'ARRIVED_AT_RESTAURANT':
        return (
          <Button
            onClick={() => updateStatus('PICKED_UP')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl"
          >
            Confirm Picked Up
          </Button>
        );
      case 'PICKED_UP':
        return (
          <Button
            onClick={() => updateStatus('EN_ROUTE')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-2xl"
          >
            Start Navigation
          </Button>
        );
      case 'EN_ROUTE':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Confirm Handoff OTP</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <Input
                  type="text"
                  placeholder="Enter customer OTP (6 digits)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="pl-10 bg-slate-950 border-slate-800 focus:border-emerald-500 text-white rounded-xl placeholder:text-slate-600"
                />
              </div>
            </div>
            
            <Button
              onClick={() => updateStatus('DELIVERED')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl"
            >
              Verify Handoff
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 max-w-md w-full mx-auto px-4 py-8 space-y-6 text-white">
      {/* Coords Broadcast Status */}
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>GPS active: Broadcasting position ({currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)})</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-2.5 text-red-400 text-xs font-semibold">
          <ShieldAlert className="shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Task Description */}
      <Card className="bg-slate-900/60 border-slate-800 text-white backdrop-blur-xl rounded-3xl">
        <CardContent className="p-6 space-y-6">
          {/* Pickup Store */}
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-800">
              <Store size={18} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pickup Restaurant</div>
              <h4 className="font-extrabold text-white mt-0.5">{assignment.order.restaurant.name}</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{assignment.order.restaurant.address}</p>
            </div>
          </div>

          <div className="border-t border-slate-800/60 my-4"></div>

          {/* Customer Dropoff */}
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-800">
              <Home size={18} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delivery Address</div>
              <h4 className="font-extrabold text-white mt-0.5">{assignment.order.deliveryAddress?.label || 'Home'}</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {assignment.order.deliveryAddress?.line1}, {assignment.order.deliveryAddress?.line2 && `${assignment.order.deliveryAddress.line2}, `}
                {assignment.order.deliveryAddress?.city}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation action step */}
      <Card className="bg-slate-900/60 border-slate-800 text-white backdrop-blur-xl rounded-3xl">
        <CardContent className="p-6">
          <h3 className="font-black text-white text-base mb-4 uppercase tracking-wider flex items-center gap-2">
            <Navigation size={18} className="text-emerald-500" />
            Fulfilment Controls
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-500 font-bold uppercase">Current State</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1 font-bold">
                {status.replace(/_/g, ' ')}
              </Badge>
            </div>

            {renderStatusAction()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActiveDeliveryPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8">
        <p className="text-slate-400 animate-pulse font-medium text-sm">Loading console layout...</p>
      </div>
    }>
      <ActiveDeliveryContent />
    </Suspense>
  );
}
