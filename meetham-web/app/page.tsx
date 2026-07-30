'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/shared/Navbar';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, ShieldAlert, Award, Compass, ShoppingBag, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]"></div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                🌱 Direct Surplus Food Handoff
              </span>
            </motion.div>

            <motion.h1
              className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Save Good Food.<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Save Big Money.</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg leading-8 text-slate-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Meetham connects you with local restaurants, bakeries, and cafes selling high-quality surplus food at 50-70% off. Feed your appetite while cutting carbon footprint.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold" asChild>
                <Link href="/discover">
                  Discover Food Near Me <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" className="w-full sm:w-auto text-white border border-slate-700 hover:bg-slate-800 bg-transparent hover:text-emerald-400 font-medium" asChild>
                <Link href="/restaurant-signup">
                  Register Restaurant Profile
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-emerald-50 border-y border-emerald-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-emerald-800">450+ Kg</div>
              <div className="text-sm font-medium text-emerald-600 mt-1">Surplus Food Saved</div>
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-800">₹72,400+</div>
              <div className="text-sm font-medium text-emerald-600 mt-1">Gross Saved Value</div>
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-800">1.1 Ton</div>
              <div className="text-sm font-medium text-emerald-600 mt-1">CO2 Footprint Reduced</div>
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-800">12,500+</div>
              <div className="text-sm font-medium text-emerald-600 mt-1">Meals Shared</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Easy 3-Step Walk-In Pickup
            </h2>
            <p className="mt-4 text-slate-500 text-lg">
              Snag delicious meals directly from the kitchen at steep discounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
                <Compass size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">1. Discover Surplus Listings</h3>
              <p className="text-slate-500 mt-3 text-sm leading-relaxed">
                Filter fresh active meals near your location. Search for bakery boxes, full meals, or groceries.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="h-16 w-16 bg-teal-100 text-teal-700 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">2. Order & Reserve Instantly</h3>
              <p className="text-slate-500 mt-3 text-sm leading-relaxed">
                Checkout securely via online payment methods. Our atomic checkout locks the inventory.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="h-16 w-16 bg-cyan-100 text-cyan-700 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">3. Walk-In & Verify OTP</h3>
              <p className="text-slate-500 mt-3 text-sm leading-relaxed">
                Visit the store before the pickup window expires, show your 6-digit OTP code, and collect your food.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-600 font-bold text-sm tracking-wider uppercase">Environmental Fight</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mt-2">
                1/3 of All Food is Wasted
              </h2>
              <p className="mt-4 text-slate-600 text-base leading-relaxed">
                Food waste contributes up to 8% of global greenhouse emissions. When we throw away edible meals, we waste the water, labor, and energy used to produce it.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-full mt-0.5">
                    <Leaf size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Carbon Capture</h4>
                    <p className="text-slate-500 text-xs mt-1">Every meal saved prevents about 2.5kg of CO2 emissions from landfill decay.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-full mt-0.5">
                    <Award size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Certified Impact Tracking</h4>
                    <p className="text-slate-500 text-xs mt-1">Check your personal profile dashboard for real-time tracking of food saved (kg).</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual Graphic */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white relative shadow-xl overflow-hidden min-h-[300px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 h-64 w-64 bg-white/10 rounded-full blur-2xl"></div>
              <div>
                <span className="text-xs font-extrabold tracking-wider bg-white/20 px-3 py-1 rounded-full uppercase">Impact Stat</span>
                <h3 className="text-3xl font-black mt-4 leading-tight">Saving food is the #1 solution to combat climate change.</h3>
              </div>
              <div className="border-t border-white/20 pt-6 mt-8 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/80">Project Drawdown</div>
                  <div className="text-xs text-white/60">Climate Action Rankings</div>
                </div>
                <div className="bg-white text-emerald-800 font-extrabold px-4 py-2 rounded-2xl text-sm shadow-sm">
                  Ranked #1
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-white font-extrabold text-lg tracking-tight">MEETHAM</span>
              <p className="text-xs mt-1 text-slate-500">© 2026 Meetham Surplus Food Network. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/discover" className="hover:text-white transition-colors text-sm">Discover</Link>
              <Link href="/terms" className="hover:text-white transition-colors text-sm">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white transition-colors text-sm">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
