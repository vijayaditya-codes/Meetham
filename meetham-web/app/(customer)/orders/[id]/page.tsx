'use client';

import React, { use, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag, Loader2, ArrowLeft, MapPin, Clock, ShieldCheck, Compass } from 'lucide-react';

interface Params {
  id: string;
}

function OrderDetailsContent({ params }: { params: Params }) {
  const id = params.id;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['customer-order-detail', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.data.order;
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONFIRMED':
      case 'PREPARING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'READY_FOR_PICKUP':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-2">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="text-sm font-semibold">Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white border border-slate-200 p-8 rounded-3xl text-center shadow-sm">
        <h3 className="text-lg font-bold text-slate-800">Order not found</h3>
        <p className="text-slate-500 text-xs mt-2">Could not find matching order logs.</p>
        <Link href="/orders" className={cn(buttonVariants({ variant: 'default' }), "mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl")}>
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>

        <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex justify-between items-start gap-4">
              <div>
                <CardDescription className="text-slate-400 text-xs font-mono font-bold">
                  ORDER ID: #{order.orderNumber.toUpperCase()}
                </CardDescription>
                <CardTitle className="text-xl font-black text-slate-800 mt-1">
                  {order.restaurant.name}
                </CardTitle>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <Badge className={`${getStatusBadgeColor(order.status)} font-bold border`}>
                  {order.status}
                </Badge>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {order.fulfillmentType}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Fulfillment Section */}
            {order.fulfillmentType === 'PICKUP' ? (
              <div className="bg-slate-900 text-white rounded-3xl p-6 text-center space-y-3 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full"></div>
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-widest">
                  <ShieldCheck size={18} />
                  Pickup Verification Code
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-400 tracking-widest mt-2 bg-slate-950 py-3.5 rounded-2xl border border-slate-800/80 text-center font-mono">
                    {order.pickupCode}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Show this 6-digit OTP code at the counter to verify your pickup.
                  </p>
                </div>

                <div className="border-t border-slate-800/80 my-3 pt-3 flex justify-center items-center gap-2 text-xs text-slate-400">
                  <Clock size={14} className="text-emerald-500" />
                  <span>
                    Window: {new Date(order.pickupWindowFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(order.pickupWindowTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={16} className="text-indigo-400" /> Delivery Address
                    </h4>
                    <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                      {order.deliveryAddress?.line1}, {order.deliveryAddress?.line2 && `${order.deliveryAddress.line2}, `}
                      {order.deliveryAddress?.city}
                    </p>
                  </div>
                </div>

                {order.status !== 'CANCELLED' && (
                  <Link href={`/orders/${order.id}/track`} className={cn(buttonVariants({ variant: 'default' }), "w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-2xl border-0 flex items-center justify-center gap-2 shadow-lg")}>
                    <Compass className="animate-spin-slow" size={18} />
                    Track Live Delivery
                  </Link>
                )}
              </div>
            )}

            {/* Order Items list */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Order Items</h4>
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{item.listing?.title || 'Surplus Item'}</div>
                      <div className="text-xs text-slate-400 mt-1">Quantity: {item.quantity}</div>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      ₹{(Number(item.priceAtOrder) * item.quantity).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-850">₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number(order.deliveryFee) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-850">₹{Number(order.deliveryFee).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Platform Commission</span>
                <span className="font-semibold text-slate-850">₹{Number(order.platformFee).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200/60 my-2 pt-3 flex justify-between font-black text-slate-900 text-base">
                <span>Total Amount paid</span>
                <span>₹{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function OrderDetailsPage({ params }: { params: any }) {
  const unwrappedParams = use(params) as Params;
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-2">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="text-sm font-semibold">Loading details...</span>
      </div>
    }>
      <OrderDetailsContent params={unwrappedParams} />
    </Suspense>
  );
}
