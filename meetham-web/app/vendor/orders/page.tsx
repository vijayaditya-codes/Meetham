'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  Truck, 
  Loader2, 
  Compass, 
  UserCheck 
} from 'lucide-react';

export default function VendorOrdersPage() {
  const queryClient = useQueryClient();

  const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({});
  const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.data.orders;
    },
  });

  // Mutate order status (e.g., PLACED -> CONFIRMED)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  });

  // Verify counter pickup code
  const verifyPickupMutation = useMutation({
    mutationFn: async ({ id, code }: { id: string; code: string }) => {
      return api.post(`/orders/${id}/verify-pickup`, { code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      alert('Pickup code verified! Order completed.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Invalid pickup code.');
    }
  });

  const getFilteredOrders = () => {
    if (!orders) return [];
    if (filterType === 'ACTIVE') {
      return orders.filter((o: any) => ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(o.status));
    }
    if (filterType === 'COMPLETED') {
      return orders.filter((o: any) => o.status === 'COMPLETED');
    }
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  const handleVerifyOtp = (orderId: string) => {
    const code = otpInputs[orderId];
    if (!code || code.length !== 6) {
      alert('Please enter a valid 6-digit OTP code.');
      return;
    }
    verifyPickupMutation.mutate({ id: orderId, code });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'CONFIRMED': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'PROCESSING': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-2">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="text-sm font-semibold">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Order Queue</h2>
            <p className="text-xs text-slate-500 mt-1">Confirm order requests and hand off foods.</p>
          </div>

          <div className="flex bg-slate-200/60 p-1.5 rounded-2xl gap-1">
            <Button
              variant="ghost"
              onClick={() => setFilterType('ACTIVE')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold ${filterType === 'ACTIVE' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500 hover:text-slate-750'}`}
            >
              Active
            </Button>
            <Button
              variant="ghost"
              onClick={() => setFilterType('COMPLETED')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold ${filterType === 'COMPLETED' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500 hover:text-slate-750'}`}
            >
              Completed
            </Button>
            <Button
              variant="ghost"
              onClick={() => setFilterType('ALL')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold ${filterType === 'ALL' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500 hover:text-slate-750'}`}
            >
              All
            </Button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto text-slate-400 mb-4" size={32} />
            <h3 className="text-sm font-bold text-slate-800">No matching orders found</h3>
            <p className="text-xs text-slate-500 mt-1">No orders are current under this filter tag.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order: any) => (
              <Card key={order.id} className="bg-white border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">#{order.orderNumber.toUpperCase().slice(-8)}</span>
                        <Badge className={`${getStatusBadgeColor(order.status)} font-bold border py-0.5`}>
                          {order.status}
                        </Badge>
                        <Badge variant="outline" className={`font-bold text-[10px] uppercase ${order.fulfillmentType === 'DELIVERY' ? 'text-indigo-600 bg-indigo-50/20 border-indigo-100' : 'text-slate-500 bg-slate-50'}`}>
                          {order.fulfillmentType === 'DELIVERY' ? 'RIDER DELIVERY' : 'COUNTER PICKUP'}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-500 text-xs mt-1.5">
                        Customer: <span className="font-semibold text-slate-700">{order.customer.name}</span> • Phone: {order.customer.phone}
                      </CardDescription>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid</span>
                      <span className="text-base font-black text-slate-800 mt-0.5">₹{Number(order.totalAmount).toFixed(0)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2.5">Items Order</h4>
                    <div className="space-y-2">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs text-slate-700 font-medium">
                          <span>{item.listing.title} x{item.quantity}</span>
                          <span>₹{(Number(item.priceAtOrder) * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery assignment or Pickup Verification details */}
                  {order.fulfillmentType === 'DELIVERY' ? (
                    order.assignment ? (
                      <div className="bg-indigo-50/30 border border-indigo-100/60 rounded-2xl p-4.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            <Truck className="text-indigo-600 animate-pulse" size={16} /> Delivery Tracking
                          </span>
                          <Badge className="bg-indigo-600 text-white font-bold text-[10px]">
                            {order.assignment.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rider Name</span>
                            <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                              <User size={12} className="text-slate-400" />
                              {order.assignment.partner.user.name}
                            </p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rider Phone</span>
                            <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                              <Phone size={12} className="text-slate-400" />
                              {order.assignment.partner.user.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 text-center text-xs text-slate-500">
                        <Compass className="mx-auto text-slate-400 mb-1.5" size={18} />
                        Rider assignment will trigger automatically once order is confirmed.
                      </div>
                    )
                  ) : (
                    order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                      <div className="bg-emerald-50/20 border border-emerald-100/60 rounded-2xl p-4.5 space-y-3">
                        <Label htmlFor={`otp-${order.id}`} className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="text-emerald-600" size={16} /> Verify Customer Pickup OTP
                        </Label>
                        <div className="flex gap-3">
                          <Input
                            id={`otp-${order.id}`}
                            type="text"
                            placeholder="Enter 6-digit OTP code"
                            value={otpInputs[order.id] || ''}
                            onChange={(e) => setOtpInputs({ ...otpInputs, [order.id]: e.target.value })}
                            maxLength={6}
                            className="border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
                          />
                          <Button
                            onClick={() => handleVerifyOtp(order.id)}
                            disabled={verifyPickupMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                          >
                            Verify
                          </Button>
                        </div>
                      </div>
                    )
                  )}

                  {/* Actions (PLACED -> CONFIRMED) */}
                  {order.status === 'PLACED' && (
                    <div className="flex gap-3 border-t border-slate-100 pt-5">
                      <Button
                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'CONFIRMED' })}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-3 border-0"
                      >
                        Confirm Order
                      </Button>
                      <Button
                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'CANCELLED' })}
                        disabled={updateStatusMutation.isPending}
                        variant="outline"
                        className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-bold rounded-xl px-6 py-3"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
