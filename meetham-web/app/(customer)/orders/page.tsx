'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag, Loader2, ArrowRight, Calendar, ShoppingCart } from 'lucide-react';

export default function CustomerOrdersPage() {
  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.data.orders;
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <ShoppingBag className="text-emerald-600" size={24} />
          My Orders History
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-emerald-600" size={36} />
            <p className="text-slate-500 text-sm font-medium">Fetching orders logs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-6 text-center">
            <p className="font-bold">Failed to load orders history</p>
            <p className="text-sm mt-1">Make sure you are logged in and backend is active.</p>
          </div>
        ) : ordersData?.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto mt-8">
            <ShoppingCart className="mx-auto text-emerald-500 mb-4" size={40} />
            <h3 className="text-lg font-bold text-slate-850">No orders found</h3>
            <p className="text-slate-500 text-sm mt-2">
              You haven't purchased any surplus deals yet. Save your first meal today!
            </p>
            <Link href="/discover" className={cn(buttonVariants({ variant: 'default' }), "mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl")}>
              Browse Surplus Food
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersData?.map((order: any) => (
              <Card key={order.id} className="bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
                <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-slate-400 font-bold font-mono">#{order.orderNumber.slice(-8).toUpperCase()}</span>
                      <Badge className={`${getStatusBadgeColor(order.status)} font-bold border py-0.5`}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-slate-500 font-medium">
                        {order.fulfillmentType}
                      </Badge>
                    </div>

                    <h4 className="font-black text-slate-800 text-base">{order.restaurant.name}</h4>
                    
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={14} />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="mx-1">•</span>
                      <span>Total Amount: <span className="font-bold text-slate-800">₹{Number(order.totalAmount).toFixed(0)}</span></span>
                    </div>
                  </div>

                  <Link href={`/orders/${order.id}`} className={cn(buttonVariants({ variant: 'secondary' }), "w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl border-0 flex items-center justify-center")}>
                    Order Details <ArrowRight size={14} className="ml-1.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
