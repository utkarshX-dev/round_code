'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Trophy, ArrowUpRight } from 'lucide-react';

export default function LeaderboardPage() {
  const [tab, setTab] = useState('all-time'); // 'all-time', 'weekly', 'monthly'
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async (selectedTab) => {
    setLoading(true);
    try {
      let endpoint = '/leaderboard/all-time';
      if (selectedTab === 'weekly') endpoint = '/leaderboard/weekly';
      if (selectedTab === 'monthly') endpoint = '/leaderboard/monthly';

      const res = await api.get(endpoint);
      if (res.success) {
        setData(res.data || []);
        setMeta(res.potw || res.month || null);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(tab);
  }, [tab]);

  const topThree = data.slice(0, 3);
  const remaining = data.slice(3);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-[#a3ff20]" />
            <span>Leaderboard</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Weekly problem performance and audit-verified developer ratings.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1.5 rounded-2xl bg-[#14151e] border border-zinc-800 self-start sm:self-auto text-xs gap-1">
          <button
            onClick={() => setTab('weekly')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              tab === 'weekly'
                ? 'bg-[#a3ff20] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            Weekly POTW
          </button>
          <button
            onClick={() => setTab('monthly')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              tab === 'monthly'
                ? 'bg-[#a3ff20] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTab('all-time')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              tab === 'all-time'
                ? 'bg-[#a3ff20] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Subheader info / meta */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          {tab === 'weekly' && meta && `Weekly Standings for POTW #${meta.weekNumber}: ${meta.title}`}
          {tab === 'monthly' && meta && `Monthly Aggregation: ${meta}`}
          {tab === 'all-time' && 'Overall Historical Ratings & Completed Challenges'}
        </span>
        <span className="hidden sm:inline">Tie-breaker: Completed POTWs → Earlier timestamp</span>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching standings..." />
      ) : data.length === 0 ? (
        <div className="bg-[#14151e] p-12 text-center rounded-2xl border border-zinc-800 text-zinc-400 text-sm">
          No leaderboard data available for this category yet.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {topThree.map((item, index) => {
              const userObj = item.user || item;
              const rank = item.rank;
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
              const podiumBorder =
                rank === 1
                  ? 'border-[#a3ff20] bg-[#14151e] shadow-lg shadow-[#a3ff20]/10'
                  : rank === 2
                  ? 'border-zinc-700 bg-[#14151e]'
                  : 'border-zinc-800 bg-[#14151e]';

              const scoreValue =
                tab === 'all-time'
                  ? `${userObj.rating} pts`
                  : tab === 'weekly'
                  ? `${item.score} / 6.0`
                  : `${item.monthlyScore} pts`;

              return (
                <div
                  key={userObj._id || index}
                  className={`p-6 rounded-3xl border ${podiumBorder} relative flex flex-col justify-between`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{medal}</span>
                    <span className="text-xs font-black text-[#a3ff20] uppercase">
                      RANK #{rank}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-0.5">{userObj.name}</h3>
                    <p className="text-xs text-zinc-400 mb-4">
                      {userObj.branch || 'DTU'} • {userObj.batch || 'Batch'}
                    </p>
                    <div className="p-3.5 rounded-2xl bg-[#0b0c10] border border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">
                        {tab === 'all-time' ? 'Rating' : tab === 'weekly' ? 'POTW Score' : 'Monthly Score'}
                      </span>
                      <span className="text-sm font-black text-[#a3ff20]">
                        {scoreValue}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/members/${userObj._id}`}
                    className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-white hover:text-[#a3ff20] font-bold transition-colors"
                  >
                    <span>View Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#a3ff20]" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Ranks 4+ Table View */}
          {remaining.length > 0 && (
            <div className="bg-[#14151e] rounded-3xl border border-zinc-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Full Standings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b0c10] text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-6">Rank</th>
                      <th className="py-3.5 px-6">Member</th>
                      <th className="py-3.5 px-6">Branch & Batch</th>
                      <th className="py-3.5 px-6 text-right">
                        {tab === 'all-time' ? 'Completed POTWs' : 'Submissions'}
                      </th>
                      <th className="py-3.5 px-6 text-right">Score / Rating</th>
                      <th className="py-3.5 px-6 text-right">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {remaining.map((item) => {
                      const userObj = item.user || item;
                      const scoreValue =
                        tab === 'all-time'
                          ? `${userObj.rating} pts`
                          : tab === 'weekly'
                          ? `${item.score} / 6.0`
                          : `${item.monthlyScore} pts`;

                      return (
                        <tr key={userObj._id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3.5 px-6 font-black text-zinc-400">#{item.rank}</td>
                          <td className="py-3.5 px-6 font-bold text-white">
                            {userObj.name}
                          </td>
                          <td className="py-3.5 px-6 text-zinc-400">
                            {userObj.branch} {userObj.batch ? `(${userObj.batch})` : ''}
                          </td>
                          <td className="py-3.5 px-6 text-right text-zinc-300 font-semibold">
                            {userObj.potwsCompleted || item.potwsSolvedInMonth || 1}
                          </td>
                          <td className="py-3.5 px-6 text-right font-black text-[#a3ff20]">
                            {scoreValue}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <Link
                              href={`/members/${userObj._id}`}
                              className="text-white hover:text-[#a3ff20] font-bold inline-flex items-center gap-1"
                            >
                              Profile <ArrowUpRight className="w-3 h-3 text-[#a3ff20]" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
