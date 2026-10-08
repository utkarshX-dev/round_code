'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Copy, Check, Terminal } from 'lucide-react';

// Dynamic import of Monaco Editor with SSR turned off
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">
      Initializing Monaco Code Editor...
    </div>
  ),
});

export const DEFAULT_SNIPPETS = {
  'C++': '// Paste your cpp solution here\n',
  Java: '// Paste your java solution here\n',
  Python: '# Paste your python solution here\n',
  JavaScript: '// Paste your javascript solution here\n',
  Other: '// Paste your solution here\n',
};

export const isDefaultOrEmptySnippet = (code) => {
  if (!code) return true;
  const trimmed = code.trim();
  if (!trimmed) return true;

  // Check against all current default snippets
  const defaultValues = Object.values(DEFAULT_SNIPPETS).map((s) => s.trim());
  if (defaultValues.includes(trimmed)) return true;

  // Legacy templates and common variations
  const legacyTemplates = [
    '# Paste your python solution here',
    '# Paste your Python solution here',
    '# Write your solution here',
    '// Paste your cpp solution here',
    '// Paste your C++ solution here',
    '// Paste your javascript solution here',
    '// Paste your JavaScript solution here',
    '// Paste your js solution here',
    '// Paste your JS solution here',
    '// Paste your java solution here',
    '// Paste your Java solution here',
    '// Paste your solution here',
    '// Write your solution here',
    `def solution():\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    solution()`.trim(),
    `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    \n    return 0;\n}`.trim(),
    `function solution() {\n    // Write your solution here\n}\n\nsolution();`.trim(),
  ];

  if (legacyTemplates.includes(trimmed)) return true;

  // Check for short single-line placeholder comment
  if (/^(\/\/|#|\/\*)\s*paste your (cpp|c\+\+|javascript|js|python|java|.*) solution here/i.test(trimmed)) {
    return true;
  }
  if (/^(\/\/|#|\/\*)\s*write your solution here/i.test(trimmed)) {
    return true;
  }

  return false;
};

export default function CodeEditor({
  value = '',
  onChange,
  language = 'C++',
  onLanguageChange,
  readOnly = false,
  height = '320px',
}) {
  const [copied, setCopied] = useState(false);

  const getMonacoLang = (lang) => {
    if (lang === 'C++') return 'cpp';
    if (lang === 'Java') return 'java';
    if (lang === 'Python') return 'python';
    if (lang === 'JavaScript') return 'javascript';
    return 'plaintext';
  };

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageSelect = (e) => {
    const newLang = e.target.value;
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }

    if (!onChange) return;

    const newSnippet = DEFAULT_SNIPPETS[newLang] || `// Paste your ${newLang} solution here\n`;

    if (isDefaultOrEmptySnippet(value)) {
      onChange(newSnippet);
    } else {
      const confirmReplace = window.confirm(
        `Do you want to replace your current code with the ${newLang} template? Click Cancel to keep your code.`
      );
      if (confirmReplace) {
        onChange(newSnippet);
      }
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-300">Code Editor</span>
        </div>

        <div className="flex items-center gap-3">
          {onLanguageChange && !readOnly ? (
            <select
              value={language}
              onChange={handleLanguageSelect}
              className="bg-slate-950 border border-slate-700 text-cyan-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {language}
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div style={{ height }}>
        <Editor
          height={height}
          language={getMonacoLang(language)}
          value={value}
          onChange={(val) => onChange && onChange(val || '')}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        />
      </div>
    </div>
  );
}
