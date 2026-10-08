'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import CodeEditor from '@/components/code/CodeEditor';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { DifficultyBadge, StatusBadge } from '@/components/common/Badge';
import {
  FileCheck2,
  ExternalLink,
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  User,
  Clock,
  ArrowRight,
  X,
  Send,
} from 'lucide-react';

export default function AdminSubmissionsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reopenModal, setReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  // Review scores & feedback state for the 3 problems
  const [reviews, setReviews] = useState([
    { score: 0, status: 'approved', feedback: '' },
    { score: 0, status: 'approved', feedback: '' },
    { score: 0, status: 'approved', feedback: '' },
  ]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else if (!isAdmin) router.push('/dashboard');
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/submissions/pending');
      if (res.success) {
        setSubmissions(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchSubmissions();
  }, [isAdmin]);

  const openReviewModal = (sub) => {
    setSelectedSub(sub);
    // Initialize reviews state
    setReviews(
      sub.problems.map((p) => ({
        problemId: p.problemId,
        score: p.score || (p.maxScore === 1 ? 1 : p.maxScore === 2 ? 1.5 : 2),
        status: p.status || 'approved',
        feedback: p.feedback || '',
      }))
    );
    setReviewModal(true);
  };

  const handleScoreChange = (idx, score) => {
    setReviews((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], score: Number(score) };
      return next;
    });
  };

  const handleFeedbackChange = (idx, feedback) => {
    setReviews((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], feedback };
      return next;
    });
  };

  const totalCalculatedScore = reviews.reduce((sum, r) => sum + (Number(r.score) || 0), 0);

  const handleSaveReview = async () => {
    if (!selectedSub) return;
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const payload = {
        problemReviews: reviews.map((r, idx) => ({
          problemId: selectedSub.problems[idx].problemId,
          score: Number(r.score),
          status: Number(r.score) > 0 ? 'approved' : 'rejected',
          feedback: r.feedback,
        })),
      };

      const res = await api.patch(`/submissions/${selectedSub._id}/review`, payload);
      if (res.success) {
        setMsg({
          type: 'success',
          text: `Submission evaluated successfully! Score awarded: ${totalCalculatedScore}/6.0.`,
        });
        setReviewModal(false);
        setSelectedSub(null);
        fetchSubmissions();
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to submit review.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to submit review.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReopenSubmission = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSaving(true);
    try {
      const res = await api.patch(`/submissions/${selectedSub._id}/reopen`, {
        reason: reopenReason,
      });
      if (res.success) {
        setMsg({
          type: 'success',
          text: `Submission reopened for ${selectedSub.userId?.name}.`,
        });
        setReopenModal(false);
        setReopenReason('');
        setSelectedSub(null);
        fetchSubmissions();
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to reopen submission.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to reopen submission.' });
    } finally {
      setSaving(false);
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
            <FileCheck2 className="w-7 h-7 text-amber-400" />
            <span>Submission Review Queue</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Evaluate code quality, verify asymptotic complexity, and assign partial points
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

      {/* Submissions List */}
      {loading ? (
        <LoadingSpinner text="Loading pending submissions..." />
      ) : submissions.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm font-mono">
          All caught up! No submissions currently awaiting admin review.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    POTW #{sub.potwId?.weekNumber}
                  </span>
                  <StatusBadge status={sub.status} />
                  <span className="text-xs font-mono text-slate-500">
                    • Submitted {new Date(sub.submittedAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {sub.userId?.name || 'Member'} ({sub.userId?.branch} &apos;{sub.userId?.batch})
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Current Rating: <strong className="text-amber-400">{sub.userId?.rating} pts</strong> • {sub.userId?.dtuEmail}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => openReviewModal(sub)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-1.5 shadow-md shadow-amber-400/20"
                >
                  <Award className="w-4 h-4" />
                  <span>Open Review Studio</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Review Interface Modal (Section 35) */}
      {reviewModal && selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full max-h-[92vh] glass-panel rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div>
                <span className="text-xs font-mono text-cyan-400 block font-bold">
                  POTW #{selectedSub.potwId?.weekNumber} Review Studio
                </span>
                <h3 className="text-base font-bold text-white">
                  Member: {selectedSub.userId?.name} (Current Rating: {selectedSub.userId?.rating} pts)
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 block">Total POTW Score</span>
                  <span className="text-sm font-black text-amber-400">
                    {(Number(totalCalculatedScore) || 0).toFixed(1)} / 6.0
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: The 3 Questions */}
            <div className="p-6 overflow-y-auto space-y-8 divide-y divide-slate-800/80">
              {(selectedSub.problems || []).map((prob, idx) => {
                const potwProb = selectedSub.potwId?.problems?.find(
                  (p) => p._id?.toString() === prob.problemId?.toString()
                );

                const difficulty = prob.maxScore === 1 ? 'Easy' : prob.maxScore === 2 ? 'Medium' : 'Hard';

                return (
                  <div key={prob._id || idx} className={idx > 0 ? 'pt-6 space-y-4' : 'space-y-4'}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                          Q{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {potwProb?.title || `Question ${idx + 1}`}
                        </h4>
                        <DifficultyBadge difficulty={difficulty} />
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-slate-400">Score awarded:</span>
                        <select
                          value={reviews[idx]?.score ?? 0}
                          onChange={(e) => handleScoreChange(idx, e.target.value)}
                          className="bg-slate-950 border border-amber-500/50 text-amber-300 rounded-lg px-2.5 py-1 font-bold focus:outline-none"
                        >
                          {prob.maxScore === 1 && (
                            <>
                              <option value={0}>0.0 / 1.0 (Rejected)</option>
                              <option value={0.5}>0.5 / 1.0 (Partial)</option>
                              <option value={1.0}>1.0 / 1.0 (Full Credit)</option>
                            </>
                          )}
                          {prob.maxScore === 2 && (
                            <>
                              <option value={0}>0.0 / 2.0 (Rejected)</option>
                              <option value={0.5}>0.5 / 2.0 (Partial)</option>
                              <option value={1.0}>1.0 / 2.0 (Partial)</option>
                              <option value={1.5}>1.5 / 2.0 (Partial)</option>
                              <option value={2.0}>2.0 / 2.0 (Full Credit)</option>
                            </>
                          )}
                          {prob.maxScore === 3 && (
                            <>
                              <option value={0}>0.0 / 3.0 (Rejected)</option>
                              <option value={0.5}>0.5 / 3.0 (Partial)</option>
                              <option value={1.0}>1.0 / 3.0 (Partial)</option>
                              <option value={1.5}>1.5 / 3.0 (Partial)</option>
                              <option value={2.0}>2.0 / 3.0 (Partial)</option>
                              <option value={2.5}>2.5 / 3.0 (Partial)</option>
                              <option value={3.0}>3.0 / 3.0 (Full Credit)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Code Display */}
                    <CodeEditor
                      value={prob.code}
                      language={prob.language}
                      readOnly={true}
                      height="200px"
                    />

                    {/* Metadata pill */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Time Complexity</span>
                        <span className="text-slate-200">{prob.timeComplexity}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Space Complexity</span>
                        <span className="text-slate-200">{prob.spaceComplexity}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Platform Link</span>
                        <a
                          href={prob.submissionLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                        >
                          {prob.platform} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Drive Proof</span>
                        <a
                          href={prob.driveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                        >
                          View Evidence <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Feedback textarea */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Feedback / Evaluation Notes
                      </label>
                      <input
                        type="text"
                        value={reviews[idx]?.feedback || ''}
                        onChange={(e) => handleFeedbackChange(idx, e.target.value)}
                        placeholder="e.g. Optimal two-pointer approach, verified screenshot proof."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setReopenModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-950/40 border border-amber-500/30 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen Submission</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white glass-panel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveReview}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Finalize Review ({(Number(totalCalculatedScore) || 0).toFixed(1)}/6.0 pts)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {reopenModal && selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Reopen Member Submission</h3>
            <p className="text-xs text-slate-400">
              Provide an administrative reason for reopening the submission of{' '}
              <strong className="text-slate-200">{selectedSub.userId?.name}</strong>.
            </p>

            <form onSubmit={handleReopenSubmission} className="space-y-4">
              <textarea
                rows={3}
                required
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="e.g. Google Drive link inaccessible, please grant public view permissions and re-submit code."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReopenModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white glass-panel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
                >
                  Confirm Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
