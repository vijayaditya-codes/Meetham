'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/shared/Navbar';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, ShieldAlert, Award, Compass, ShoppingBag, Clock, Sparkles, TrendingUp, ShieldCheck, Heart } from 'lucide-react';
import { buttonVariants } from '../components/ui/button';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  // Staggered Container Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      <Navbar />

      {/* Futuristic Background Nodes (Moving Animations) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Glow 1 */}
        <motion.div
          animate={{
            scale: [1, 1.15, 0.9, 1],
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: 'easeInOut',
          }}
          className="absolute top-[10%] left-[15%] w-96 h-96 rounded-full bg-emerald-500/10 blur-[80px]"
        />

        {/* Glow 2 */}
        <motion.div
          animate={{
            scale: [1.1, 0.85, 1.05, 1.1],
            x: [0, -30, 40, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: 'easeInOut',
          }}
          className="absolute top-[30%] right-[10%] w-[450px] h-[450px] rounded-full bg-teal-500/10 blur-[100px]"
        />

        {/* Glow 3 */}
        <motion.div
          animate={{
            scale: [0.9, 1.1, 1, 0.9],
            x: [0, 20, -30, 0],
            y: [0, -40, 40, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: 'easeInOut',
          }}
          className="absolute bottom-[20%] left-[20%] w-80 h-80 rounded-full bg-emerald-600/5 blur-[90px]"
        />

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-24 sm:py-32 flex items-center justify-center min-h-[85vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/30 backdrop-blur-md mb-6 hover:bg-emerald-500/20 transition-all cursor-default"
            >
              <Sparkles size={12} className="animate-pulse" /> Direct Surplus Food Marketplace
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <motion.h1
                variants={itemVariants}
                className="text-5xl font-black tracking-tight sm:text-7xl leading-tight text-white"
              >
                Save Delicious Food.<br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent bg-[size:200%_auto] animate-gradient-flow">
                  Save Up To 70% Off.
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto"
              >
                Join Meetham in diverting fresh surplus meals, bakery boxes, and restaurant products from landfills. Enjoy premium meals, cut carbon footprints, and save money.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
              >
                <Link
                  href="/discover"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    "w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold px-8 py-4.5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-0.5"
                  )}
                >
                  Discover Food Near Me <ArrowRight size={18} />
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: 'lg', variant: 'outline' }),
                    "w-full sm:w-auto text-slate-200 border-slate-800 hover:bg-slate-900/60 backdrop-blur-md font-bold px-8 py-4.5 rounded-2xl flex items-center justify-center"
                  )}
                >
                  Join as Merchant / Partner
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Stats Grid (Aesthetic ticker) */}
      <section className="relative z-10 py-16 border-y border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-4"
            >
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">450+ Kg</div>
              <div className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">Surplus Food Saved</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-4"
            >
              <div className="text-3xl sm:text-4xl font-black text-teal-400 font-mono">₹72,400+</div>
              <div className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">Value Saved</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-4"
            >
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">1.1 Ton</div>
              <div className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">CO2 Diverted</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-4"
            >
              <div className="text-3xl sm:text-4xl font-black text-teal-400 font-mono">12,500+</div>
              <div className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">Meals Replaced</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section (Glassmorphic Cards) */}
      <section className="relative z-10 py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Easy 3-Step Handoff
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Snag delicious surplus boxes directly from the kitchens or have them delivered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              whileHover={{ y: -8, borderColor: 'rgba(16,185,129,0.3)' }}
              className="flex flex-col items-center text-center p-8 bg-slate-900/30 border border-slate-900 rounded-3xl backdrop-blur-xl transition-all shadow-xl group cursor-default"
            >
              <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-2xl mb-6 ring-1 ring-emerald-500/20 group-hover:scale-110 transition-transform">
                <Compass size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">1. Search & Lock Deals</h3>
              <p className="text-slate-400 mt-3 text-xs leading-relaxed">
                Filter fresh active surplus listings within your coordinates radius. Secure checkout locks items instantly.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              whileHover={{ y: -8, borderColor: 'rgba(20,184,166,0.3)' }}
              className="flex flex-col items-center text-center p-8 bg-slate-900/30 border border-slate-900 rounded-3xl backdrop-blur-xl transition-all shadow-xl group cursor-default"
            >
              <div className="h-16 w-16 bg-teal-500/10 text-teal-400 flex items-center justify-center rounded-2xl mb-6 ring-1 ring-teal-500/20 group-hover:scale-110 transition-transform">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">2. Select Handoff Mode</h3>
              <p className="text-slate-400 mt-3 text-xs leading-relaxed">
                Choose self counter pickup or real-time rider delivery path with auto-assignment tracking.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              whileHover={{ y: -8, borderColor: 'rgba(16,185,129,0.3)' }}
              className="flex flex-col items-center text-center p-8 bg-slate-900/30 border border-slate-900 rounded-3xl backdrop-blur-xl transition-all shadow-xl group cursor-default"
            >
              <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-2xl mb-6 ring-1 ring-emerald-500/20 group-hover:scale-110 transition-transform">
                <Clock size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">3. Collect & Confirm</h3>
              <p className="text-slate-400 mt-3 text-xs leading-relaxed">
                Meet partner or rider, share the 6-digit dropoff/pickup verification OTP code, and enjoy your meal!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Parallax Ecological Impact Infographic */}
      <section className="relative z-10 py-20 border-t border-white/5 bg-slate-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-6">
              <span className="text-emerald-400 font-extrabold text-xs tracking-wider uppercase block">Carbon Diverting</span>
              <h2 className="text-3xl font-black text-white sm:text-5xl leading-tight">
                One Third Of Food Produced Goes To Landfills.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Edible landfill organic material produces methane, which is 25x more harmful than carbon dioxide. Rescuing food is the single most actionable path to lowering carbon footprint.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl ring-1 ring-emerald-500/20 mt-0.5">
                    <Leaf size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">CO2 Offset Counter</h4>
                    <p className="text-slate-400 text-xs mt-1">Every surplus checkout transaction prevents approximately 2.5kg of carbon footprint decay.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-teal-500/10 text-teal-400 p-2 rounded-xl ring-1 ring-teal-500/20 mt-0.5">
                    <Award size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Personal Green Badges</h4>
                    <p className="text-slate-400 text-xs mt-1">Unlock ecological verification badges in your user dashboard as your saved count grows.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing Parallax Visual Widget */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-emerald-950/50 to-slate-900/60 border border-emerald-500/20 rounded-3xl p-8 text-white relative shadow-2xl overflow-hidden min-h-[350px] flex flex-col justify-between"
            >
              {/* Spinning background solar glow */}
              <div className="absolute -top-20 -right-20 h-64 w-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
              
              <div className="flex justify-between items-start z-10">
                <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full ring-1 ring-emerald-500/30 tracking-widest flex items-center gap-1.5">
                  <Sparkles size={10} /> Impact Infographic
                </div>
                <Heart size={20} className="text-red-400 fill-red-400/20 animate-pulse" />
              </div>

              <div className="my-8 z-10">
                <h3 className="text-2xl sm:text-3xl font-black leading-snug">
                  "Saving food is ranked as the #1 solution to combat greenhouse warming."
                </h3>
                <span className="text-xs text-emerald-400 font-bold block mt-3">— Project Drawdown Review</span>
              </div>

              <div className="border-t border-white/5 pt-6 flex items-center justify-between z-10">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Carbon Score</span>
                  <span className="text-base font-black text-white mt-0.5">Ranked #1 Global Strategy</span>
                </div>
                <div className="bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs shadow-lg uppercase tracking-wide">
                  Verified Green
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950 text-slate-500 py-12 border-t border-white/5 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-xl font-black tracking-tight text-transparent">MEETHAM</span>
              <p className="text-[10px] mt-1 text-slate-500 font-semibold uppercase tracking-wider">© 2026 Meetham Surplus Food Network. Reducing waste, saving meals.</p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/discover" className="hover:text-emerald-400 transition-colors text-xs font-bold uppercase tracking-wider">Discover</Link>
              <Link href="/terms" className="hover:text-emerald-400 transition-colors text-xs font-bold uppercase tracking-wider">Terms</Link>
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors text-xs font-bold uppercase tracking-wider">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
