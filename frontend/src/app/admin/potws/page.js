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
  Pencil,
} from 'lucide-react';

const INITIAL_PROBLEMS = [
  {
    title: '',
    statement: '',
    link: '',
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
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    weekNumber: '',
    title: '',
    description: '',
    publishAt: '',
    status: 'draft',
    problems: INITIAL_PROBLEMS,
  });

  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/admin/login');
      else if (!isAdmin) router.push('/dashboard');
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchPOTWs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/potws');
      if (res.success) {
        setPotws(res.data || []);
        setFormData((prev) => ({
          ...prev,
          weekNumber: prev.weekNumber || String(
            (res.data || []).reduce((highest, potw) => Math.max(highest, potw.weekNumber || 0), 0) + 1
          ),
        }));
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

  const handleSavePOTW = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        weekNumber: Number(formData.weekNumber),
      };
      const res = editingId
        ? await api.patch(`/potws/${editingId}`, payload)
        : await api.post('/potws', payload);

      if (res.success) {
        setMsg({
          type: 'success',
          text: editingId
            ? `POTW #${formData.weekNumber} updated successfully!`
            : `POTW #${formData.weekNumber} created successfully!`,
        });
        setShowCreateForm(false);
        setEditingId(null);
        await fetchPOTWs();
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
    setDeleting(true);
    try {
      const res = await api.delete(`/potws/${id}`);
      if (res.success) {
        setMsg({ type: 'success', text: 'POTW deleted successfully.' });
        setDeleteTarget(null);
        await fetchPOTWs();
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to delete POTW.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete POTW.' });
    } finally {
      setDeleting(false);
    }
  };

  const handlePublishPOTW = async (potw) => {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.patch(`/potws/${potw._id}`, {
        status: 'active',
        publishAt: new Date().toISOString(),
      });
      if (res.success) {
        setMsg({ type: 'success', text: `POTW #${potw.weekNumber} published successfully.` });
        await fetchPOTWs();
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to publish POTW.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to publish POTW.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleCreateForm = () => {
    if (showCreateForm) {
      setEditingId(null);
    } else {
      const nextWeek = potws.reduce(
        (highest, potw) => Math.max(highest, potw.weekNumber || 0),
        0
      ) + 1;
      setFormData((prev) => ({
        ...prev,
        weekNumber: String(nextWeek),
        status: 'draft',
        publishAt: '',
      }));
    }
    setShowCreateForm((open) => !open);
  };

  const handleEditPOTW = (potw) => {
    setEditingId(potw._id);
    setFormData({
      weekNumber: String(potw.weekNumber),
      title: potw.title || '',
      description: potw.description || '',
      publishAt: potw.publishAt
        ? new Date(potw.publishAt).toISOString().slice(0, 16)
        : '',
      status: potw.status === 'active' ? 'active' : 'draft',
      problems: (potw.problems || []).map((problem) => ({
        ...problem,
        link: problem.link || '',
      })),
    });
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          onClick={toggleCreateForm}
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

      {/* POTW Creation/Edit Form */}
      {showCreateForm && (
        <form onSubmit={handleSavePOTW} className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>
                {editingId
                  ? 'Edit POTW (Exactly 3 Problems Required)'
                  : 'Author New POTW (Exactly 3 Problems Required)'}
              </span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">Total: 6.0 Pts</span>
          </div>

          {/* Schedule metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Week Number (Assigned Automatically)
              </label>
              <input
                type="number"
                readOnly
                min="1"
                value={formData.weekNumber}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-400 font-mono cursor-not-allowed"
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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="draft">Draft (Private — Publish Later)</option>
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

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Problem Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://leetcode.com/problems/..."
                        value={prob.link}
                        onChange={(e) => handleProblemChange(idx, 'link', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
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
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save POTW'}
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
                    {potw.publishAt ? new Date(potw.publishAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3.5 px-6 text-amber-400">
                    {potw.deadline ? new Date(potw.deadline).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3.5 px-6 text-right font-sans">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditPOTW(potw)}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[10px] font-semibold uppercase"
                        title="Edit POTW"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {potw.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => handlePublishPOTW(potw)}
                          disabled={saving}
                          className="text-emerald-400 hover:text-emerald-300 text-[10px] font-semibold uppercase disabled:opacity-50"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(potw)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete POTW"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-2xl border border-rose-500/30 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete POTW?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  This will permanently delete{' '}
                  <strong className="text-slate-200">
                    POTW #{deleteTarget.weekNumber}: {deleteTarget.title}
                  </strong>
                  . This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white glass-panel disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePOTW(deleteTarget._id)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-400 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete POTW'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
