'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import CodeEditor from '@/components/code/CodeEditor';
import { DifficultyBadge, StatusBadge } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  ArrowLeft,
  Lock,
  ExternalLink,
} from 'lucide-react';

export default function SinglePOTWPage() {
  const params = useParams();
  const potwId = params.id;
  const { user } = useAuth();
  const router = useRouter();

  const [potw, setPotw] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPOTW() {
      try {
        const [potwRes, mySubsRes] = await Promise.all([
          api.get(`/potws/${potwId}`),
          api.get('/submissions/my').catch(() => ({ data: [] })),
        ]);

        if (potwRes.success && potwRes.data) {
          setPotw(potwRes.data);
          const userSub = mySubsRes.data?.find(
            (s) => s.potwId?._id === potwId || s.potwId === potwId
          );
          if (userSub) {
            setSubmission(userSub);
          }
        } else {
          setError(potwRes.message || 'POTW not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load POTW.');
      } finally {
        setLoading(false);
      }
    }

    if (potwId) {
      loadPOTW();
    }
  }, [potwId]);

  if (loading) {
    return <LoadingSpinner text="Loading POTW details..." />;
  }

  if (error || !potw) {
    return (
      <div className="p-8 text-center bg-[#12131b] rounded-3xl border border-[#202230] max-w-md mx-auto mt-12">
        <p className="text-sm text-rose-400 mb-4">{error || 'POTW not found.'}</p>
        <Link href="/potw" className="btn-tactile-lime">
          Back to Challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202230]">
        <div>
          <Link
            href="/potw"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Challenges</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              POTW #{potw.weekNumber}: {potw.title}
            </h1>
            <StatusBadge status={potw.status} />
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">{potw.description}</p>
        </div>

        <div className="text-right text-xs text-zinc-400 bg-[#12131b] border border-[#202230] p-3.5 rounded-2xl">
          <p>Publish: {potw.publishAt ? new Date(potw.publishAt).toLocaleDateString() : 'N/A'}</p>
          <p className="text-[#a3ff20] font-bold">Deadline: {potw.deadline ? new Date(potw.deadline).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      {/* Submission status banner if submitted */}
      {submission && (
        <div className="p-5 rounded-3xl bg-[#12131b] border border-[#a3ff20]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#a3ff20]/15 border border-[#a3ff20]/30 flex items-center justify-center text-[#a3ff20] flex-shrink-0">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase">Your Submission is on Record</p>
              <p className="text-[11px] text-zinc-400">
                Status: <span className="text-[#a3ff20] font-bold">{submission.status?.toUpperCase() || 'SUBMITTED'}</span> • Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Record'}
              </p>
            </div>
          </div>
          {submission.status === 'reviewed' && (
            <div className="text-right">
              <span className="text-sm font-black text-[#a3ff20]">
                Score: {submission.totalScore} / 6.0
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3 Problems detailed cards */}
      <div className="space-y-6">
        {(potw.problems || []).map((prob, idx) => {
          const subItem = Array.isArray(submission?.problems)
            ? submission.problems.find(
                (p) => p.problemId === prob._id || p.problemId?.toString() === prob._id?.toString()
              )
            : null;

          return (
            <div
              key={prob._id || idx}
              className="bg-[#12131b] p-6 sm:p-8 rounded-3xl border border-[#202230] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-[#090a0f] flex items-center justify-center text-xs font-black text-[#a3ff20]">
                    Q{idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white uppercase">{prob.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={prob.difficulty} />
                  {subItem && submission.status === 'reviewed' && (
                    <span className="text-xs font-black text-[#a3ff20] px-2.5 py-0.5 rounded-full bg-[#12131b] border border-[#a3ff20]/30">
                      Score: {subItem.score} / {prob.maxScore}
                    </span>
                  )}
                </div>
              </div>

              {/* Statement & constraints */}
              <p className="text-xs text-zinc-400 leading-relaxed">{prob.statement}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#090a0f] border border-[#202230] text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Constraints</span>
                  <span className="text-zinc-300">{prob.constraints || 'Standard DSA constraints'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Expected Time Complexity</span>
                  <span className="text-[#a3ff20] font-bold">{prob.expectedTimeComplexity || 'O(n)'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Expected Space Complexity</span>
                  <span className="text-[#b4a2f8] font-bold">{prob.expectedSpaceComplexity || 'O(1)'}</span>
                </div>
              </div>

              {/* If member submitted, show their code and proof */}
              {subItem && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Your Submitted Solution ({subItem.language}):
                  </span>
                  <CodeEditor
                    value={subItem.code}
                    language={subItem.language}
                    readOnly={true}
                    height="220px"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 rounded-2xl bg-[#090a0f] border border-[#202230]">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Time Complexity</span>
                      <span className="text-zinc-300">{subItem.timeComplexity}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Space Complexity</span>
                      <span className="text-zinc-300">{subItem.spaceComplexity}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Platform</span>
                      <a
                        href={subItem.submissionLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#a3ff20] hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        {subItem.platform} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Drive Proof</span>
                      <a
                        href={subItem.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#a3ff20] hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        Evidence <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {subItem.feedback && (
                    <div className="p-3.5 rounded-2xl bg-[#1e192e] border border-[#b4a2f8]/30 text-xs">
                      <span className="text-[#b4a2f8] font-bold uppercase block mb-1">Lead Reviewer Feedback:</span>
                      <p className="text-zinc-300">{subItem.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
