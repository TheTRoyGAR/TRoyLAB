'use client';

import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isPending?: boolean;
}

// ── Simple markdown renderer ─────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  const inlineFormat = (line: string): React.ReactNode => {
    // Bold + italic combinations, then each separately, then code
    const parts = line.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, pi) => {
      if (part.startsWith('***') && part.endsWith('***')) {
        return <strong key={pi}><em>{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pi}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={pi}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={pi}
            className="px-1 py-0.5 rounded text-xs font-mono"
            style={{ background: 'rgba(0,180,216,0.15)', color: '#00B4D8' }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  while (i < lines.length) {
    const line = lines[i];

    // H2: ## heading
    if (/^## (.+)/.test(line)) {
      nodes.push(
        <h2
          key={key++}
          className="text-base font-bold mt-4 mb-1"
          style={{ color: '#0A1628' }}
        >
          {inlineFormat(line.replace(/^## /, ''))}
        </h2>,
      );
      i++;
      continue;
    }

    // H3: ### heading
    if (/^### (.+)/.test(line)) {
      nodes.push(
        <h3
          key={key++}
          className="text-sm font-semibold mt-3 mb-1"
          style={{ color: '#00B4D8' }}
        >
          {inlineFormat(line.replace(/^### /, ''))}
        </h3>,
      );
      i++;
      continue;
    }

    // H1: # heading
    if (/^# (.+)/.test(line)) {
      nodes.push(
        <h1
          key={key++}
          className="text-lg font-bold mt-4 mb-2"
          style={{ color: '#0A1628' }}
        >
          {inlineFormat(line.replace(/^# /, ''))}
        </h1>,
      );
      i++;
      continue;
    }

    // Bullet list item
    if (/^[-*] (.+)/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*] (.+)/.test(lines[i])) {
        items.push(
          <li key={i} className="ml-1">
            {inlineFormat(lines[i].replace(/^[-*] /, ''))}
          </li>,
        );
        i++;
      }
      nodes.push(
        <ul key={key++} className="list-disc list-inside space-y-0.5 my-1 text-sm">
          {items}
        </ul>,
      );
      continue;
    }

    // Numbered list
    if (/^\d+\. (.+)/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. (.+)/.test(lines[i])) {
        items.push(
          <li key={i} className="ml-1">
            {inlineFormat(lines[i].replace(/^\d+\. /, ''))}
          </li>,
        );
        i++;
      }
      nodes.push(
        <ol key={key++} className="list-decimal list-inside space-y-0.5 my-1 text-sm">
          {items}
        </ol>,
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={key++} className="my-3 border-black/10" />);
      i++;
      continue;
    }

    // Empty line → paragraph break
    if (line.trim() === '') {
      nodes.push(<div key={key++} className="h-2" />);
      i++;
      continue;
    }

    // Regular paragraph text
    nodes.push(
      <p key={key++} className="text-sm leading-relaxed">
        {inlineFormat(line)}
      </p>,
    );
    i++;
  }

  return nodes;
}

// ── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #00B4D8, #0096B5)' }}
      >
        AI
      </div>
      {/* Skeleton lines */}
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 rounded animate-pulse" style={{ background: '#e2e8f0', width: '75%' }} />
        <div className="h-3 rounded animate-pulse" style={{ background: '#e2e8f0', width: '60%' }} />
        <div className="h-3 rounded animate-pulse" style={{ background: '#e2e8f0', width: '80%' }} />
      </div>
    </div>
  );
}

// ── Format timestamp ─────────────────────────────────────────────────────────
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── ChatMessage component ────────────────────────────────────────────────────
export default function ChatMessage({ message }: { message: Message }) {
  if (message.isPending) {
    return (
      <div className="px-4 py-3">
        <LoadingSkeleton />
      </div>
    );
  }

  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[80%] flex flex-col items-end gap-1">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-white leading-relaxed"
            style={{ background: 'linear-gradient(135deg, #00B4D8, #0096B5)' }}
          >
            {message.content}
          </div>
          <span className="text-[10px] text-black/40 pr-1">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      {/* TRoyGO™ AI Avatar */}
      <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #00B4D8, #0096B5)' }}
        >
          AI
        </div>
        <span
          className="text-[8px] font-bold tracking-tight whitespace-nowrap"
          style={{ color: '#00B4D8' }}
        >
          TRoyGO™
        </span>
      </div>

      {/* Bubble */}
      <div className="flex-1 max-w-[88%] flex flex-col gap-1">
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0,180,216,0.15)',
            color: '#0A1628',
          }}
        >
          <div className="space-y-0.5">{renderMarkdown(message.content)}</div>
        </div>
        <span className="text-[10px] text-black/40 pl-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
