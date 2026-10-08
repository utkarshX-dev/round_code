'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ParticipationHeatmap({ submissions = [], potws = [], activePotw = null }) {
  const router = useRouter();
  const [hoveredCell, setHoveredCell] = useState(null);

  const safePotws = Array.isArray(potws) ? potws : [];
  const safeSubs = Array.isArray(submissions) ? submissions : [];

  // Determine current active week number
  const currentWeekNumber = activePotw?.weekNumber || safePotws.find((p) => p && p.status === 'active')?.weekNumber;

  // Generate 16 weeks of POTW historical slots
  const weeks = Array.from({ length: 16 }, (_, i) => {
    const weekNum = i + 1;
    const potw = safePotws.find((p) => p && p.weekNumber === weekNum);
    const sub = safeSubs.find(
      (s) =>
        s &&
        (s.potwId?.weekNumber === weekNum ||
          s.potwId === potw?._id ||
          s.potwId?._id === potw?._id)
    );

    const isCurrent = Boolean(
      (activePotw && activePotw.weekNumber === weekNum) ||
      (potw && potw.status === 'active') ||
      (currentWeekNumber === weekNum)
    );

    let state = 'none'; // 'none', 'submitted', 'reviewed', 'highscore'
    let score = 0;

    if (sub) {
      if (sub.status === 'reviewed') {
        score = sub.totalScore || 0;
        state = score >= 5 ? 'highscore' : 'reviewed';
      } else {
        state = 'submitted';
      }
    }

    return {
      week: weekNum,
      title: potw?.title || `POTW #${weekNum}`,
      state,
      score,
      sub,
      potw,
      isCurrent,
    };
  });

  const getColorClass = (item) => {
    if (item.isCurrent) {
      return 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.45)] ring-2 ring-orange-500/50 hover:bg-orange-500/30';
    }

    switch (item.state) {
      case 'highscore':
        return 'bg-[#a3ff20] border-[#a3ff20] text-black shadow-sm';
      case 'reviewed':
        return 'bg-[#b4a2f8] border-[#b4a2f8] text-black';
      case 'submitted':
        return 'bg-zinc-200 border-white text-black';
      default:
        return 'bg-[#090a0f] border-[#202230] text-zinc-600 hover:border-zinc-500';
    }
  };

  const handleCellClick = (item) => {
    if (item.isCurrent) {
      router.push('/potw');
    } else if (item.potw?._id) {
      router.push(`/potw/${item.potw._id}`);
    } else {
      router.push('/potw');
    }
  };

  return (
    <div className="bg-[#12131b] p-6 rounded-3xl border border-[#202230] relative space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            POTW Participation Heatmap
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Weekly submission and performance history</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#090a0f] border border-[#202230]" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-200" />
            <span>Submitted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#b4a2f8]" />
            <span>Reviewed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#a3ff20]" />
            <span>High Score (5+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs leading-none">🔥</span>
            <span className="text-orange-400 font-bold">Active Week</span>
          </div>
        </div>
      </div>

      {/* Grid of Weeks */}
      <div className="grid grid-cols-8 sm:grid-cols-16 gap-2 pt-2">
        {weeks.map((item) => (
          <button
            key={item.week}
            type="button"
            onClick={() => handleCellClick(item)}
            onMouseEnter={() => setHoveredCell(item)}
            onMouseLeave={() => setHoveredCell(null)}
            className="flex flex-col items-center gap-1 cursor-pointer group focus:outline-none"
            title={
              item.isCurrent
                ? '🔥 Active Challenge: POTW #' + item.week + ' - Click to Open'
                : item.potw
                ? 'POTW #' + item.week + ' - Click to View'
                : 'Week ' + item.week
            }
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border transition-all duration-200 group-hover:scale-110 flex items-center justify-center text-[10px] font-black ${getColorClass(
                item
              )}`}
            >
              {item.isCurrent ? (
                <span className="text-sm select-none leading-none drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]">
                  🔥
                </span>
              ) : (
                item.week
              )}
            </div>
            <span
              className={`text-[10px] font-mono transition-colors ${
                item.isCurrent ? 'text-orange-400 font-bold' : 'text-zinc-500 group-hover:text-zinc-300'
              }`}
            >
              W{item.week}
            </span>
          </button>
        ))}
      </div>

      {/* Hover Tooltip display */}
      <div className="pt-3 border-t border-[#202230] text-xs min-h-[32px] flex items-center justify-between">
        {hoveredCell ? (
          <div className="flex items-center gap-3 text-zinc-300 flex-wrap">
            <span className={hoveredCell.isCurrent ? 'text-orange-400 font-black' : 'text-[#a3ff20] font-black'}>
              {hoveredCell.isCurrent ? '🔥 POTW #' + hoveredCell.week + ' (Active):' : 'POTW #' + hoveredCell.week + ':'}
            </span>
            <span>{hoveredCell.title}</span>
            <span className="text-zinc-600">•</span>
            {hoveredCell.state === 'none' && <span className="text-zinc-500">No submission recorded</span>}
            {hoveredCell.state === 'submitted' && <span className="text-zinc-200 font-bold">Submitted (Pending Review)</span>}
            {(hoveredCell.state === 'reviewed' || hoveredCell.state === 'highscore') && (
              <span className="text-[#a3ff20] font-bold">Reviewed: {hoveredCell.score}/6.0 points</span>
            )}
            <span
              onClick={() => handleCellClick(hoveredCell)}
              className="text-orange-400 text-[11px] font-bold underline cursor-pointer hover:text-orange-300 ml-2"
            >
              {hoveredCell.isCurrent ? 'Click to solve challenge →' : 'Click to view details →'}
            </span>
          </div>
        ) : (
          <span className="text-zinc-500 italic text-[11px]">Hover or click on any challenge week to inspect or open</span>
        )}
      </div>
    </div>
  );
}
