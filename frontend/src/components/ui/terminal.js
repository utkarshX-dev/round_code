'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, RotateCcw, Copy, Check, Sparkles } from 'lucide-react';

/**
 * Terminal Component
 * 
 * Simulates a realistic interactive developer CLI terminal with:
 * - Line-by-line typing animation for commands
 * - Sequential output stream rendering
 * - Blinking cursor
 * - Window controls (red/yellow/green)
 * - Replay / restart button
 * - Copy commands button
 */
export function Terminal({
  commands = [
    "roundtable welcome --name \"Member\"",
    "roundtable check --potw",
    "roundtable arena --status",
    "roundtable leaderboard --rank",
  ],
  outputs = {
    0: ["✔ Welcome to Round Table, Member!"],
    1: ["✔ Active Challenge: Weekly POTW loaded & ready to solve."],
    2: ["✔ Compiler sandbox online: C++, Python, Java, JavaScript."],
    3: ["★ DTU Leaderboard active • Code, collaborate, and conquer! ★"],
  },
  typingSpeed = 38,
  delayBetweenCommands = 850,
  title = "roundtable@dtu:~ (zsh)",
  className = "",
  autoStart = true,
}) {
  // Current step state
  // currentCmdIndex: index of command currently being typed
  // currentTypedText: text typed so far for currentCmdIndex
  // completedHistory: array of { cmd: string, output: string[] }
  const [currentCmdIndex, setCurrentCmdIndex] = useState(0);
  const [currentTypedText, setCurrentTypedText] = useState('');
  const [completedHistory, setCompletedHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef(null);

  // Restart terminal animation
  const handleRestart = () => {
    setCompletedHistory([]);
    setCurrentCmdIndex(0);
    setCurrentTypedText('');
    setIsFinished(false);
    setIsTyping(true);
  };

  // Copy full log
  const handleCopy = () => {
    const textToCopy = commands
      .map((cmd, idx) => {
        const out = outputs[idx] ? outputs[idx].join('\n') : '';
        return `$ ${cmd}\n${out}`;
      })
      .join('\n\n');
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!autoStart) return;
    setIsTyping(true);
  }, [autoStart]);

  useEffect(() => {
    if (!isTyping || currentCmdIndex >= commands.length) {
      if (currentCmdIndex >= commands.length) {
        setIsFinished(true);
        setIsTyping(false);
      }
      return;
    }

    const targetCmd = commands[currentCmdIndex] || '';

    // If current command is not fully typed yet
    if (currentTypedText.length < targetCmd.length) {
      const timer = setTimeout(() => {
        setCurrentTypedText(targetCmd.slice(0, currentTypedText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timer);
    }

    // Once fully typed, wait delayBetweenCommands then commit command + its outputs to history
    const transitionTimer = setTimeout(() => {
      const cmdOutputs = outputs[currentCmdIndex] || [];
      setCompletedHistory((prev) => [
        ...prev,
        {
          command: targetCmd,
          outputs: cmdOutputs,
        },
      ]);
      setCurrentTypedText('');
      setCurrentCmdIndex((prev) => prev + 1);
    }, delayBetweenCommands);

    return () => clearTimeout(transitionTimer);
  }, [isTyping, currentCmdIndex, currentTypedText, commands, outputs, typingSpeed, delayBetweenCommands]);

  // Scroll to bottom when output updates
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentTypedText, completedHistory]);

  const renderOutputLine = (line, idx) => {
    const isSuccess = line.startsWith('✔') || line.startsWith('✓');
    const isSpecial = line.startsWith('★') || line.startsWith('➜');
    const isWarning = line.toLowerCase().includes('warn') || line.startsWith('!');

    let colorClass = 'text-zinc-300';
    if (isSuccess) colorClass = 'text-[#a3ff20] font-medium';
    else if (isSpecial) colorClass = 'text-[#b4a2f8] font-bold tracking-wide';
    else if (isWarning) colorClass = 'text-amber-400';

    return (
      <div key={idx} className={`leading-relaxed text-xs sm:text-[13px] ${colorClass} pl-4 sm:pl-5`}>
        {line}
      </div>
    );
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl bg-[#090a10] border border-[#202230] shadow-2xl overflow-hidden font-mono flex flex-col ${className}`}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#10121a] border-b border-[#202230] select-none">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 cursor-pointer hover:opacity-80 transition-opacity" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 cursor-pointer hover:opacity-80 transition-opacity" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 cursor-pointer hover:opacity-80 transition-opacity" />
          <span className="ml-2 hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            <TerminalIcon className="w-3.5 h-3.5 text-[#a3ff20]" />
            {title}
          </span>
        </div>

        {/* Title center on mobile */}
        <div className="sm:hidden text-[11px] font-bold text-zinc-400 tracking-wider flex items-center gap-1">
          <TerminalIcon className="w-3 h-3 text-[#a3ff20]" />
          RT CLI
        </div>

        {/* Action icons (Restart, Copy) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestart}
            title="Replay terminal animation"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a1c29] transition-colors flex items-center gap-1 text-[11px]"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isTyping ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline text-[10px] uppercase font-bold tracking-wider">Replay</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy command history"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a1c29] transition-colors flex items-center gap-1 text-[11px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#a3ff20]" />
                <span className="text-[10px] text-[#a3ff20] font-bold tracking-wider">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[10px] uppercase font-bold tracking-wider">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Screen Body */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-3.5 min-h-[220px] max-h-[380px] overflow-y-auto text-left scrollbar-thin scrollbar-thumb-zinc-700">
        {/* Welcome Header in Terminal */}
        <div className="text-[11px] text-zinc-500 pb-2 border-b border-zinc-800/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Sparkles className="w-3 h-3 text-[#a3ff20]" />
            Round Table Terminal System • v2.4.0 (DTU Node)
          </span>
          <span className="text-zinc-600 hidden sm:inline">Type &apos;help&apos; for commands</span>
        </div>

        {/* Completed Commands & Outputs */}
        {completedHistory.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            {/* Command Line */}
            <div className="flex items-center gap-2 text-xs sm:text-[13px]">
              <span className="text-[#a3ff20] font-black select-none">❯</span>
              <span className="text-zinc-500 select-none hidden sm:inline">roundtable@dtu:~$</span>
              <span className="text-white font-semibold">{item.command}</span>
            </div>

            {/* Outputs */}
            {item.outputs && item.outputs.length > 0 && (
              <div className="space-y-1 py-0.5">
                {item.outputs.map((outLine, lineIdx) => renderOutputLine(outLine, lineIdx))}
              </div>
            )}
          </div>
        ))}

        {/* Currently Typing Command */}
        {currentCmdIndex < commands.length && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs sm:text-[13px]">
              <span className="text-[#a3ff20] font-black select-none">❯</span>
              <span className="text-zinc-500 select-none hidden sm:inline">roundtable@dtu:~$</span>
              <span className="text-white font-semibold">
                {currentTypedText}
                <span className="inline-block w-2 h-4 bg-[#a3ff20] ml-1 translate-y-0.5 animate-pulse" />
              </span>
            </div>
          </div>
        )}

        {/* Finished Indicator */}
        {isFinished && (
          <div className="pt-2 flex items-center gap-2 text-xs sm:text-[13px] text-zinc-500">
            <span className="text-[#a3ff20] font-black select-none">❯</span>
            <span className="text-zinc-600 select-none hidden sm:inline">roundtable@dtu:~$</span>
            <span className="text-zinc-500 italic">Session ready. All systems nominal.</span>
            <span className="inline-block w-2 h-4 bg-[#a3ff20]/60 ml-0.5 translate-y-0.5 animate-pulse" />
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="px-4 py-2 bg-[#0c0e15] border-t border-[#202230] flex items-center justify-between text-[11px] text-zinc-500 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#a3ff20] animate-ping" />
            <span className="text-zinc-400 font-bold">ONLINE</span>
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-400">DTU Round Table Arena</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-[10px] bg-[#1a1c29] px-2 py-0.5 rounded text-zinc-300 font-mono border border-zinc-800">
            UTF-8
          </span>
          <span className="text-[10px] bg-[#1a1c29] px-2 py-0.5 rounded text-[#a3ff20] font-mono border border-[#a3ff20]/20">
            POTW #2026
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * TerminalDemo Component
 * Provided specifically as requested, ready to render or customize.
 */
export function TerminalDemo({
  userName = "Engineer",
  commands,
  outputs,
  typingSpeed = 45,
  delayBetweenCommands = 1000,
}) {
  const defaultCommands = [
    `roundtable welcome --name "${userName}"`,
    "roundtable check --potw",
    "roundtable arena --status",
    "roundtable leaderboard --rank",
  ];

  const defaultOutputs = {
    0: [`✔ Welcome to Round Table, ${userName}!`],
    1: ["✔ Active Challenge: Weekly POTW loaded & ready to solve."],
    2: ["✔ Compiler sandboxes: C++, Python 3, Java, JavaScript."],
    3: ["★ DTU Leaderboard active • Code, collaborate, and conquer! ★"],
  };

  return (
    <section className="w-full py-4 md:py-6">
      <Terminal
        commands={commands || defaultCommands}
        outputs={outputs || defaultOutputs}
        typingSpeed={typingSpeed}
        delayBetweenCommands={delayBetweenCommands}
        title="roundtable@dtu: ~ (welcome-session)"
      />
    </section>
  );
}

export default Terminal;
