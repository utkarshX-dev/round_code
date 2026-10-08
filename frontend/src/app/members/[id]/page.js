'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/Badge';
import {
  ExternalLink,
  FolderGit2,
  Globe,
  ArrowLeft,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id;
  const { user, isAdmin } = useAuth();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, rating, projects, potws
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const canRemoveMember = () => {
    if (!user || (!isAdmin && user.role !== 'admin' && user.role !== 'super_admin')) return false;
    if (user._id === memberId || user.id === memberId) return false;
    if (member?.role === 'super_admin') return false;
    if (user.role === 'admin' && member?.role === 'admin') return false;
    return true;
  };

  const handleConfirmDelete = async () => {
    setRemoving(true);
    setDeleteError('');
    try {
      const res = await api.delete(`/admin/members/${memberId}`);
      if (res.success) {
        router.push('/members');
      } else {
        setDeleteError(res.message || 'Failed to remove member.');
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to remove member.');
    } finally {
      setRemoving(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get(`/users/${memberId}`);
        if (res.success && res.data) {
          setMember(res.data);
        } else {
          setError(res.message || 'Member profile not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }

    if (memberId) {
      loadProfile();
    }
  }, [memberId]);

  if (loading) {
    return <LoadingSpinner text="Loading member profile..." />;
  }

  if (error || !member) {
    return (
      <div className="p-8 text-center bg-[#14151e] rounded-2xl border border-zinc-800 max-w-lg mx-auto mt-12">
        <p className="text-sm text-rose-400 mb-4">{error || 'Member not found.'}</p>
        <Link href="/members" className="text-xs text-[#a3ff20] hover:underline font-bold">
          ← Back to Member Directory
        </Link>
      </div>
    );
  }

  // Prepare chart data from real rating history
  const chartData = (member.ratingHistory || []).map((h, i) => ({
    name: h.potwId ? `POTW #${h.potwId.weekNumber}` : `Adj #${i + 1}`,
    rating: h.newRating,
    change: h.ratingChange,
    reason: h.reason,
  }));

  if (chartData.length > 0) {
    chartData.unshift({
      name: 'Start',
      rating: 0,
      change: 0,
      reason: 'Account Activation',
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Member Directory</span>
        </Link>

        {canRemoveMember() && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Member</span>
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-[#14151e] p-6 sm:p-8 rounded-3xl border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#b4a2f8] flex items-center justify-center text-3xl font-black text-black shadow-md flex-shrink-0">
              {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">{member.name}</h1>
              <p className="text-xs text-zinc-400 mt-1">
                {member.branch || 'Delhi Technological University'} {member.batch ? `• Batch ${member.batch}` : ''}
              </p>
              {member.dtuEmail && (
                <p className="text-xs text-[#a3ff20] font-semibold mt-1">{member.dtuEmail}</p>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="p-3.5 rounded-2xl bg-[#0b0c10] border border-zinc-800 text-center min-w-[90px]">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Rating</span>
              <span className="text-xl font-black text-[#a3ff20]">
                {member.rating}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0b0c10] border border-zinc-800 text-center min-w-[90px]">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">POTWs</span>
              <span className="text-xl font-black text-white">
                {member.potwsCompleted}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0b0c10] border border-zinc-800 text-center min-w-[90px]">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Rank</span>
              <span className="text-xl font-black text-[#b4a2f8]">
                #{member.rank || '-'}
              </span>
            </div>
          </div>
        </div>

        {member.bio && (
          <p className="text-xs text-zinc-300 mt-6 leading-relaxed max-w-3xl pt-4 border-t border-zinc-800">
            {member.bio}
          </p>
        )}
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex flex-wrap p-1.5 bg-[#14151e] border border-zinc-800 rounded-2xl gap-1.5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#a3ff20] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          Overview & Skills
        </button>
        <button
          onClick={() => setActiveTab('rating')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rating'
              ? 'bg-[#a3ff20] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          Rating History ({member.ratingHistory?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'projects'
              ? 'bg-[#a3ff20] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          Projects ({member.projects?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('potws')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'potws'
              ? 'bg-[#a3ff20] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          POTW History ({member.submissions?.length || 0})
        </button>
      </div>

      {/* Tab: Overview & Skills */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Skills Section */}
          <div className="bg-[#14151e] p-6 sm:p-8 rounded-2xl border border-zinc-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Technical Skills & Expertise
            </h3>
            {member.skills && member.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1f202c] text-[#b4a2f8] border border-[#b4a2f8]/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No skills added yet.</p>
            )}
          </div>

          {/* Coding Platform Profiles */}
          <div className="bg-[#14151e] p-6 sm:p-8 rounded-2xl border border-zinc-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Coding & Professional Profiles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'LeetCode', val: member.codingProfiles?.leetcode },
                { name: 'Codeforces', val: member.codingProfiles?.codeforces },
                { name: 'CodeChef', val: member.codingProfiles?.codechef },
                { name: 'GitHub', val: member.codingProfiles?.github },
                { name: 'LinkedIn', val: member.codingProfiles?.linkedin },
                { name: 'Portfolio', val: member.codingProfiles?.portfolio },
              ]
                .filter((p) => p.val)
                .map((p, idx) => (
                  <a
                    key={idx}
                    href={p.val}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl bg-[#0b0c10] border border-zinc-800 hover:border-[#a3ff20] flex items-center justify-between text-xs text-zinc-200 transition-colors"
                  >
                    <span className="font-bold">{p.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#a3ff20]" />
                  </a>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Rating Progression Graph */}
      {activeTab === 'rating' && (
        <div className="bg-[#14151e] p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Rating Progression</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Rating gained through weekly POTW evaluations
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-[#a3ff20]">
                ★ {member.rating} pts
              </span>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232534" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#14151e',
                      borderColor: '#232534',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#ffffff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#a3ff20"
                    strokeWidth={3}
                    dot={{ fill: '#b4a2f8', r: 4 }}
                    activeDot={{ r: 6, fill: '#a3ff20' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-500">
              Rating graph will populate after the member completes their first weekly challenge.
            </div>
          )}

          {/* Rating History Records */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Rating Audit Log
            </h4>
            <div className="divide-y divide-zinc-800/80">
              {(member.ratingHistory || []).map((hist) => (
                <div key={hist._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-200 font-semibold">{hist.reason}</span>
                    <span className="text-zinc-500 text-[10px] block">
                      {new Date(hist.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black ${
                        hist.ratingChange > 0
                          ? 'text-[#a3ff20]'
                          : hist.ratingChange < 0
                          ? 'text-rose-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {hist.ratingChange > 0 ? `+${hist.ratingChange}` : hist.ratingChange}
                    </span>
                    <span className="text-zinc-400 block text-[11px]">→ {hist.newRating} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {member.projects && member.projects.length > 0 ? (
            member.projects.map((proj, idx) => (
              <div key={idx} className="bg-[#14151e] p-5 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase">{proj.name}</h4>
                  <div className="flex items-center gap-2">
                    {proj.githubLink && (
                      <a
                        href={proj.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-zinc-400 hover:text-white p-1"
                      >
                        <FolderGit2 className="w-4 h-4" />
                      </a>
                    )}
                    {proj.liveLink && (
                      <a
                        href={proj.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#a3ff20] hover:text-[#b8ff3d] p-1"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{proj.description}</p>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#1f202c] text-[#b4a2f8] border border-[#b4a2f8]/20 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-zinc-500 bg-[#14151e] rounded-2xl border border-zinc-800">
              No projects added to this profile yet.
            </div>
          )}
        </div>
      )}

      {/* Tab: POTW History */}
      {activeTab === 'potws' && (
        <div className="space-y-4">
          {member.submissions && member.submissions.length > 0 ? (
            member.submissions.map((sub) => (
              <div
                key={sub._id}
                className="bg-[#14151e] p-5 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#a3ff20]">
                      POTW #{sub.potwId?.weekNumber}
                    </span>
                    <StatusBadge status={sub.status} />
                  </div>
                  <h4 className="text-sm font-bold text-white">{sub.potwId?.title}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Total Score</span>
                    <span className="text-base font-black text-white">
                      {sub.totalScore} / 6.0
                    </span>
                  </div>
                  <Link
                    href={`/potw/${sub.potwId?._id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#a3ff20] hover:bg-[#b8ff3d] transition-all"
                  >
                    View Challenge
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-zinc-500 bg-[#14151e] rounded-2xl border border-zinc-800">
              No POTW submissions found on record.
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Member Removal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12131b] max-w-md w-full rounded-3xl border border-rose-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Remove Member Account
                </h3>
                <p className="text-xs text-zinc-400">Administrative Governance Action</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-[#090a0f] p-4 rounded-2xl border border-[#202230]">
              <p className="text-zinc-200">
                Are you sure you want to permanently remove <strong className="text-white">{member.name}</strong>?
              </p>
              <div className="text-zinc-400 font-mono text-[11px] space-y-1">
                <div>DTU Email: <span className="text-zinc-300">{member.dtuEmail}</span></div>
                {member.personalEmail && (
                  <div>Personal: <span className="text-zinc-300">{member.personalEmail}</span></div>
                )}
              </div>
              <p className="text-amber-400/90 text-[11px] pt-1 border-t border-[#202230]">
                ⚠️ This will delete their account and allow this student to re-register with these credentials if needed.
              </p>
            </div>

            {deleteError && (
              <p className="text-xs text-rose-400 font-semibold">{deleteError}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={removing}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
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
