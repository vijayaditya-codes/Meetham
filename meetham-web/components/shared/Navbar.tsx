'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../lib/zustand/auth-store';
import { useCartStore } from '../../lib/zustand/cart-store';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api/axios';
import { ShoppingBag, User, LogOut, Shield, LayoutDashboard, UtensilsCrossed } from 'lucide-react';
import { Button, buttonVariants } from '../ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const { setCartOpen } = useCartStore();

  // Fetch cart items to display count badge
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart');
      return res.data.data.cartItems;
    },
    enabled: !!user && user.role === 'CUSTOMER',
  });

  const cartCount = cartData?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      clearAuth();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-2xl font-black tracking-tight text-transparent">
            MEETHAM
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            Surplus Food
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/discover" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
            Discover Food
          </Link>
          {user?.role === 'RESTAURANT' && (
            <Link href="/vendor/dashboard" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
              <LayoutDashboard size={16} /> Restaurant Panel
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin/dashboard" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
              <Shield size={16} /> Admin Portal
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Real-time notifications */}
          {user && <NotificationBell />}

          {/* Customer Cart */}
          {(!user || user.role === 'CUSTOMER') && (
            <button
              onClick={() => user ? setCartOpen(true) : (window.location.href = '/login')}
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 p-0 text-xs text-white">
                  {cartCount}
                </Badge>
              )}
            </button>
          )}

          {/* User Profile / Auth State */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none border-0 p-0 bg-transparent cursor-pointer">
                <Avatar className="h-9 w-9 border-2 border-slate-200 hover:border-emerald-500 transition-all">
                  <AvatarFallback className="bg-emerald-600 text-white font-semibold text-sm">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200">
                <div className="flex flex-col px-4 py-2">
                  <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                  <span className="text-xs text-slate-500 truncate">{user.email}</span>
                  <Badge variant="secondary" className="w-fit mt-1.5 bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {user.role}
                  </Badge>
                </div>
                <DropdownMenuSeparator className="bg-slate-100" />
                
                {user.role === 'CUSTOMER' && (
                  <>
                    <DropdownMenuItem className="p-0">
                      <Link href="/orders" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-0">
                      <Link href="/profile" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {user.role === 'RESTAURANT' && (
                  <>
                    <DropdownMenuItem className="p-0">
                      <Link href="/vendor/dashboard" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-0">
                      <Link href="/vendor/listings" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        Manage Listings
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <DropdownMenuItem className="p-0">
                    <Link href="/admin/dashboard" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                      Overview Stats
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer">
                  <LogOut size={16} />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }), "hidden sm:inline-flex text-slate-600 font-medium")}>
                Login
              </Link>
              <Link href="/register" className={cn(buttonVariants({ variant: 'default' }), "bg-emerald-600 text-white hover:bg-emerald-700 font-medium")}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
