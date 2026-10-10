'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/Badge';
import {
  FileCheck2,
  Activity,
  ArrowRight,
  Users,
  Shield,
} from 'lucide-react';
import RoundTableLogo from '@/components/common/RoundTableLogo';

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/admin/login');
      else if (!isAdmin) router.push('/dashboard');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) loadStats();
  }, [isAdmin]);

  const formatAuditAction = (action) => {
    switch (action) {
      case 'REVIEW_SUBMISSION':
        return { label: 'Review Submission', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'APPROVE_REGISTRATION':
        return { label: 'Approve Registration', color: 'bg-[#a3ff20]/15 text-[#a3ff20] border-[#a3ff20]/30' };
      case 'REJECT_REGISTRATION':
        return { label: 'Reject Registration', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'CREATE_POTW':
        return { label: 'Create POTW', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'CREATE_ADMIN':
        return { label: 'Create Admin', color: 'bg-[#b4a2f8]/15 text-[#b4a2f8] border-[#b4a2f8]/30' };
      case 'REMOVE_ADMIN':
        return { label: 'Demote Admin', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'REMOVE_MEMBER':
        return { label: 'Remove Member', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'MANUAL_RATING_CHANGE':
        return { label: 'Adjust Rating', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      default:
        return { label: (action || '').replace(/_/g, ' '), color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  const renderAuditDetails = (log) => {
    const d = log.details || {};
    switch (log.action) {
      case 'REVIEW_SUBMISSION':
        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">
              POTW #{d.potwWeekNumber ?? '?'}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#a3ff20] font-bold">
              Score: {d.score ?? 0} pts
            </span>
            {d.previousRating !== undefined && d.newRating !== undefined && (
              <span className="text-zinc-300 font-mono text-[11px] bg-[#090a0f] px-2 py-0.5 rounded-lg border border-[#202230]">
                Rating: {d.previousRating} → <strong className="text-[#a3ff20]">{d.newRating}</strong>
              </span>
            )}
          </div>
        );
      case 'APPROVE_REGISTRATION':
        return (
          <div className="text-zinc-300">
            Account approved & activated for{' '}
            <span className="text-white font-semibold">{d.dtuEmail || d.personalEmail}</span>
          </div>
        );
      case 'REJECT_REGISTRATION':
        return (
          <div className="text-zinc-300">
            Rejected application for <span className="text-white font-semibold">{d.dtuEmail}</span>
            {log.reason && <span className="text-zinc-400 text-[11px] block mt-0.5">Reason: {log.reason}</span>}
          </div>
        );
      case 'CREATE_POTW':
        return (
          <div className="text-zinc-300 flex items-center gap-2 flex-wrap">
            <span>Published <strong className="text-white">POTW #{d.weekNumber}: {d.title}</strong></span>
            {d.status && (
              <span className="text-[#a3ff20] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#a3ff20]/10 border border-[#a3ff20]/30">
                {d.status}
              </span>
            )}
          </div>
        );
      case 'CREATE_ADMIN':
        return (
          <div className="text-zinc-300">
            Added <span className="text-white font-semibold">{d.adminName}</span> ({d.adminEmail}) as administrator
          </div>
        );
      case 'REMOVE_MEMBER':
        return (
          <div className="text-zinc-300">
            Removed member <span className="text-rose-300 font-semibold">{d.memberName}</span> ({d.dtuEmail})
            {log.reason && <span className="text-zinc-500 text-[11px] block mt-0.5">Note: {log.reason}</span>}
          </div>
        );
      case 'REMOVE_ADMIN':
        return (
          <div className="text-zinc-300">
            Demoted admin <span className="text-rose-300 font-semibold">{d.adminName || log.targetId}</span>
          </div>
        );
      default:
        if (log.reason) return <span className="text-zinc-300">{log.reason}</span>;
        if (d && typeof d === 'object' && Object.keys(d).length > 0) {
          return (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(d).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 rounded-lg bg-[#090a0f] text-zinc-300 border border-[#202230] text-[11px]">
                  <span className="text-zinc-500 mr-1">{k}:</span>
                  <span className="text-white font-medium">{String(v)}</span>
                </span>
              ))}
            </div>
          );
        }
        return <span className="text-zinc-500">—</span>;
    }
  };

  if (authLoading || loading) return <LoadingSpinner text="Loading admin analytics..." />;
  if (!isAdmin || !stats) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#202230]">
        <div className="flex items-center gap-4">
          <RoundTableLogo size={46} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#a3ff20] bg-[#a3ff20]/15 px-2 py-0.5 rounded-md">
                Admin
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Administration Hub
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Round Table DTU oversight, verification queues, and challenge analytics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/members"
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider btn-tactile-dark flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-[#a3ff20]" />
            <span>Manage Members ({stats.totalMembers})</span>
          </Link>
          <Link
            href="/admin/submissions"
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider btn-tactile-dark flex items-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4 text-[#b4a2f8]" />
            <span>Review Submissions ({stats.pendingSubmissions})</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link
          href="/members"
          className="bg-[#12131b] p-4 rounded-2xl border border-[#202230] hover:border-[#a3ff20] transition-colors group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Total Members</span>
            <span className="text-[10px] text-[#a3ff20] group-hover:underline">Manage →</span>
          </div>
          <span className="text-2xl font-black text-white mt-1 block">{stats.totalMembers}</span>
        </Link>

        <div className="bg-[#12131b] p-4 rounded-2xl border border-[#202230]">
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Active POTW</span>
          <span className="text-2xl font-black text-[#b4a2f8] mt-1 block">
            {stats.activePOTW ? `#${stats.activePOTW.weekNumber}` : 'None'}
          </span>
        </div>

        <div className="bg-[#12131b] p-4 rounded-2xl border border-[#202230]">
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Pending Reviews</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {stats.pendingSubmissions}
          </span>
        </div>

        <div className="bg-[#12131b] p-4 rounded-2xl border border-[#202230]">
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Average Rating</span>
          <span className="text-2xl font-black text-[#a3ff20] mt-1 block">
            {stats.avgRating}
          </span>
        </div>

        <div className="bg-[#12131b] p-4 rounded-2xl border border-[#202230]">
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Participation</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {stats.participationRate}%
          </span>
        </div>
      </div>

      {/* Main Review Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions Queue */}
        <div className="bg-[#12131b] p-6 rounded-3xl border border-[#202230] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#b4a2f8]" />
              <span>Awaiting Review</span>
            </h3>
            <Link
              href="/admin/submissions"
              className="text-xs text-[#b4a2f8] hover:underline font-bold flex items-center gap-1"
            >
              Review queue →
            </Link>
          </div>

          <div className="space-y-2.5">
            {stats.recentSubmissions?.length > 0 ? (
              stats.recentSubmissions.map((sub) => (
                <div
                  key={sub._id}
                  className="p-3.5 rounded-xl bg-[#090a0f] border border-[#202230] flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white">
                      {sub.userId?.name || 'Member'} — POTW #{sub.potwId?.weekNumber}
                    </h5>
                    <p className="text-[11px] text-zinc-400">
                      Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={sub.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-6 text-center">
                No pending submissions in queue.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#12131b] rounded-3xl border border-[#202230] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#202230] flex items-center justify-between bg-[#0d0e14]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#b4a2f8]" />
              <span>Administrative Audit Log</span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Structured records of all administrative operations, reviews, and membership actions
            </p>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono bg-[#14151f] px-2.5 py-1 rounded-full border border-[#202230]">
            Live Event Stream
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090a0f] text-zinc-400 uppercase text-[10px] border-b border-[#202230]">
              <tr>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Administrator</th>
                <th className="py-3.5 px-6">Operation</th>
                <th className="py-3.5 px-6">Target</th>
                <th className="py-3.5 px-6">Summary / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202230]">
              {stats.recentAudits?.length > 0 ? (
                stats.recentAudits.map((log) => {
                  const actionMeta = formatAuditAction(log.action);
                  return (
                    <tr key={log._id} className="hover:bg-[#181a24] transition-colors">
                      <td className="py-3.5 px-6 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold">{log.actorName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1e192e] text-[#b4a2f8] border border-[#b4a2f8]/30">
                            {log.actorRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${actionMeta.color}`}
                        >
                          {actionMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-zinc-400 font-mono text-[11px]">
                        {log.targetType || 'System'}
                      </td>
                      <td className="py-3.5 px-6 text-zinc-300">
                        {renderAuditDetails(log)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No administrative audit records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
