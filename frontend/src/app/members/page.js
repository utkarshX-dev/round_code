'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Search, Trophy, CheckCircle2, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import RoundTableLogo from '@/components/common/RoundTableLogo';

export default function MembersDirectoryPage() {
  const { user, isAdmin } = useAuth();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('');
  const [sort, setSort] = useState('rating');
  const [loading, setLoading] = useState(true);

  // Admin removal state
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (branch) params.append('branch', branch);
      if (batch) params.append('batch', batch);
      if (sort) params.append('sort', sort);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.success) {
        setMembers(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load member directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, branch, batch, sort]);

  const canRemoveMember = (targetMember) => {
    if (!user || (!isAdmin && user.role !== 'admin' && user.role !== 'super_admin')) return false;
    // Cannot remove self
    if (user._id === targetMember._id || user.id === targetMember._id) return false;
    // Super admin cannot be removed via member removal
    if (targetMember.role === 'super_admin') return false;
    // Regular admin can only remove regular members
    if (user.role === 'admin' && targetMember.role === 'admin') return false;
    return true;
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    setNotification({ type: '', message: '' });

    try {
      const res = await api.delete(`/admin/members/${memberToRemove._id}`);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || `Member ${memberToRemove.name} was removed successfully.`,
        });
        setMemberToRemove(null);
        fetchMembers();
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to remove member.',
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to remove member.',
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#202230]">
        <div className="flex items-center gap-4">
          <RoundTableLogo size={46} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Member Directory
              </h1>
              {isAdmin && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#a3ff20]/15 text-[#a3ff20] border border-[#a3ff20]/30">
                  Admin Control Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Discover Round Table DTU engineers, explore profiles, skills, and projects
            </p>
          </div>
        </div>
      </div>

      {notification.message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs border ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-[#12131b] p-4 rounded-2xl border border-[#202230] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name or skill (e.g. C++, React, Python)..."
            className="w-full bg-[#090a0f] border border-[#202230] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-[#090a0f] border border-[#202230] rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-[#a3ff20]"
          >
            <option value="">All Branches</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Comm</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
          </select>

          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="bg-[#090a0f] border border-[#202230] rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-[#a3ff20]"
          >
            <option value="">All Batches</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#090a0f] border border-[#202230] rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-[#a3ff20]"
          >
            <option value="rating">Sort: Rating</option>
            <option value="potwsCompleted">Sort: POTWs Completed</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <LoadingSpinner text="Searching member directory..." />
      ) : members.length === 0 ? (
        <div className="bg-[#12131b] p-12 text-center rounded-3xl border border-[#202230] text-zinc-400 text-sm">
          No members found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => (
            <div
              key={member._id}
              className="bg-[#12131b] p-5 rounded-2xl border border-[#202230] hover:border-[#a3ff20]/70 transition-all flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Link href={`/members/${member._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#b4a2f8] flex items-center justify-center text-sm font-black text-black flex-shrink-0 shadow-sm">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-[#a3ff20] transition-colors leading-tight truncate">
                        {member.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {member.branch || 'DTU'} • {member.batch || 'Batch'}
                      </p>
                    </div>
                  </Link>

                  {/* Admin Removal Button */}
                  {canRemoveMember(member) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMemberToRemove(member);
                      }}
                      title={`Remove member ${member.name}`}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Link href={`/members/${member._id}`} className="block">
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                    {member.bio || 'Round Table DTU member and software engineering enthusiast.'}
                  </p>

                  {/* Skills badges */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {member.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#1a1b26] text-[#b4a2f8] border border-[#b4a2f8]/20 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 4 && (
                        <span className="text-[10px] text-zinc-500 self-center">
                          +{member.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </div>

              {/* Stats Footer */}
              <Link
                href={`/members/${member._id}`}
                className="pt-3 border-t border-[#202230] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5 text-[#a3ff20] font-black">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{member.rating} pts</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#b4a2f8]" />
                  <span>{member.potwsCompleted} POTWs</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Member Removal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12131b] max-w-md w-full rounded-3xl border border-rose-500/40 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Remove Member Account
                </h3>
                <p className="text-xs text-zinc-400">Round Table DTU Governance Action</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-[#090a0f] p-4 rounded-2xl border border-[#202230]">
              <p className="text-zinc-200">
                Are you sure you want to permanently remove <strong className="text-white">{memberToRemove.name}</strong>?
              </p>
              <div className="text-zinc-400 font-mono text-[11px] space-y-1">
                <div>DTU Email: <span className="text-zinc-300">{memberToRemove.dtuEmail}</span></div>
                {memberToRemove.personalEmail && (
                  <div>Personal: <span className="text-zinc-300">{memberToRemove.personalEmail}</span></div>
                )}
              </div>
              <p className="text-amber-400/90 text-[11px] pt-1 border-t border-[#202230]">
                ⚠️ This will delete their account and allow this student to re-register with these credentials if needed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                disabled={removing}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={removing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{removing ? 'Removing...' : 'Confirm Remove Member'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
