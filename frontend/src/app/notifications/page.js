'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import RoundTableLogo from '@/components/common/RoundTableLogo';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) return <LoadingSpinner text="Loading notifications..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#202230]">
        <div className="flex items-center gap-4">
          <RoundTableLogo size={42} />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2.5">
              <span>Notification Center</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              POTW challenge alerts, evaluation results, and rating modifications
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase btn-tactile-dark self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-[#a3ff20]" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-[#12131b] p-12 text-center rounded-3xl border border-[#202230] text-zinc-400 text-sm">
          You&apos;re all caught up! No notifications on record.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.isRead
                  ? 'bg-[#12131b] border-[#202230] opacity-80 hover:opacity-100'
                  : 'bg-[#151622] border-[#a3ff20]/40 shadow-sm'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  {!n.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a3ff20]" />
                  )}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{n.message}</p>
                <span className="text-[11px] text-zinc-500 font-mono block pt-0.5">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {n.link && (
                  <Link
                    href={n.link}
                    onClick={() => handleMarkAsRead(n._id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-black bg-[#a3ff20] hover:bg-[#b8ff3d] transition-all inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="text-xs text-zinc-400 hover:text-white font-semibold transition-colors"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
