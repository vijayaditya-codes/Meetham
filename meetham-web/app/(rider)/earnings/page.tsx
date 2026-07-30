'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

export default function RiderEarningsPage() {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/delivery-partners/me/assignments');
        const assignments = res.data.data.assignments;
        
        setHistory(assignments);
        
        // Calculate basic statistics from historical data
        const completed = assignments.filter((a: any) => a.status === 'DELIVERED');
        const totalEarnings = completed.reduce((sum: number, a: any) => sum + (Number(a.order.deliveryFee) || 30), 0);
        
        setStats({
          completedCount: completed.length,
          totalEarnings,
          rating: 4.9, // mock rating representation
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8">
        <p className="text-slate-400 animate-pulse font-medium text-sm">Loading earnings summary...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-md w-full mx-auto px-4 py-8 space-y-6 text-white">
      <h2 className="text-2xl font-black">Earnings & History</h2>

      {/* Grid statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-900/60 border-slate-800 text-white backdrop-blur-xl rounded-3xl">
          <CardContent className="p-6">
            <DollarSign className="text-emerald-500 mb-2" size={24} />
            <div className="text-[10px] text-slate-500 font-bold uppercase">Total Payouts</div>
            <h3 className="text-2xl font-black mt-1">₹{stats?.totalEarnings || 0}</h3>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 text-white backdrop-blur-xl rounded-3xl">
          <CardContent className="p-6">
            <CheckCircle className="text-emerald-500 mb-2" size={24} />
            <div className="text-[10px] text-slate-500 font-bold uppercase">Deliveries</div>
            <h3 className="text-2xl font-black mt-1">{stats?.completedCount || 0} trips</h3>
          </CardContent>
        </Card>
      </div>

      {/* Additional Rating Summary */}
      <Card className="bg-slate-900/60 border-slate-800 text-white backdrop-blur-xl rounded-3xl">
        <CardContent className="p-6 flex justify-between items-center">
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Rider Quality Score</h4>
            <p className="text-xs text-slate-500">Your average score from customer dropoffs.</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3.5 py-1.5 rounded-2xl border border-yellow-500/20 font-bold text-sm">
            <Star size={16} className="fill-yellow-500" /> {stats?.rating}
          </div>
        </CardContent>
      </Card>

      {/* History Log */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Completed Trips</h3>
        
        {history.length === 0 ? (
          <div className="bg-slate-900/20 rounded-3xl border border-slate-800/40 p-8 text-center text-slate-500 text-xs">
            No completed trips on record. Keep online to receive assignment invitations!
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((assignment) => (
              <Card key={assignment.id} className="bg-slate-900/40 border-slate-850 hover:border-slate-800 text-white rounded-2xl">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm">{assignment.order.restaurant.name}</h5>
                    <p className="text-xs text-slate-500">
                      OTP: {assignment.otpForDropoff} • {new Date(assignment.assignedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <Badge className={assignment.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-0' : 'bg-slate-800 text-slate-400 border-0'}>
                      {assignment.status}
                    </Badge>
                    <div className="text-sm font-extrabold text-emerald-400 mt-1">
                      +₹{Number(assignment.order.deliveryFee || 30).toFixed(0)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
