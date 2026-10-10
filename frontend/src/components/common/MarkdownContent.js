'use client';

import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function MarkdownContent({ content, className = '' }) {
  const html = DOMPurify.sanitize(marked.parse(content || ''));

  return (
    <div
      className={`markdown-content text-sm leading-6 text-zinc-300 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
