'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { RoleBadge } from '@/components/common/Badge';
import {
  Crown,
  UserPlus,
  Trash2,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function SuperAdminPage() {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [admins, setAdmins] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Admin form
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    dtuEmail: '',
    personalEmail: '',
    password: '',
  });

  // Manual Rating Modification form (Section 57)
  const [ratingAdjustment, setRatingAdjustment] = useState({
    memberId: '',
    newRating: '',
    reason: '',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else if (!isSuperAdmin) router.push('/admin/dashboard');
    }
  }, [user, isSuperAdmin, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, membersRes] = await Promise.all([
        api.get('/admin/admins'),
        api.get('/users?sort=name'),
      ]);

      if (adminsRes.success) setAdmins(adminsRes.data || []);
      if (membersRes.success) setMembers(membersRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) loadData();
  }, [isSuperAdmin]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await api.post('/admin/admins', newAdmin);
      if (res.success) {
        setMsg({ type: 'success', text: `Admin ${newAdmin.name} created successfully!` });
        setNewAdmin({ name: '', dtuEmail: '', personalEmail: '', password: '' });
        loadData();
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to create admin.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to create admin.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAdmin = async (id, name) => {
    if (!confirm(`Are you sure you want to revoke admin authority from ${name}?`)) return;
    try {
      const res = await api.delete(`/admin/admins/${id}`);
      if (res.success) {
        setMsg({ type: 'success', text: `Revoked admin privileges for ${name}.` });
        loadData();
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to revoke admin.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to revoke admin.' });
    }
  };

  const handleAdjustRating = async (e) => {
    e.preventDefault();
    if (!ratingAdjustment.memberId) {
      setMsg({ type: 'error', text: 'Please select a member to adjust.' });
      return;
    }

    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await api.patch(`/admin/ratings/${ratingAdjustment.memberId}`, {
        newRating: Number(ratingAdjustment.newRating),
        reason: ratingAdjustment.reason,
      });

      if (res.success) {
        setMsg({
          type: 'success',
          text: `Rating updated successfully! New rating: ${res.data?.newRating} pts with audit entry.`,
        });
        setRatingAdjustment({ memberId: '', newRating: '', reason: '' });
        loadData();
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to update rating.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update rating.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner text="Checking Super Admin clearance..." />;
  if (!isSuperAdmin) return null;

  const selectedMemberObj = members.find((m) => m._id === ratingAdjustment.memberId);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Crown className="w-7 h-7 text-purple-400" />
            <span>Super Administrator Console</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Privileged controls: Manage platform administrators and manual rating corrections
          </p>
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

      {/* Section 56: Admin Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Create Admin Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-purple-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Appoint New Administrator</h3>
          </div>
          <p className="text-xs text-slate-400">
            Admins have permissions to review submissions, schedule POTWs, and approve registrations.
          </p>

          <form onSubmit={handleCreateAdmin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                DTU Email (*@dtu.ac.in)
              </label>
              <input
                type="email"
                required
                value={newAdmin.dtuEmail}
                onChange={(e) => setNewAdmin({ ...newAdmin, dtuEmail: e.target.value })}
                placeholder="rahul22coe@dtu.ac.in"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                Personal Login Email
              </label>
              <input
                type="email"
                required
                value={newAdmin.personalEmail}
                onChange={(e) => setNewAdmin({ ...newAdmin, personalEmail: e.target.value })}
                placeholder="rahul.admin@gmail.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Temporary Password</label>
              <input
                type="password"
                required
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-purple-400 hover:bg-purple-300 transition-colors shadow-md shadow-purple-500/20"
            >
              Appoint Administrator
            </button>
          </form>
        </div>

        {/* Existing Admins List */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Active Administrators</h3>
          </div>
          <p className="text-xs text-slate-400">
            List of users currently possessing administrative clearance.
          </p>

          <div className="space-y-3 pt-2">
            {admins.map((adm) => (
              <div
                key={adm._id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-white">{adm.name}</h5>
                    <RoleBadge role={adm.role} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {adm.personalEmail} • {adm.dtuEmail}
                  </p>
                </div>

                {adm.role !== 'super_admin' && adm._id !== user._id && (
                  <button
                    onClick={() => handleRemoveAdmin(adm._id, adm.name)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                    title="Revoke Admin Authority"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 57: Manual Rating Modification Tool */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-amber-500/30 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Manual Rating Adjustment Tool</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Section 57: Only Super Admin can modify ratings. Requires mandatory reason and logs an immutable audit trail.
          </p>
        </div>

        <form onSubmit={handleAdjustRating} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Member *</label>
              <select
                required
                value={ratingAdjustment.memberId}
                onChange={(e) =>
                  setRatingAdjustment({ ...ratingAdjustment, memberId: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose Member --</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.rating} pts)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                Current Rating
              </label>
              <input
                type="text"
                disabled
                value={selectedMemberObj ? `${selectedMemberObj.rating} pts` : '-'}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-mono cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                New Rating Value * (Min 0)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                placeholder="e.g. 45.5"
                value={ratingAdjustment.newRating}
                onChange={(e) =>
                  setRatingAdjustment({ ...ratingAdjustment, newRating: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mandatory Audit Reason *
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Correction for incorrectly evaluated POTW #10 testcase edge..."
                value={ratingAdjustment.reason}
                onChange={(e) =>
                  setRatingAdjustment({ ...ratingAdjustment, reason: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20"
          >
            {saving ? 'Updating...' : 'Record & Apply Rating Adjustment'}
          </button>
        </form>
      </div>
    </div>
  );
}
