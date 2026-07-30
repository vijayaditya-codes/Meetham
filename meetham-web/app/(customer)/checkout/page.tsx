'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingCart, MapPin, Tag, ShieldCheck, CreditCard, Loader2, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [fulfillmentType, setFulfillmentType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  
  // Mock default address for ease of testing
  const [addressLine, setAddressLine] = useState('Flat 402, Sea Breeze, Bandra West');
  const [city, setCity] = useState('Mumbai');

  // 1. Fetch Cart items
  const { data: cartItems, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart');
      return res.data.data.cartItems;
    },
  });

  // Calculate base math
  const subtotal = cartItems?.reduce((sum: number, item: any) => {
    return sum + Number(item.listing.discountedPrice) * item.quantity;
  }, 0) || 0;

  const commissionRate = cartItems?.[0]?.listing?.restaurant?.commissionRate || 15;

  // Coupon validation mutation
  const validateCouponMutation = useMutation({
    mutationFn: async () => {
      setCouponError(null);
      const res = await api.get(`/coupons/validate`, {
        params: { code: couponCode, orderTotal: subtotal }
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setAppliedCoupon(data);
    },
    onError: (err: any) => {
      const code = err.response?.data?.message;
      if (code === 'INVALID_CODE') setCouponError('Invalid coupon code.');
      else if (code === 'EXPIRED') setCouponError('This coupon has expired.');
      else if (code === 'MIN_ORDER_NOT_MET') setCouponError('Minimum order value not met.');
      else if (code === 'USAGE_LIMIT_REACHED') setCouponError('Coupon usage limit reached.');
      else setCouponError('Failed to validate coupon.');
    }
  });

  // Checkout order placement mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      let deliveryAddressId = null;

      // Ensure mock address exists in backend if delivery is selected
      if (fulfillmentType === 'DELIVERY') {
        const addressRes = await api.post('/users/addresses', {
          label: 'Delivery Home',
          line1: addressLine,
          city: city,
          state: 'Maharashtra',
          pincode: '400050',
          latitude: 19.0760, // Fixed Mumbai coordinates
          longitude: 72.8777,
          isDefault: true
        });
        deliveryAddressId = addressRes.data.data.address.id;
      }

      const checkoutPayload: any = {
        paymentMethod: 'UPI',
        fulfillmentType,
        deliveryAddressId,
        couponCode: appliedCoupon?.code || undefined,
      };

      const res = await api.post('/orders/checkout', checkoutPayload);
      return res.data.data.order;
    },
    onSuccess: (order) => {
      // Invalidate queries & redirect
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      router.push(`/orders/${order.id}`);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Checkout failed. Please check stock levels.');
    }
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    validateCouponMutation.mutate();
  };

  const discountVal = appliedCoupon?.discountAmount || 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountVal);
  const platformFee = subtotalAfterDiscount * (commissionRate / 100);
  const deliveryFee = fulfillmentType === 'DELIVERY' ? 35 : 0; // Flat mock delivery fee for test ease
  const finalTotal = subtotalAfterDiscount + platformFee + deliveryFee;

  if (isCartLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-2">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="text-sm font-semibold">Loading checkout details...</span>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white border border-slate-200 p-8 rounded-3xl text-center shadow-sm">
        <h3 className="text-lg font-bold text-slate-800">Your cart is empty</h3>
        <Button onClick={() => router.push('/discover')} className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
          Browse Surplus Food
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          Confirm Order
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Checkout Options */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Fulfillment Selector */}
            <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl">
              <CardContent className="p-6">
                <h3 className="font-extrabold text-slate-800 text-sm mb-4 uppercase tracking-wider">Fulfillment Method</h3>
                
                <RadioGroup
                  value={fulfillmentType}
                  onValueChange={(val) => setFulfillmentType(val as any)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="PICKUP" id="pickup" className="peer sr-only" />
                    <Label
                      htmlFor="pickup"
                      className="flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50/10 cursor-pointer text-center"
                    >
                      <ShoppingCart className="text-slate-500 mb-1 peer-data-[state=checked]:text-emerald-600" size={20} />
                      <span className="font-bold text-sm text-slate-800">Self Pickup</span>
                      <span className="text-[10px] text-slate-400 mt-1">Collect at store counter</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="DELIVERY" id="delivery" className="peer sr-only" />
                    <Label
                      htmlFor="delivery"
                      className="flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50/10 cursor-pointer text-center"
                    >
                      <MapPin className="text-slate-500 mb-1 peer-data-[state=checked]:text-emerald-600" size={20} />
                      <span className="font-bold text-sm text-slate-800">Rider Delivery</span>
                      <span className="text-[10px] text-slate-400 mt-1">Live tracking via Socket</span>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Delivery Address Form if selected */}
                {fulfillmentType === 'DELIVERY' && (
                  <div className="mt-6 space-y-4 border-t border-slate-100 pt-6 animate-fade-in">
                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-slate-700 font-bold text-xs uppercase">Delivery Address</Label>
                      <Input
                        id="address"
                        type="text"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="Flat / House number, Building, Area"
                        required
                        className="border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-slate-700 font-bold text-xs uppercase">City</Label>
                      <Input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        required
                        className="border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coupons Card */}
            <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="text-emerald-600" size={16} /> Promo Coupon
                </h3>

                <form onSubmit={handleApplyCoupon} className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Enter Coupon (e.g. SAVE20, FLAT50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="border-slate-200 focus-visible:ring-emerald-500 rounded-xl placeholder:text-slate-400"
                  />
                  <Button
                    type="submit"
                    disabled={validateCouponMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl border-0"
                  >
                    Apply
                  </Button>
                </form>

                {couponError && (
                  <p className="text-xs text-red-500 font-medium">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl border border-emerald-100 text-xs font-semibold">
                    <span>Coupon '{appliedCoupon.code}' Applied successfully!</span>
                    <span>-₹{appliedCoupon.discountAmount.toFixed(0)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pricing Breakdown Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Order Summary</h3>

                {/* Items Mini List */}
                <div className="space-y-2.5 max-h-32 overflow-y-auto">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-xs text-slate-650">
                      <span className="truncate max-w-[120px]">{item.listing.title} x{item.quantity}</span>
                      <span className="font-semibold">₹{(Number(item.listing.discountedPrice) * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 my-4"></div>

                {/* Costs breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-750">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Promo Discount</span>
                      <span>-₹{discountVal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Platform Fee</span>
                    <span className="font-semibold text-slate-750">₹{platformFee.toFixed(2)}</span>
                  </div>
                  {fulfillmentType === 'DELIVERY' && (
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-slate-750">₹{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-200/60 my-2 pt-3 flex justify-between font-black text-slate-900 text-base">
                    <span>Total Amount</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 font-medium">
                  <ShieldCheck size={16} className="shrink-0" />
                  <span>Reserve locked for transaction security.</span>
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0 border-t border-slate-100/60 bg-slate-50/50 rounded-b-3xl">
                <Button
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl border-0 mt-4"
                >
                  Place Order <ArrowRight size={16} className="ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
