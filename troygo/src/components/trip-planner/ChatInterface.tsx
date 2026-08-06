'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from 'react';
import { Send, Mic, Paperclip, Map } from 'lucide-react';
import ChatMessage, { type Message } from './ChatMessage';
import ItineraryPanel, { parseItineraryFromText, type ParsedItinerary } from './ItineraryPanel';
import type { TripDetails } from './TripSetupForm';

// ── Constants ────────────────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  'Add a day trip',
  'Find cheaper options',
  'Recommend restaurants',
  'Book activities',
];

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #00B4D8, #0096B5)' }}
      >
        AI
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{ background: '#fff', border: '1px solid rgba(0,180,216,0.15)' }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full inline-block"
            style={{
              background: '#00B4D8',
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── ChatInterface ────────────────────────────────────────────────────────────
interface ChatInterfaceProps {
  tripDetails: TripDetails;
  initialMessage: string;
}

export default function ChatInterface({ tripDetails, initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [itinerary, setItinerary] = useState<ParsedItinerary>({ days: [] });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialized = useRef(false);
  const idCounter = useRef(0);

  const nextId = () => `msg-${++idCounter.current}`;

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, []);

  // ── Send message with streaming ───────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string, isInitial = false) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      // Add user message (skip for "hidden" initial trigger)
      const history: Array<{ role: string; content: string }> = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      if (!isInitial) {
        const userMsg: Message = {
          id: nextId(),
          role: 'user',
          content: trimmed,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        history.push({ role: 'user', content: trimmed });
      }

      setIsStreaming(true);

      // Create placeholder AI message
      const aiId = nextId();
      const aiMsg: Message = {
        id: aiId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isPending: true,
      };
      setMessages((prev) => [...prev, aiMsg]);

      try {
        abortRef.current = new AbortController();

        const payload = {
          message: isInitial ? trimmed : trimmed,
          history: isInitial ? [] : history.slice(0, -1), // exclude just-added user msg
          tripDetails: isInitial ? tripDetails : undefined,
        };

        // For non-initial messages include full history up to (not including) latest user msg
        const sendPayload = {
          message: trimmed,
          history: isInitial
            ? []
            : messages.map((m) => ({ role: m.role, content: m.content })),
          ...(isInitial ? { tripDetails } : {}),
        };

        const response = await fetch('/api/ai-planner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sendPayload),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          // Update the AI message content in real-time
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? { ...m, content: accumulated, isPending: false }
                : m,
            ),
          );
        }

        // Parse itinerary from accumulated response
        const parsed = parseItineraryFromText(accumulated);
        if (parsed.days.length > 0) {
          setItinerary(parsed);
          // Auto-open panel when itinerary arrives
          setIsPanelOpen(true);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? {
                  ...m,
                  content:
                    'I encountered an error connecting to the AI. Please check your connection and try again.',
                  isPending: false,
                }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, tripDetails],
  );

  // ── Initialize with trip context on mount ─────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    sendMessage(initialMessage, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handle send ───────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!inputValue.trim() || isStreaming) return;
    const text = inputValue;
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    if (isStreaming) return;
    sendMessage(suggestion);
  };

  // ── Voice input — same tap-to-toggle continuous-recognition pattern
  // proven on the dashboard/order-page mic (see reference_voice_dictation_pattern) ──
  const [isRecording, setIsRecording] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const recordingRef = useRef(false);
  const toggleModeRef = useRef(false);
  const isPressedRef = useRef(false);
  const pressStartRef = useRef(0);
  const baseValueRef = useRef('');
  const inputValueRef = useRef('');
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const createRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const r = new SpeechRecognition();
    r.continuous = true;
    r.interimResults = false;
    r.lang = 'en-AU';

    r.addEventListener('result', (e: any) => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      const base = baseValueRef.current;
      const prefix = base && !base.endsWith(' ') ? base + ' ' : base;
      setInputValue(prefix + transcript);
    });

    r.addEventListener('error', (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') stopRecording();
    });

    r.addEventListener('end', () => {
      if (recordingRef.current) {
        baseValueRef.current = inputValueRef.current;
        const next = createRecognition();
        recognitionRef.current = next;
        next?.start();
      }
    });

    return r;
  }, []);

  const startRecording = useCallback(() => {
    if (recordingRef.current) return;
    recordingRef.current = true;
    setIsRecording(true);
    baseValueRef.current = inputValue;
    const r = createRecognition();
    recognitionRef.current = r;
    r?.start();
  }, [createRecognition, inputValue]);

  const stopRecording = useCallback(() => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    toggleModeRef.current = false;
    setIsRecording(false);
    recognitionRef.current?.stop();
  }, []);

  const MIC_TAP_THRESHOLD_MS = 300;

  const handleMicPressStart = () => {
    if (isPressedRef.current) return;
    isPressedRef.current = true;

    if (recordingRef.current && toggleModeRef.current) {
      stopRecording();
      return;
    }
    if (recordingRef.current) return;

    pressStartRef.current = Date.now();
    startRecording();
  };

  const handleMicPressEnd = () => {
    if (!isPressedRef.current) return;
    isPressedRef.current = false;

    if (!recordingRef.current || toggleModeRef.current) return;

    if (Date.now() - pressStartRef.current < MIC_TAP_THRESHOLD_MS) {
      toggleModeRef.current = true; // quick tap — keep recording until tapped again
    } else {
      stopRecording(); // genuine hold — stop on release
    }
  };

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{ background: '#f0f4f8' }}
      >
        {/* ── LEFT: Chat Area ──────────────────────────────────────────────── */}
        <div
          className="flex flex-col flex-1 min-w-0 transition-all duration-300"
          style={{ marginRight: isPanelOpen ? 420 : 0 }}
        >
          {/* Chat header */}
          <div
            className="flex items-center justify-between px-5 py-3 flex-shrink-0 z-10"
            style={{
              background: 'linear-gradient(135deg, #0A1628, #152D55)',
              borderBottom: '2px solid rgba(255,215,0,0.4)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #00B4D8, #0096B5)' }}
              >
                AI
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">TRoyGO™ AI Trip Planner</h1>
                <p className="text-white/50 text-[10px]">
                  {isStreaming ? (
                    <span style={{ color: '#00B4D8' }}>● Thinking…</span>
                  ) : (
                    'Online · Powered by Claude AI'
                  )}
                </p>
              </div>
            </div>

            {/* Itinerary panel toggle (mobile) */}
            <button
              onClick={() => setIsPanelOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{
                background: isPanelOpen
                  ? 'rgba(0,180,216,0.3)'
                  : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(0,180,216,0.4)',
              }}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Itinerary</span>
              {itinerary.days.length > 0 && (
                <span
                  className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: '#FFD700', color: '#0A1628' }}
                >
                  {itinerary.days.length}
                </span>
              )}
            </button>
          </div>

          {/* Trip context banner */}
          <div
            className="px-5 py-2 flex items-center gap-2 flex-shrink-0 text-xs"
            style={{ background: 'rgba(0,180,216,0.08)', borderBottom: '1px solid rgba(0,180,216,0.15)' }}
          >
            <span style={{ color: '#00B4D8' }}>✈</span>
            <span className="text-gray-600">
              <strong style={{ color: '#0A1628' }}>
                {tripDetails.destinations.join(' → ')}
              </strong>
              {tripDetails.departureDate && ` · ${new Date(tripDetails.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
              {tripDetails.returnDate && ` – ${new Date(tripDetails.returnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
              {` · ${tripDetails.adults + tripDetails.children} traveler${tripDetails.adults + tripDetails.children > 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-3 space-y-1">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isStreaming && messages[messages.length - 1]?.isPending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input area ──────────────────────────────────────────────────── */}
          <div
            className="flex-shrink-0 px-4 pb-4 pt-3"
            style={{ background: '#f0f4f8', borderTop: '1px solid rgba(0,0,0,0.06)' }}
          >
            {/* Quick suggestion chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleQuickSuggestion(s)}
                  disabled={isStreaming}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80 disabled:opacity-40"
                  style={{
                    background: '#fff',
                    color: '#0A1628',
                    border: '1.5px solid rgba(0,180,216,0.35)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input box */}
            <div
              className="flex items-end gap-2 rounded-2xl px-4 py-3"
              style={{
                background: '#fff',
                border: '1.5px solid rgba(0,180,216,0.25)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* Attach */}
              <button
                type="button"
                onClick={() => setNoticeMessage("Attaching files isn't built yet — describe what you need in the chat instead.")}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-gray-100"
                style={{ color: '#9ca3af' }}
                aria-label="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  resizeTextarea();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your trip…"
                rows={1}
                disabled={isStreaming}
                className="flex-1 resize-none outline-none text-sm leading-relaxed bg-transparent"
                style={{
                  color: '#0A1628',
                  minHeight: 24,
                  maxHeight: 140,
                  overflowY: 'auto',
                }}
              />

              {/* Voice — hold to record, or tap once and tap again to stop */}
              <button
                type="button"
                onMouseDown={handleMicPressStart}
                onMouseUp={handleMicPressEnd}
                onMouseLeave={handleMicPressEnd}
                onTouchStart={(e) => { e.preventDefault(); handleMicPressStart(); }}
                onTouchEnd={handleMicPressEnd}
                onTouchCancel={handleMicPressEnd}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-gray-100"
                style={isRecording ? { color: '#fff', background: '#ef4444' } : { color: '#9ca3af' }}
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputValue.trim() || isStreaming}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #00B4D8, #0096B5)',
                  color: '#fff',
                }}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-2">
              TRoyGO™ AI · Powered by Claude · Responses may vary · Always verify travel info
            </p>
          </div>
        </div>

        {/* ── RIGHT: Itinerary Panel ───────────────────────────────────────── */}
        <ItineraryPanel
          itinerary={itinerary}
          tripDetails={tripDetails}
          isOpen={isPanelOpen}
          onToggle={() => setIsPanelOpen((v) => !v)}
          onClose={() => setIsPanelOpen(false)}
        />
      </div>

      {/* Lightweight notice for not-yet-built actions */}
      {noticeMessage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <p className="text-sm text-gray-600 mb-5">{noticeMessage}</p>
            <button
              onClick={() => setNoticeMessage(null)}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: '#0A1628' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
