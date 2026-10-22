
"use client";

import { useState } from "react";
import { VibeCheckIcon } from "@/ui/VibeCheckIcon";

const links = [
  { label: "The vibe", href: "/", icon: "✳" },
  { label: "Challenges", href: "#challenges", icon: "⚡" },
  { label: "How to play", href: "#how-it-works", icon: "↗" },
];

export function Navbar() {
  const [active, setActive] = useState("The vibe");

  return (
    <header className="relative z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <nav className="mx-auto max-w-7xl">
        {/* Main brand bar */}
        <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#15141B]/90 px-4 py-3 shadow-[0_12px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:rounded-[28px] sm:px-6 sm:py-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 -top-16 h-32 w-40 rounded-full bg-violet-500/15 blur-3xl"
          />

          {/* Wordmark */}
          <a
            href="/"
            aria-label="VibeCheck home"
            className="group relative flex shrink-0 items-center gap-2.5"
          >
            <VibeCheckIcon size={48} className="flex-shrink-0" />

            <span className="flex flex-col">
              <span className="text-[21px] font-black leading-none tracking-[-1.3px] text-white sm:text-[25px]">
                Vibe<span className="text-[#D0FF72]">Check</span>
                <span className="text-[#B8A0FF]">.</span>
              </span>
              <span className="mt-1.5 hidden text-[9px] font-bold uppercase tracking-[2px] text-white/40 sm:block">
                Your people. Your chaos.
              </span>
            </span>
          </a>

          {/* Brand personality sticker */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-3 py-2 lg:flex">
            <span className="text-[#B8A0FF]">✳</span>
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/65">
              Friendship, under investigation
            </span>
          </div>

          {/* CTA */}
          <a
            href="#challenges"
            className="group relative inline-flex shrink-0 items-center gap-2 rounded-full bg-[#D0FF72] py-2.5 pl-4 pr-2.5 text-[12px] font-black text-[#171910] shadow-[0_3px_0_#789A34] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_0_#789A34] active:translate-y-0.5 active:shadow-none sm:gap-3 sm:py-3 sm:pl-5 sm:pr-3 sm:text-sm"
          >
            <span>LET'S PLAY</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-base transition-transform duration-200 group-hover:rotate-45">
              ↗
            </span>
          </a>
        </div>

        {/* Mobile-first, swipeable navigation */}
        <div className="scrollbar-none -mx-3 flex gap-2 overflow-x-auto px-3 pb-2 pt-4 sm:mx-0 sm:justify-center sm:px-0">
          {links.map((link) => {
            const selected = active === link.label;

            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActive(link.label)}
                aria-current={selected ? "location" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[12px] font-bold transition-all duration-200 sm:text-[13px] ${
                  selected
                    ? "border-[#D0FF72]/30 bg-[#D0FF72]/[0.09] text-[#D0FF72]"
                    : "border-white/[0.08] bg-white/[0.025] text-white/55 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className={selected ? "text-[#B8A0FF]" : ""}>
                  {link.icon}
                </span>
                {link.label}
              </a>
            );
          })}

          <span className="flex shrink-0 items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-white/30 sm:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D0FF72]" />
            Swipe
          </span>
        </div>
      </nav>
    </header>
  );
}
