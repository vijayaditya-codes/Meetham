'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { useLocationStore } from '@/lib/zustand/location-store';
import { useCartStore } from '@/lib/zustand/cart-store';
import { useAuthStore } from '@/lib/zustand/auth-store';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Clock, Tag, ShoppingCart, Loader2, Sparkles } from 'lucide-react';

export default function DiscoverPage() {
  const queryClient = useQueryClient();
  const { lat, lng, city, radius } = useLocationStore();
  const { setCartOpen } = useCartStore();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  // Fetch listings from backend
  const { data: listingsData, isLoading, error } = useQuery({
    queryKey: ['listings', lat, lng, radius, category, search],
    queryFn: async () => {
      const params: any = { lat, lng, radius };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      
      const res = await api.get('/listings', { params });
      return res.data.data.listings;
    },
  });

  // Mutation: Add item to cart on backend
  const addToCartMutation = useMutation({
    mutationFn: async (listingId: string) => {
      return api.post('/cart/items', { listingId, quantity: 1 });
    },
    onSuccess: () => {
      // Invalidate cart queries to trigger count/list refreshes
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      // Show slide cart drawer
      setCartOpen(true);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to add item to cart. Are you ordering from different stores?');
    }
  });

  const getHoursLeft = (expiresAt: string) => {
    const hours = Math.round((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60));
    return hours > 0 ? `${hours} hrs left` : 'Expiring soon';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-2xl">
              <MapPin size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Location</div>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                {city} <span className="text-xs font-normal text-slate-400">({radius}km radius)</span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="text"
              placeholder="Search bakery, main meals, cafes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border-slate-200 hover:border-slate-300 focus-visible:ring-emerald-500 rounded-2xl w-full"
            />
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="mb-6">
          <Tabs value={category} onValueChange={setCategory} className="w-full">
            <TabsList className="bg-slate-100 p-1 rounded-2xl">
              <TabsTrigger value="all" className="rounded-xl px-5 py-2">All Items</TabsTrigger>
              <TabsTrigger value="Bakery" className="rounded-xl px-5 py-2">Bakery</TabsTrigger>
              <TabsTrigger value="Meals" className="rounded-xl px-5 py-2">Meals</TabsTrigger>
              <TabsTrigger value="Grocery" className="rounded-xl px-5 py-2">Grocery</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-emerald-600" size={36} />
            <p className="text-slate-500 text-sm font-medium">Fetching fresh surplus food...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-6 text-center">
            <p className="font-bold">Failed to load listings</p>
            <p className="text-sm mt-1">Please make sure the backend server is running and try again.</p>
          </div>
        ) : listingsData?.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center max-w-md mx-auto mt-12 shadow-sm">
            <Sparkles className="mx-auto text-emerald-500 mb-4" size={40} />
            <h3 className="text-lg font-bold text-slate-800">No surplus food nearby</h3>
            <p className="text-slate-500 text-sm mt-2">
              All items are currently sold out or expired. Check back in a bit or increase your radius search!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listingsData?.map((listing: any) => (
              <Card key={listing.id} className="bg-white border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all rounded-3xl overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700">
                        <Tag size={40} />
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white border-0 font-semibold flex items-center gap-1">
                      <Clock size={12} /> {getHoursLeft(listing.expiresAt)}
                    </Badge>
                    <Badge className="absolute top-4 right-4 bg-emerald-600 text-white font-bold border-0">
                      {listing.category}
                    </Badge>
                  </div>
                  
                  <CardHeader className="p-5 pb-0">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      {listing.restaurantName}
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800 mt-1 line-clamp-1">
                      {listing.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-5 pt-2">
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                      {listing.description || 'No description provided by vendor.'}
                    </p>
                    
                    {/* Price Tag */}
                    <div className="flex items-baseline gap-2 mt-4">
                      <span className="text-2xl font-black text-slate-900">
                        ₹{Number(listing.discountedPrice).toFixed(0)}
                      </span>
                      <span className="text-sm text-slate-400 line-through">
                        ₹{Number(listing.originalPrice).toFixed(0)}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md ml-auto">
                        Save {Math.round((1 - Number(listing.discountedPrice) / Number(listing.originalPrice)) * 100)}%
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-medium mt-2">
                      Stock Left: <span className="font-bold text-slate-700">{listing.quantityLeft} items</span>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-5 border-t border-slate-100 bg-slate-50/50">
                  <Button
                    onClick={() => user ? addToCartMutation.mutate(listing.id) : (window.location.href = '/login')}
                    disabled={addToCartMutation.isPending || listing.quantityLeft <= 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl"
                  >
                    <ShoppingCart size={16} className="mr-2" /> Add to Order
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
