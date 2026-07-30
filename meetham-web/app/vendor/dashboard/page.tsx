'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  TrendingUp, 
  PlusCircle, 
  ClipboardList, 
  Clock, 
  Users, 
  Loader2, 
  CheckCircle,
  Truck
} from 'lucide-react';

export default function VendorDashboard() {
  const router = useRouter();

  // Fetch orders
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.data.orders;
    },
  });

  // Calculate statistics
  const activeOrders = orders?.filter((o: any) => ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(o.status)) || [];
  const completedOrders = orders?.filter((o: any) => o.status === 'COMPLETED') || [];
  const totalEarnings = completedOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0) || 0;

  if (isOrdersLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-2">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="text-sm font-semibold">Loading restaurant stats...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Restaurant Management</h2>
            <p className="text-xs text-slate-500 mt-1">Manage listings, confirm orders, and track rider assignments in real-time.</p>
          </div>

          <div className="flex gap-3">
            <Link href="/vendor/orders" className={cn(buttonVariants({ variant: 'outline' }), "border-slate-200 hover:bg-slate-50 font-bold rounded-xl flex items-center gap-2")}>
              <ClipboardList size={16} /> Manage Orders
            </Link>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2">
              <PlusCircle size={16} /> New Listing
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                <h4 className="text-xl font-black text-slate-800 mt-0.5">₹{totalEarnings.toFixed(0)}</h4>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <ShoppingBag size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Orders</span>
                <h4 className="text-xl font-black text-slate-800 mt-0.5">{activeOrders.length}</h4>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                <h4 className="text-xl font-black text-slate-800 mt-0.5">{completedOrders.length}</h4>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <Truck size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deliveries</span>
                <h4 className="text-xl font-black text-slate-800 mt-0.5">
                  {orders?.filter((o: any) => o.fulfillmentType === 'DELIVERY').length || 0}
                </h4>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders Panel Preview */}
        <div className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-slate-800 text-base">Active Orders Queue</h3>
            <Link href="/vendor/orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View all orders
            </Link>
          </div>

          {activeOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No active orders to process right now. Enjoy the calm!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="py-4 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">#{order.orderNumber.toUpperCase().slice(-8)}</span>
                      <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] font-bold">
                        {order.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-medium text-slate-500">
                        {order.fulfillmentType}
                      </Badge>
                    </div>
                    <p className="text-slate-500 mt-1">
                      {order.items.map((item: any) => `${item.listing.title} x${item.quantity}`).join(', ')}
                    </p>
                  </div>

                  <Link href="/vendor/orders" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "border-slate-200 rounded-xl font-bold")}>
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
