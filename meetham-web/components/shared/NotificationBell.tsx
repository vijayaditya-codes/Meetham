'use client';

import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/axios';
import { connectSocket } from '@/lib/socket';
import { Bell, BellRing, MailOpen, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function NotificationBell() {
  const queryClient = useQueryClient();

  // 1. Fetch user notifications history
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data.notifications;
    },
  });

  // Real-time socket listener for notifications
  useEffect(() => {
    const socket = connectSocket();

    socket.on('notification:new', (newNotification: any) => {
      console.log('[Socket] Incoming notification:', newNotification);
      // Invalidate queries to reload listing instantly
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.off('notification:new');
    };
  }, [queryClient]);

  // Mutations
  const readAllMutation = useMutation({
    mutationFn: async () => {
      return api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const readOneMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = notificationsData || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative rounded-full p-2 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all focus:outline-none border-0 bg-transparent cursor-pointer">
        {unreadCount > 0 ? (
          <>
            <BellRing className="text-emerald-600 animate-swing" size={22} />
            <Badge className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] font-bold text-white border-2 border-white">
              {unreadCount}
            </Badge>
          </>
        ) : (
          <Bell size={22} />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-white border border-slate-200 shadow-xl rounded-2xl max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-sm font-extrabold text-slate-800">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={() => readAllMutation.mutate()}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-slate-100" />

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-emerald-600" size={20} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No notifications on record.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n: any) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => !n.isRead && readOneMutation.mutate(n.id)}
                className={`flex flex-col items-start gap-1 p-3.5 focus:bg-slate-50 cursor-pointer ${!n.isRead ? 'bg-emerald-50/10' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs ${!n.isRead ? 'font-bold text-slate-850' : 'font-medium text-slate-600'}`}>
                    {n.title}
                  </span>
                  {!n.isRead && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed text-left">
                  {n.body}
                </p>
                <span className="text-[9px] text-slate-400">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
