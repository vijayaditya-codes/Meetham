'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/zustand/auth-store';
import api from '@/lib/api/axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data.data;
      
      // Store in Zustand
      setAuth(user, accessToken);

      // Redirect depending on user role
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (user.role === 'RESTAURANT') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/discover');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Failed to connect to the server. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]"></div>
      
      <Card className="w-full max-w-md bg-slate-900/60 border-slate-800 text-white backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-3xl font-black tracking-tight text-transparent">
              MEETHAM
            </span>
          </Link>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400">
            Log in to save surplus food and reduce food waste.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 p-3.5 text-sm text-red-400 border border-red-500/20">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@meetham.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950/40 border-slate-800 text-white focus-visible:ring-emerald-500 placeholder:text-slate-600"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-950/40 border-slate-800 text-white focus-visible:ring-emerald-500 placeholder:text-slate-600"
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-all mt-6"
            >
              {isLoading ? 'Connecting...' : 'Log In'}
              {!isLoading && <LogIn size={16} className="ml-2" />}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 justify-center text-center text-sm border-t border-slate-800/60 pt-6">
          <p className="text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Create an account
            </Link>
          </p>
          
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400">
            Back to homepage <ArrowRight size={12} />
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
