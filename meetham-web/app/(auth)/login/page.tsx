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
import { motion } from 'framer-motion';
import { ShieldAlert, LogIn, ArrowRight, Sparkles, Mail, Lock } from 'lucide-react';

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
      {/* Background Glows (Moving animations) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 0.9, 1],
            x: [0, 30, -30, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-emerald-500/10 blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 0.9, 1.15, 1.1],
            x: [0, -30, 40, 0],
            y: [0, 40, -40, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[90px]"
        />
      </div>

      {/* Main card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-slate-900/40 border border-white/5 text-white backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.08)] rounded-3xl overflow-hidden">
          <CardHeader className="text-center space-y-2 pb-6 border-b border-white/5">
            <Link href="/" className="inline-block group">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-3xl font-black tracking-tight text-transparent group-hover:scale-105 transition-transform block">
                MEETHAM
              </span>
            </Link>
            <CardTitle className="text-xl font-bold flex items-center justify-center gap-1.5 mt-2">
              Welcome Back <Sparkles size={16} className="text-emerald-400 animate-pulse" />
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Log in to save surplus food and reduce emissions.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 pt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 rounded-2xl bg-red-500/10 p-3.5 text-xs text-red-400 border border-red-500/20"
                >
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-350 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-500" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@meetham.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-950/40 border-slate-800 text-white focus-visible:ring-emerald-500 placeholder:text-slate-700 rounded-xl"
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-350 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Lock size={12} className="text-slate-500" /> Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-950/40 border-slate-800 text-white focus-visible:ring-emerald-500 placeholder:text-slate-700 rounded-xl"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black py-3 rounded-2xl border-0 mt-6 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
              >
                {isLoading ? 'Connecting...' : 'Log In'}
                {!isLoading && <LogIn size={16} className="ml-2" />}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 justify-center text-center text-xs border-t border-white/5 p-6 bg-slate-950/20">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Create an account
              </Link>
            </p>
            
            <Link href="/" className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-400 font-bold uppercase tracking-wider mt-1 transition-colors">
              Back to homepage <ArrowRight size={10} />
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
