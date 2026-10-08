'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { DifficultyBadge, StatusBadge } from '@/components/common/Badge';
import {
  CalendarPlus,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

const INITIAL_PROBLEMS = [
  {
    title: '',
    statement: '',
    difficulty: 'easy',
    maxScore: 1,
    constraints: '1 <= n <= 10^5',
    expectedTimeComplexity: 'O(n)',
    expectedSpaceComplexity: 'O(1)',
  },
  {
    title: '',
    statement: '',
    difficulty: 'medium',
    maxScore: 2,
    constraints: '1 <= n <= 10^5, 1 <= m <= 10^5',
    expectedTimeComplexity: 'O(n log n)',
    expectedSpaceComplexity: 'O(n)',
  },
  {
    title: '',
    statement: '',
    difficulty: 'hard',
    maxScore: 3,
    constraints: '1 <= n <= 2000, 1 <= k <= 1000',
    expectedTimeComplexity: 'O(n^2)',
    expectedSpaceComplexity: 'O(n)',
  },
];

export default function AdminPOTWManagementPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [potws, setPotws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    weekNumber: '',
    title: '',
    description: '',
    publishAt: '',
    deadline: '',
    status: 'draft',
    problems: INITIAL_PROBLEMS,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else if (!isAdmin) router.push('/dashboard');
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchPOTWs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/potws');
      if (res.success) {
        setPotws(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchPOTWs();
  }, [isAdmin]);

  const handleProblemChange = (index, field, value) => {
    setFormData((prev) => {
      const nextProblems = [...prev.problems];
      nextProblems[index] = { ...nextProblems[index], [field]: value };
      return { ...prev, problems: nextProblems };
    });
  };

  const handleCreatePOTW = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      // Validate dates
      if (new Date(formData.deadline) <= new Date(formData.publishAt)) {
        setMsg({ type: 'error', text: 'Deadline must be later than the publish date.' });
        setSaving(false);
        return;
      }

      const res = await api.post('/potws', {
        ...formData,
        weekNumber: Number(formData.weekNumber),
      });

      if (res.success) {
        setMsg({ type: 'success', text: `POTW #${formData.weekNumber} created successfully!` });
        setShowCreateForm(false);
        fetchPOTWs();
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to create POTW.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to create POTW.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePOTW = async (id) => {
    if (!confirm('Are you sure you want to delete this POTW?')) return;
    try {
      const res = await api.delete(`/potws/${id}`);
      if (res.success) {
        setMsg({ type: 'success', text: 'POTW deleted successfully.' });
        fetchPOTWs();
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to delete POTW.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete POTW.' });
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
            <CalendarPlus className="w-7 h-7 text-cyan-400" />
            <span>Manage Weekly POTWs</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Author 3-problem weekly challenges, set schedules, and publish to members
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{showCreateForm ? 'Cancel Creation' : 'Create New POTW'}</span>
        </button>
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

      {/* POTW Creation Form (Section 84) */}
      {showCreateForm && (
        <form onSubmit={handleCreatePOTW} className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Author New POTW (Exactly 3 Problems Required)</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">Total: 6.0 Pts</span>
          </div>

          {/* Schedule metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Week Number *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 13"
                value={formData.weekNumber}
                onChange={(e) => setFormData({ ...formData, weekNumber: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">POTW Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dynamic Programming & Segment Trees"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={2}
                placeholder="Brief summary of topics covered in this week's problem set..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                Publish Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.publishAt}
                onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                Submission Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="draft">Draft (Private)</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active (Live Immediately)</option>
              </select>
            </div>
          </div>

          {/* The 3 Problems (Section 84) */}
          <div className="space-y-6 pt-4 border-t border-slate-800">
            {formData.problems.map((prob, idx) => {
              const diffTitle = idx === 0 ? 'Problem 1: Easy (1.0 Pt)' : idx === 1 ? 'Problem 2: Medium (2.0 Pts)' : 'Problem 3: Hard (3.0 Pts)';

              return (
                <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{diffTitle}</h4>
                    <DifficultyBadge difficulty={prob.difficulty} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Question Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Longest Increasing Subsequence"
                        value={prob.title}
                        onChange={(e) => handleProblemChange(idx, 'title', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Problem Statement *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Full problem description and examples..."
                        value={prob.statement}
                        onChange={(e) => handleProblemChange(idx, 'statement', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                        Constraints
                      </label>
                      <input
                        type="text"
                        value={prob.constraints}
                        onChange={(e) => handleProblemChange(idx, 'constraints', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                        Expected Time Complexity
                      </label>
                      <input
                        type="text"
                        value={prob.expectedTimeComplexity}
                        onChange={(e) => handleProblemChange(idx, 'expectedTimeComplexity', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white glass-panel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-md shadow-cyan-500/20"
            >
              {saving ? 'Creating...' : 'Save & Publish POTW'}
            </button>
          </div>
        </form>
      )}

      {/* Existing POTWs Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">All Weekly POTW Problem Sets</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-6">Week</th>
                <th className="py-3 px-6 font-sans">Title</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Publish Date</th>
                <th className="py-3 px-6">Deadline</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {potws.map((potw) => (
                <tr key={potw._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-cyan-400">#{potw.weekNumber}</td>
                  <td className="py-3.5 px-6 font-sans font-semibold text-white">
                    {potw.title}
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={potw.status} />
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">
                    {new Date(potw.publishAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-6 text-amber-400">
                    {new Date(potw.deadline).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-6 text-right font-sans">
                    <button
                      type="button"
                      onClick={() => handleDeletePOTW(potw._id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete POTW"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
