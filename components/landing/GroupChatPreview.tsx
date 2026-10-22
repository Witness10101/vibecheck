
"use client";

import { useEffect, useRef, useState } from "react";

const messages = [
  {
    id: 1,
    name: "riya",
    avatar: "😎",
    color: "#B8A0FF",
    text: "who made me the group therapist 😭",
    side: "left",
  },
  {
    id: 2,
    name: "aarav",
    avatar: "🤡",
    color: "#FF78CB",
    text: "THE QUIZ SAID YOU'RE THE DRAMA 💀",
    side: "right",
  },
  {
    id: 3,
    name: "you",
    avatar: "👀",
    color: "#D0FF72",
    text: "delete this immediately.",
    side: "left",
  },
] as const;

export function GroupChatPreview() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [showVerdict, setShowVerdict] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [run, setRun] = useState(0);
  const replayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    messages.forEach((message, index) => {
      if (index < visibleMessages) return;

      timers.push(
        setTimeout(() => {
          setVisibleMessages((current) => Math.max(current, index + 1));
        }, 650 + (index - visibleMessages) * 900)
      );
    });

    if (!showVerdict) {
      timers.push(
        setTimeout(() => {
          setShowVerdict(true);
          setPlaying(false);
        }, 650 + (messages.length - visibleMessages) * 900 + 450)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [playing, visibleMessages, showVerdict, run]);

  useEffect(() => {
    return () => {
      if (replayTimer.current) clearTimeout(replayTimer.current);
    };
  }, []);

  function replay() {
    if (replayTimer.current) clearTimeout(replayTimer.current);

    setPlaying(false);
    setVisibleMessages(0);
    setShowVerdict(false);
    setRun((current) => current + 1);

    replayTimer.current = setTimeout(() => {
      setPlaying(true);
    }, 50);
  }

  return (
    <section
      id="group-chat"
      className="relative mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-8 sm:py-24 lg:py-32"
    >
      <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* Editorial intro */}
        <div className="relative min-w-0">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[#FF78CB]/25 bg-[#FF78CB]/[0.06] px-3 py-2">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#FF78CB]" />
            <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#FF78CB] sm:text-[10px] sm:tracking-[0.18em]">
              Things are getting personal
            </span>
          </div>

          <h2 className="text-[clamp(2.65rem,12vw,6.5rem)] font-black leading-[0.86] tracking-[-0.075em]">
            THE GROUP
            <br />
            CHAT WON&apos;T
            <br />
            <span className="text-[#D0FF72]">SURVIVE</span>
            <br />
            THIS<span className="text-[#B8A0FF]">.</span>
          </h2>

          <p className="mt-6 max-w-md text-sm leading-6 text-white/55 sm:mt-7 sm:text-lg sm:leading-7">
            One quiz. Three exposed friends. Approximately zero chance
            anyone lets this go.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-bold text-white/65 sm:px-4 sm:text-xs">
              💀 Receipts included
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-bold text-white/65 sm:px-4 sm:text-xs">
              👀 Denial guaranteed
            </span>
          </div>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={replay}
              className="group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#D0FF72] px-6 py-4 text-sm font-black text-[#11130B] transition hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(208,255,114,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              REPLAY THE CHAOS
              <span className="text-lg transition-transform group-hover:rotate-[-35deg]">
                ↻
              </span>
            </button>

            <span className="text-center text-xs text-white/35 sm:text-left">
              Watch what happens 👀
            </span>
          </div>
        </div>

        {/* Chat preview */}
        <div className="relative mx-auto w-full min-w-0 max-w-[490px] px-1 sm:px-0">
          <div className="absolute inset-8 rounded-[40px] bg-violet-500/20 blur-[75px]" />

          <div className="group-chat-shell relative w-full min-w-0 overflow-hidden rounded-[24px] border border-white/15 bg-[#121118]/95 shadow-[0_25px_70px_rgba(0,0,0,0.45)] sm:rotate-[1.5deg] sm:rounded-[30px]">
            {/* Chat header */}
            <div className="flex min-w-0 items-center gap-2.5 border-b border-white/10 bg-white/[0.025] p-4 sm:gap-3 sm:p-6">
              <div className="flex shrink-0 -space-x-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#121118] bg-[#B8A0FF] text-base sm:h-10 sm:w-10 sm:text-lg">
                  😎
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#121118] bg-[#FF78CB] text-base sm:h-10 sm:w-10 sm:text-lg">
                  🤡
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#121118] bg-[#D0FF72] text-base sm:h-10 sm:w-10 sm:text-lg">
                  👀
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-black sm:text-sm">
                  the chaos committee 💀
                </p>
                <p className="mt-1 text-[9px] font-bold text-white/40 sm:text-[10px]">
                  4 MEMBERS · NO PEACE
                </p>
              </div>

              <span className="hidden shrink-0 rounded-full border border-[#D0FF72]/20 bg-[#D0FF72]/[0.07] px-2.5 py-1.5 text-[9px] font-black tracking-wider text-[#D0FF72] xs:inline-flex">
                GROUP CHAT
              </span>
            </div>

            {/* Conversation */}
            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
              <div className="text-center">
                <span className="rounded-full bg-white/[0.05] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white/35">
                  Today · 11:47 PM
                </span>
              </div>

              <div className="flex justify-center">
                <div className="max-w-full rounded-2xl border border-violet-300/15 bg-violet-300/[0.07] px-3 py-3 text-center sm:px-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-violet-200">
                    VIBECHECK ALERT
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/70">
                    The friendship audit has arrived. 🚨
                  </p>
                </div>
              </div>

              {messages.slice(0, visibleMessages).map((message) => (
                <div
                  key={message.id}
                  className={`flex min-w-0 items-end gap-2 ${
                    message.side === "right" ? "flex-row-reverse" : ""
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{ backgroundColor: `${message.color}25` }}
                  >
                    {message.avatar}
                  </span>

                  <div
                    className={`min-w-0 max-w-[85%] rounded-2xl border px-3 py-3 sm:max-w-[82%] sm:px-4 ${
                      message.side === "right"
                        ? "rounded-br-sm border-[#FF78CB]/15 bg-[#FF78CB]/[0.09]"
                        : "rounded-bl-sm border-white/[0.07] bg-white/[0.045]"
                    }`}
                  >
                    <p
                      className="mb-1 text-[10px] font-black"
                      style={{ color: message.color }}
                    >
                      {message.name}
                    </p>
                    <p className="break-words text-[12px] leading-5 text-white/85 sm:text-sm">
                      {message.text}
                    </p>
                  </div>
                </div>
              ))}

              {visibleMessages < messages.length && playing && (
                <div className="flex items-center gap-2" aria-label="Typing">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-sm">
                    💬
                  </span>
                  <div className="flex gap-1 rounded-full bg-white/[0.06] px-4 py-3">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="typing-dot h-1.5 w-1.5 rounded-full bg-white/55"
                        style={{ animationDelay: `${dot * 180}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showVerdict && (
                <div className="verdict-reveal overflow-hidden rounded-2xl border border-[#D0FF72]/25 bg-[#D0FF72] p-3.5 text-[#11130B] sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em]">
                      VIBECHECK VERDICT
                    </p>
                    <span className="text-lg">✳</span>
                  </div>

                  <p className="mt-2 text-lg font-black leading-tight tracking-tight sm:text-2xl">
                    Friendship status:
                    <br />
                    IT&apos;S COMPLICATED.
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/10 pt-3">
                    <span className="text-[9px] font-bold text-black/55 sm:text-[10px]">
                      3 votes. 0 allegations denied.
                    </span>
                    <span className="shrink-0 text-sm">💀</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mock input */}
            <div className="border-t border-white/10 bg-white/[0.02] p-3 sm:p-4">
              <div className="flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3 py-3 sm:px-4">
                <span className="min-w-0 flex-1 truncate text-xs text-white/30">
                  type your defense...
                </span>
                <span className="shrink-0 text-lg text-[#D0FF72]">➤</span>
              </div>

              <p className="mt-3 text-center text-[8px] font-bold uppercase tracking-[0.1em] text-white/25 sm:text-[9px] sm:tracking-[0.13em]">
                A DEMO CHAT · FRIENDSHIP DRAMA NOT INCLUDED
              </p>
            </div>
          </div>

          {/* Desktop-only stickers */}
          <div className="absolute -left-8 top-[28%] z-10 hidden -rotate-12 rounded-xl bg-[#B8A0FF] px-3 py-2 text-[10px] font-black text-[#171322] shadow-xl sm:block">
            RECEIPTS 📸
          </div>

          <div className="absolute -right-7 bottom-[20%] z-10 hidden rotate-6 rounded-full border border-[#FF78CB]/25 bg-[#241522] px-3 py-2 text-[10px] font-black text-[#FF78CB] shadow-xl sm:block">
            CAUGHT IN 4K 💀
          </div>
        </div>
      </div>
    </section>
  );
}
