import React from 'react';

export function DifficultyBadge({ difficulty }) {
  const d = (difficulty || '').toLowerCase();

  if (d === 'easy') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#a3ff20]/15 text-[#a3ff20] border border-[#a3ff20]/40">
        <span className="w-1.5 h-1.5 rounded-full bg-[#a3ff20]" />
        Easy • 1 pt
      </span>
    );
  }

  if (d === 'medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Medium • 2 pts
      </span>
    );
  }

  if (d === 'hard') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        Hard • 3 pts
      </span>
    );
  }

  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-300 border border-zinc-700">
      {difficulty}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();

  const styles = {
    submitted: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    under_review: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    reviewed: 'bg-[#a3ff20]/15 text-[#a3ff20] border-[#a3ff20]/40',
    approved: 'bg-[#a3ff20]/15 text-[#a3ff20] border-[#a3ff20]/40',
    rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    active: 'bg-[#a3ff20]/15 text-[#a3ff20] border-[#a3ff20]/40',
    closed: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    draft: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    scheduled: 'bg-[#b4a2f8]/15 text-[#b4a2f8] border-[#b4a2f8]/40',
  }[s] || 'bg-zinc-800 text-zinc-300 border-zinc-700';

  const label = s.replace('_', ' ').toUpperCase();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles}`}>
      {label}
    </span>
  );
}

export function RoleBadge({ role }) {
  if (role === 'super_admin') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-[#1e192e] text-[#b4a2f8] border border-[#b4a2f8]/40">
        👑 Super Admin
      </span>
    );
  }
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-[#152311] text-[#a3ff20] border border-[#a3ff20]/40">
        🛡️ Admin
      </span>
    );
  }
  return null;
}
