
import Link from "next/link";
import { VibeCheckIcon } from "@/ui/VibeCheckIcon";


function ResultPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[410px] pb-5 pt-8 sm:pt-10">
      {/* Ambient glow */}
      <div className="absolute inset-x-[12%] top-[12%] h-[70%] rounded-full bg-violet-600/20 blur-[80px]" />

      {/* Top-left reaction sticker */}
      <div className="absolute left-0 top-8 z-30 -rotate-12 rounded-2xl border border-white/10 bg-[#B8A0FF] px-3 py-2.5 text-xs font-black text-[#171322] shadow-[0_12px_35px_rgba(184,160,255,0.2)] sm:-left-7">
        BE SO FOR REAL 💀
      </div>

      {/* Floating status badge */}
      <div className="absolute right-0 top-0 z-30 rotate-6 rounded-2xl border border-black/10 bg-[#D0FF72] px-3 py-2.5 text-[#171910] shadow-[0_12px_35px_rgba(208,255,114,0.15)] sm:-right-4">
        <p className="text-[9px] font-black uppercase tracking-wider">
          Friendship status
        </p>
        <p className="mt-0.5 text-sm font-black">It's complicated.</p>
      </div>

      {/* Main personality reveal */}
      <div className="relative isolate overflow-hidden rounded-[30px] border border-white/15 bg-[#121118] shadow-[0_35px_100px_rgba(0,0,0,0.55)]">
        {/* Color fields */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/20 blur-[65px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#D0FF72]/10 blur-[65px]" />

        {/* Decorative graphic */}
        <div className="pointer-events-none absolute right-[-25px] top-[100px] rotate-12 select-none text-[150px] font-black leading-none text-white/[0.035] sm:text-[180px]">
          ✳
        </div>

        <div className="relative p-5 sm:p-7">
          {/* Brand and result number */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <VibeCheckIcon size={31} />
              <div>
                <p className="text-sm font-black tracking-tight">
                  VibeCheck<span className="text-[#D0FF72]">.</span>
                </p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                  THE FRIEND GROUP FILES
                </p>
              </div>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[9px] font-black tracking-widest text-white/50">
              FILE NO. 001
            </div>
          </div>

          {/* Personality label */}
          <div className="mt-7 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#D0FF72]" />
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#B8A0FF]">
              YOUR FRIEND GROUP ROLE
            </p>
          </div>

          {/* Oversized title */}
          <h2 className="mt-4 text-[clamp(2.8rem,10vw,4.2rem)] font-black leading-[0.83] tracking-[-0.075em]">
            THE
            <br />
            CHAOS
            <br />
            <span className="relative inline-block text-[#D0FF72]">
              MERCHANT
              <svg
                viewBox="0 0 240 12"
                className="absolute -bottom-2 left-0 w-full"
                fill="none"
              >
                <path
                  d="M3 8C55 2 150 2 236 7"
                  stroke="#B8A0FF"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-[#B8A0FF]">.</span>
          </h2>

          <p className="mt-7 max-w-[290px] text-sm leading-6 text-white/60">
            Says "I'm staying home" and somehow ends up with the
            most unhinged story of the night.
          </p>

          {/* Chaos meter */}
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                  CHAOS LEVEL
                </p>
                <p className="mt-1 text-2xl font-black tracking-tight">
                  97<span className="text-sm text-[#D0FF72]">/100</span>
                </p>
              </div>
              <span className="mb-1 rounded-full bg-[#FF78CB]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#FF78CB]">
                ABSOLUTELY UNHINGED
              </span>
            </div>

            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < 19
                      ? "bg-[#D0FF72]"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Friend-group footer */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
            <div className="flex items-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#121118] bg-[#B8A0FF] text-base">
                😎
              </span>
              <span className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#121118] bg-[#FFB3D9] text-base">
                🤡
              </span>
              <span className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#121118] bg-[#D0FF72] text-base">
                👀
              </span>
              <span className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#121118] bg-[#272431] text-[10px] font-black">
                +3
              </span>
            </div>

            <p className="text-right text-[9px] font-black uppercase leading-4 tracking-[0.12em] text-white/40">
              TAG YOUR
              <br />
              CHAOS FRIEND ↗
            </p>
          </div>
        </div>

        {/* Bottom signature strip */}
        <div className="relative flex items-center justify-between border-t border-white/10 bg-white/[0.025] px-5 py-3.5 sm:px-7">
          <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
            10 QUESTIONS. NO MERCY.
          </span>
          <span className="text-lg font-black text-[#D0FF72]">↗</span>
        </div>
      </div>

      {/* Floating challenge sticker */}
      <div className="absolute -bottom-1 right-3 z-20 rotate-3 rounded-full border border-violet-300/20 bg-[#28203A] px-4 py-2.5 text-xs font-bold text-violet-200 shadow-xl sm:right-0">
        YOUR TURN. 👀
      </div>

      {/* Small decorative spark */}
      <div className="absolute bottom-24 -left-2 z-20 rotate-12 text-3xl text-[#FF78CB] sm:-left-6">
        ✳
      </div>
    </div>
  );
}


export function HeroSection() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:pt-28"
    >
      {/* Ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-20 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/15 blur-[110px] lg:left-[70%] lg:top-32 lg:h-[480px] lg:w-[480px]"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-8 xl:gap-16">
        {/* Copy and actions */}
        <div className="relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <VibeCheckIcon size={22} />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/65 sm:text-xs">
              The group chat just got personal
            </span>
          </div>

          <h1 className="mt-7 text-[clamp(3.25rem,11vw,5.5rem)] font-black leading-[0.88] tracking-[-0.075em] sm:mt-9 lg:text-[clamp(4rem,6.2vw,6.75rem)]">
            THEY KNOW
            <br />
            YOU?
            <br />
            <span className="relative inline-block text-[#D0FF72]">
              PROVE IT.
              <svg
                aria-hidden="true"
                viewBox="0 0 300 15"
                className="absolute -bottom-2 left-0 w-full"
                fill="none"
              >
                <path
                  d="M4 9C65 2 181 2 294 8"
                  stroke="#B8A0FF"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-md text-[15px] leading-7 text-white/55 sm:text-base lg:mx-0">
            Make your own quiz. Drop it in the group chat.
            Find out who remembers the little things
            and who's been faking the friendship.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/create"
              className="group inline-flex min-h-14 items-center justify-center gap-4 rounded-2xl bg-[#D0FF72] px-6 py-4 text-sm font-black text-[#171910] shadow-[0_5px_0_#789A34] transition duration-200 hover:-translate-y-0.5 hover:bg-[#DDFF9B] active:translate-y-0.5 active:shadow-none"
            >
              MAKE MY QUIZ
              <span className="text-lg transition-transform group-hover:translate-x-1">
                ↗
              </span>
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-sm font-bold text-white/80 transition hover:border-white/25 hover:bg-white/[0.07]"
            >
              Wait, how does it work?
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium text-white/40 lg:justify-start">
            <span className="flex items-center gap-1.5">
              <span className="text-[#D0FF72]">✳</span> Free to play
            </span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>No download needed</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>Maximum chaos</span>
          </div>
        </div>

        {/* Visual proof of the experience */}
        <div className="relative mx-auto w-full max-w-[440px] px-2 pb-8 pt-8 sm:px-8 lg:max-w-none lg:px-6">
          <div
            aria-hidden="true"
            className="absolute inset-8 -z-10 rounded-full bg-violet-500/10 blur-[70px]"
          />
          <ResultPreview />
        </div>
      </div>

      {/* Section transition */}
      <div className="mx-auto mt-16 flex max-w-7xl items-center gap-4 sm:mt-24">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/10" />
        <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/30 sm:text-[10px]">
          YOUR FRIENDSHIP IS ON THE LINE
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/10" />
      </div>
    </section>
  );
}
