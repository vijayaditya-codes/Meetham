'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/zustand/auth-store';
import Navbar from '@/components/shared/Navbar';

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Only allow delivery partners to view rider console
    if (user && user.role !== 'DELIVERY_PARTNER') {
      router.push('/discover');
    }
  }, [user, router]);

  if (!user || user.role !== 'DELIVERY_PARTNER') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <p className="font-bold text-sm">Authorizing rider portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
