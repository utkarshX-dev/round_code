'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/Badge';
import {
  UserCheck,
  Check,
  X,
  Clock,
  AlertCircle,
  Mail,
  GraduationCap,
  Calendar,
  Key,
  Loader2,
} from 'lucide-react';

export default function RegistrationsManagementPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvedResult, setApprovedResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else if (!isAdmin) router.push('/dashboard');
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchRegistrations = async (status) => {
    setLoading(true);
    try {
      const res = await api.get(`/registrations?status=${status}`);
      if (res.success) {
        setRegistrations(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRegistrations(tab);
    }
  }, [isAdmin, tab]);

  const handleApprove = async (reg) => {
    setActionLoading(true);
    setApprovingId(reg._id);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.patch(`/registrations/${reg._id}/approve`);
      if (res.success) {
        setApprovedResult({
          name: reg.name,
          email: reg.personalEmail,
          tempPassword: res.data?.tempPasswordDev,
        });
        setMsg({ type: 'success', text: `Approved registration for ${reg.name}!` });
        await fetchRegistrations(tab);
      } else {
        setMsg({ type: 'error', text: res.message || 'Approval failed.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Approval failed.' });
    } finally {
      setActionLoading(false);
      setApprovingId(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedReg) return;
    setActionLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.patch(`/registrations/${selectedReg._id}/reject`, {
        rejectionReason,
      });
      if (res.success) {
        setMsg({ type: 'success', text: `Rejected application for ${selectedReg.name}.` });
        setRejectModal(false);
        setRejectionReason('');
        setSelectedReg(null);
        fetchRegistrations(tab);
      } else {
        setMsg({ type: 'error', text: res.message || 'Rejection failed.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Rejection failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner text="Checking credentials..." />;
  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-cyan-400" />
            <span>Membership Registration Management</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Review incoming Round Table DTU membership requests and issue accounts
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              tab === 'pending'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Queue
          </button>
          <button
            onClick={() => setTab('approved')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              tab === 'approved'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setTab('rejected')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              tab === 'rejected'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-xl border text-xs ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Main Registrations Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching registration requests..." />
      ) : registrations.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm font-mono">
          No {tab} registration applications found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {registrations.map((reg) => (
            <div
              key={reg._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-white">{reg.name}</h3>
                  <StatusBadge status={reg.status} />
                </div>

                <div className="space-y-1.5 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{reg.dtuEmail}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{reg.personalEmail}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {reg.branch} (Batch {reg.batch})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                    <Clock className="w-3 h-3" />
                    <span>Applied: {new Date(reg.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {reg.rejectionReason && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40 text-[11px] text-rose-300">
                    <span className="font-bold block mb-0.5">Rejection Reason:</span>
                    {reg.rejectionReason}
                  </div>
                )}
              </div>

              {/* Actions for Pending applications */}
              {reg.status === 'pending' && (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleApprove(reg)}
                    disabled={actionLoading}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-1"
                  >
                    {approvingId === reg._id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Email</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReg(reg);
                      setRejectModal(true);
                    }}
                    disabled={actionLoading}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/40 transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Reject Registration Request</h3>
            <p className="text-xs text-slate-400">
              Provide a reason for rejecting <strong className="text-slate-200">{selectedReg.name}</strong>. An email notification will be sent to their personal email address.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rejection Reason
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Could not verify active DTU roll number in college records..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white glass-panel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-rose-400 hover:bg-rose-300 transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approved Credentials Modal Confirmation (Section 8) */}
      {approvedResult && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/40 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Key className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Member Approved!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Login credentials have been securely dispatched to{' '}
              <strong className="text-cyan-400 font-mono">{approvedResult.email}</strong>.
            </p>

            {approvedResult.tempPassword && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left font-mono text-xs space-y-1">
                <span className="text-slate-500 block text-[10px]">
                  Generated Temporary Password (Dev Preview):
                </span>
                <span className="text-amber-400 font-bold selection:bg-amber-400 selection:text-slate-950">
                  {approvedResult.tempPassword}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setApprovedResult(null)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
