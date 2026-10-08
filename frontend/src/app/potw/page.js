'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import CodeEditor, { DEFAULT_SNIPPETS, isDefaultOrEmptySnippet } from '@/components/code/CodeEditor';
import { DifficultyBadge, StatusBadge } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import RoundTableLogo from '@/components/common/RoundTableLogo';
import {
  Code2,
  Clock,
  CheckCircle2,
  Lock,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
  HelpCircle,
} from 'lucide-react';

const INITIAL_PROBLEM_FORM = {
  language: 'C++',
  code: DEFAULT_SNIPPETS['C++'],
  timeComplexity: '',
  spaceComplexity: '',
  platform: 'LeetCode',
  submissionLink: '',
  driveLink: '',
};

export default function POTWPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activePotw, setActivePotw] = useState(null);
  const [allPotws, setAllPotws] = useState([]);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state for all 3 problems
  const [formData, setFormData] = useState([
    { ...INITIAL_PROBLEM_FORM },
    { ...INITIAL_PROBLEM_FORM },
    { ...INITIAL_PROBLEM_FORM },
  ]);

  const [activeTab, setActiveTab] = useState(0); // 0 = Easy, 1 = Medium, 2 = Hard
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const [currentRes, potwsRes, mySubsRes] = await Promise.all([
        api.get('/potws/current').catch(() => ({ data: null })),
        api.get('/potws').catch(() => ({ data: [] })),
        api.get('/submissions/my').catch(() => ({ data: [] })),
      ]);

      if (currentRes?.success && currentRes.data) {
        setActivePotw(currentRes.data);

        // Check if member already has a submission for active POTW
        const activeSub = Array.isArray(mySubsRes?.data)
          ? mySubsRes.data.find(
              (s) => s?.potwId?._id === currentRes.data._id || s?.potwId === currentRes.data._id
            )
          : null;

        if (activeSub) {
          setExistingSubmission(activeSub);
        }
      }

      if (potwsRes?.success && potwsRes.data) {
        setAllPotws(Array.isArray(potwsRes.data) ? potwsRes.data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleProblemChange = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const isProblemCompleted = (p) => {
    return (
      Boolean(p?.code?.trim()) &&
      !isDefaultOrEmptySnippet(p.code) &&
      Boolean(p?.timeComplexity?.trim()) &&
      Boolean(p?.submissionLink?.trim()) &&
      Boolean(p?.driveLink?.trim())
    );
  };

  // Calculate filled problems progress
  const completedCount = formData.filter(isProblemCompleted).length;

  const isDeadlinePassed = activePotw && new Date() >= new Date(activePotw.deadline);

  const handleSubmit = async () => {
    setError('');
    setShowConfirmModal(false);

    if (!activePotw) return;

    if (isDeadlinePassed) {
      setError('The deadline for this POTW has passed. Submissions are closed.');
      return;
    }

    if (completedCount < 3) {
      setError('You must complete all 3 problems before submitting the challenge.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        potwId: activePotw._id,
        problems: activePotw.problems.map((p, idx) => ({
          problemId: p._id,
          language: formData[idx].language,
          code: formData[idx].code,
          timeComplexity: formData[idx].timeComplexity,
          spaceComplexity: formData[idx].spaceComplexity,
          platform: formData[idx].platform,
          submissionLink: formData[idx].submissionLink,
          driveLink: formData[idx].driveLink,
        })),
      };

      const res = await api.post('/submissions', payload);
      if (res.success) {
        setSuccessMsg('POTW submitted successfully! Your submission is now locked for review.');
        setExistingSubmission(res.data);
      } else {
        setError(res.message || 'Submission failed.');
      }
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading Problem of the Week..." />;
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202230]">
        <div className="flex items-center gap-3.5">
          <RoundTableLogo size={46} className="rounded-2xl" showGlow={true} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Problem of the Week (POTW)
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Weekly 3-question challenge • Easy (1pt), Medium (2pt), Hard (3pt)
            </p>
          </div>
        </div>

        {activePotw && (
          <div className="flex items-center gap-2 text-xs bg-[#12131b] border border-[#202230] px-4 py-2.5 rounded-2xl text-zinc-300">
            <Clock className="w-4 h-4 text-[#a3ff20]" />
            <span>Deadline: {new Date(activePotw.deadline).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active POTW Section */}
      {activePotw ? (
        <div className="space-y-6">
          {/* POTW Summary Bar */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-bold">
                    POTW #{activePotw.weekNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Max 6.0 Points</span>
                </div>
                <h2 className="text-xl font-bold text-white">{activePotw.title}</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {activePotw.description}
                </p>
              </div>

              {/* Progress counter */}
              {!existingSubmission && (
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-center min-w-[180px]">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Solving Progress</span>
                  <div className="text-xl font-black font-mono text-cyan-400">
                    {completedCount} / 3 Completed
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-300"
                      style={{ width: `${(completedCount / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* If already submitted: Locked Review State */}
          {existingSubmission ? (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Submission Locked for Evaluation</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Submitted on {new Date(existingSubmission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <StatusBadge status={existingSubmission.status} />
              </div>

              {/* Submitted Problems Review Cards */}
              <div className="space-y-6">
                {activePotw.problems.map((prob, idx) => {
                  const subItem = existingSubmission.problems?.find(
                    (p) => p.problemId === prob._id || p.problemId?.toString() === prob._id?.toString()
                  );

                  return (
                    <div
                      key={prob._id || idx}
                      className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                            Q{idx + 1}
                          </span>
                          <h4 className="text-sm font-semibold text-white">{prob.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <DifficultyBadge difficulty={prob.difficulty} />
                          {existingSubmission.status === 'reviewed' && (
                            <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                              Score: {subItem?.score || 0} / {prob.maxScore}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Problem Statement details */}
                      <p className="text-xs text-slate-400 leading-relaxed">{prob.statement}</p>

                      {/* Code submitted */}
                      {subItem && (
                        <div className="space-y-3">
                          <CodeEditor
                            value={subItem.code}
                            language={subItem.language}
                            readOnly={true}
                            height="240px"
                          />

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                            <div>
                              <span className="text-slate-500 block text-[10px]">Time Complexity</span>
                              <span className="text-slate-300">{subItem.timeComplexity}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px]">Space Complexity</span>
                              <span className="text-slate-300">{subItem.spaceComplexity}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px]">Platform</span>
                              <a
                                href={subItem.submissionLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                              >
                                {subItem.platform} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px]">Drive Proof</span>
                              <a
                                href={subItem.driveLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                              >
                                View Proof <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          {subItem.feedback && (
                            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs">
                              <span className="text-cyan-400 font-semibold block mb-1">Admin Feedback:</span>
                              <p className="text-slate-300">{subItem.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Submission Form: Tabs for 3 Questions */
            <div className="bg-[#12131b] p-6 sm:p-8 rounded-3xl border border-[#202230] space-y-6">
              {/* Question Navigation Tabs */}
              <div className="flex flex-wrap p-1.5 bg-[#090a0f] border border-[#202230] rounded-2xl gap-2">
                {activePotw.problems.map((p, idx) => {
                  const isFilled = isProblemCompleted(formData[idx]);

                  return (
                    <button
                      key={p._id || idx}
                      type="button"
                      onClick={() => setActiveTab(idx)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        activeTab === idx
                          ? 'bg-[#a3ff20] text-black shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      <span>Q{idx + 1}: {p.difficulty}</span>
                      {isFilled && <span className="text-black font-black text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Current Problem View & Code Input */}
              {activePotw.problems[activeTab] && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[#090a0f] border border-[#202230]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white uppercase">
                          {activePotw.problems[activeTab].title}
                        </h3>
                        <DifficultyBadge difficulty={activePotw.problems[activeTab].difficulty} />
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {activePotw.problems[activeTab].statement}
                      </p>
                    </div>
                  </div>

                  {/* Constraints & Expected Complexity */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-4 rounded-2xl bg-[#090a0f] border border-[#202230]">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Constraints</span>
                      <span className="text-zinc-300">
                        {activePotw.problems[activeTab].constraints || 'Standard DSA constraints'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Expected Time Complexity</span>
                      <span className="text-[#a3ff20] font-bold">
                        {activePotw.problems[activeTab].expectedTimeComplexity || 'O(n)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Expected Space Complexity</span>
                      <span className="text-[#b4a2f8] font-bold">
                        {activePotw.problems[activeTab].expectedSpaceComplexity || 'O(1)'}
                      </span>
                    </div>
                  </div>

                  {/* Monaco Code Editor */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                      Source Code Submission (Select Language & Paste Implementation)
                    </label>
                    <CodeEditor
                      value={formData[activeTab].code}
                      onChange={(code) => handleProblemChange(activeTab, 'code', code)}
                      language={formData[activeTab].language}
                      onLanguageChange={(lang) => handleProblemChange(activeTab, 'language', lang)}
                      height="320px"
                    />
                  </div>

                  {/* Complexity & Links Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Time Complexity *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. O(n log n)"
                        value={formData[activeTab].timeComplexity}
                        onChange={(e) => handleProblemChange(activeTab, 'timeComplexity', e.target.value)}
                        className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Space Complexity *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. O(n) or O(1)"
                        value={formData[activeTab].spaceComplexity}
                        onChange={(e) => handleProblemChange(activeTab, 'spaceComplexity', e.target.value)}
                        className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Coding Platform
                      </label>
                      <select
                        value={formData[activeTab].platform}
                        onChange={(e) => handleProblemChange(activeTab, 'platform', e.target.value)}
                        className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#a3ff20] transition-colors"
                      >
                        <option value="LeetCode">LeetCode</option>
                        <option value="Codeforces">Codeforces</option>
                        <option value="CodeChef">CodeChef</option>
                        <option value="GeeksforGeeks">GeeksforGeeks</option>
                        <option value="HackerRank">HackerRank</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        External Submission Link *
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://leetcode.com/submissions/detail/..."
                        value={formData[activeTab].submissionLink}
                        onChange={(e) => handleProblemChange(activeTab, 'submissionLink', e.target.value)}
                        className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Google Drive Proof Link (Screenshots / Verification) *
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://drive.google.com/file/d/..."
                        value={formData[activeTab].driveLink}
                        onChange={(e) => handleProblemChange(activeTab, 'driveLink', e.target.value)}
                        className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#a3ff20] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Tab Navigation buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-[#202230]">
                    <button
                      type="button"
                      disabled={activeTab === 0}
                      onClick={() => setActiveTab(activeTab - 1)}
                      className="btn-tactile-dark disabled:opacity-40"
                    >
                      ← Previous Question
                    </button>

                    {activeTab < 2 ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab(activeTab + 1)}
                        className="btn-tactile-outline"
                      >
                        Next Question →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={completedCount < 3 || isDeadlinePassed}
                        className="btn-tactile-lime flex items-center gap-2 disabled:opacity-40"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Entire POTW (3/3)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#12131b] p-8 text-center rounded-3xl border border-[#202230] text-zinc-400 text-sm">
          No active POTW at this moment. Stay tuned for next week&apos;s challenge.
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#12131b] p-6 sm:p-8 rounded-3xl border border-[#202230] shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-white uppercase">Confirm Final POTW Submission?</h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                As per Round Table DTU rules, <strong className="text-[#a3ff20]">you cannot edit or overwrite your code, complexities, or links after submitting</strong>. The submission will be permanently locked for evaluation.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090a0f] border border-[#202230] text-xs text-zinc-400 space-y-1">
              <p>• Question 1 (Easy): Ready</p>
              <p>• Question 2 (Medium): Ready</p>
              <p>• Question 3 (Hard): Ready</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 btn-tactile-dark"
              >
                Review Code
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 btn-tactile-lime"
              >
                {submitting ? 'Submitting...' : 'Yes, Lock & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical POTWs Archive */}
      <div className="space-y-4 pt-6 border-t border-[#202230]">
        <h3 className="text-lg font-black text-white uppercase tracking-tight">POTW Challenge Archive</h3>
        <p className="text-xs text-zinc-400">Inspect past challenges, statements, and solutions.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(allPotws || []).map((potw) => (
            <Link
              key={potw._id}
              href={`/potw/${potw._id}`}
              className="p-5 rounded-2xl bg-[#12131b] border border-[#202230] hover:border-[#a3ff20] transition-all block group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#a3ff20]">
                  POTW #{potw.weekNumber}
                </span>
                <StatusBadge status={potw.status} />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#a3ff20] transition-colors mb-1">{potw.title}</h4>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {potw.description}
              </p>
              <div className="mt-4 pt-3 border-t border-[#202230] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Deadline: {potw.deadline ? new Date(potw.deadline).toLocaleDateString() : 'N/A'}</span>
                <span className="text-[#a3ff20] font-sans font-bold">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
