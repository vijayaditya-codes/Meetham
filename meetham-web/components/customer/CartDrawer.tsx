'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../lib/zustand/cart-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api/axios';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Button } from '../ui/button';
import { ShoppingCart, Plus, Minus, Trash2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function CartDrawer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isCartOpen, setCartOpen } = useCartStore();

  // Fetch cart items
  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart');
      return res.data.data.cartItems;
    },
    enabled: isCartOpen,
  });

  // Mutation: Update quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ listingId, quantity }: { listingId: string; quantity: number }) => {
      return api.patch(`/cart/items/${listingId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutation: Remove item
  const removeItemMutation = useMutation({
    mutationFn: async (listingId: string) => {
      return api.delete(`/cart/items/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Calculate totals
  const subtotal = cartItems?.reduce((sum: number, item: any) => {
    return sum + Number(item.listing.discountedPrice) * item.quantity;
  }, 0) || 0;

  const commissionRate = cartItems?.[0]?.listing?.restaurant?.commissionRate || 15;
  const platformFee = subtotal * (commissionRate / 100);
  const totalAmount = subtotal + platformFee;

  const handleCheckout = () => {
    setCartOpen(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md bg-white border-l border-slate-200 flex flex-col justify-between p-0">
        <div className="flex-1 flex flex-col overflow-hidden">
          <SheetHeader className="p-6 border-b border-slate-100 text-left">
            <SheetTitle className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="text-emerald-600" size={22} />
              Shopping Cart
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              Surplus reservations are held for checkout.
            </SheetDescription>
          </SheetHeader>

          {/* Cart List */}
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="animate-spin text-emerald-600" />
              <span className="text-sm font-medium">Loading cart...</span>
            </div>
          ) : !cartItems || cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <ShoppingCart size={48} className="text-slate-200 mb-4" />
              <p className="font-bold text-slate-700">Your cart is empty</p>
              <p className="text-slate-400 text-xs mt-1 max-w-[240px]">
                Add discount surplus items from the discover feed to checkout.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-xs font-extrabold tracking-wider text-slate-400 uppercase mb-2">
                Ordering from: <span className="text-slate-700 font-black">{cartItems[0].listing.restaurant.name}</span>
              </div>
              
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all items-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    {item.listing.imageUrl ? (
                      <img src={item.listing.imageUrl} alt={item.listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold text-sm">
                        Food
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{item.listing.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm font-bold text-slate-900">₹{Number(item.listing.discountedPrice).toFixed(0)}</span>
                      <span className="text-xs text-slate-400 line-through">₹{Number(item.listing.originalPrice).toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-1.5 py-1 bg-white">
                    <button
                      disabled={updateQuantityMutation.isPending}
                      onClick={() => updateQuantityMutation.mutate({
                        listingId: item.listingId,
                        quantity: Math.max(0, item.quantity - 1)
                      })}
                      className="text-slate-500 hover:text-emerald-600 p-0.5"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-extrabold text-slate-850 px-1">{item.quantity}</span>
                    <button
                      disabled={updateQuantityMutation.isPending}
                      onClick={() => updateQuantityMutation.mutate({
                        listingId: item.listingId,
                        quantity: item.quantity + 1
                      })}
                      className="text-slate-500 hover:text-emerald-600 p-0.5"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Delete Action */}
                  <button
                    disabled={removeItemMutation.isPending}
                    onClick={() => removeItemMutation.mutate(item.listingId)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Checkout Summary */}
        {cartItems && cartItems.length > 0 && (
          <div className="border-t border-slate-100 p-6 bg-slate-50/50 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Platform Commission ({commissionRate}%)</span>
                <span className="font-semibold text-slate-800">₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200/60 my-2 pt-2 flex justify-between font-black text-slate-900 text-lg">
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 font-medium">
              <ShieldCheck size={16} className="shrink-0" />
              <span>We use transaction locks to prevent overselling.</span>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl"
            >
              Confirm Reservation <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
