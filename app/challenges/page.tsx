
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/ui/Button";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";


type Challenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  color: string;
  badge: string;
  difficulty: string;
  playCount: number;
  image: string;
};

const filters = [
  "All",
  "Group chaos",
  "Friendship",
  "Personality",
  "Daily",
] as const;

export default function ChallengesPage() {
 
const [activeFilter, setActiveFilter] =
  useState<(typeof filters)[number]>("All");

const [challenges, setChallenges] = useState<Challenge[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [loadError, setLoadError] = useState("");

useEffect(() => {
  let cancelled = false;

  async function loadChallenges() {
    try {
      const response = await fetch("/api/challenges");

      if (!response.ok) {
        throw new Error("Unable to load challenges.");
      }

      const data: { challenges: Challenge[] } =
        await response.json();

      if (!cancelled) {
        setChallenges(data.challenges);
      }
    } catch {
      if (!cancelled) {
        setLoadError("Couldn't load challenges. Please try again.");
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  }

  void loadChallenges();

  return () => {
    cancelled = true;
  };
}, []);

const visibleChallenges = useMemo(
  () =>
    activeFilter === "All"
      ? challenges
      : challenges.filter(
          (challenge) => challenge.category === activeFilter
        ),
  [activeFilter, challenges]
);

  return (
  <> 
    <Navbar />  
    <main className="relative mx-auto min-h-screen w-full max-w-[1440px] overflow-hidden px-5 pb-32 pt-12 sm:px-8 sm:pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-100px] top-20 h-72 w-72 rounded-full bg-[#B8A0FF]/10 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-100px] top-[480px] h-64 w-64 rounded-full bg-[#D0FF72]/10 blur-[100px]"
      />

      <section className="relative">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D0FF72]/25 bg-[#D0FF72]/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#D0FF72]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#D0FF72]" />
          The chaos starts here
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-[clamp(3.5rem,10vw,8rem)] font-black leading-[0.8] tracking-[-0.09em]">
              LET&apos;S
              <br />
              <span className="text-[#D0FF72]">GET</span>{" "}
              <span className="text-[#B8A0FF]">MESSY.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              Personality tests, friendship checks and group-chat
              chaos. Pick a challenge, play along and expose the
              group chat for what it really is.
            </p>
          </div>

          <Link
            href="/create"
            className="group flex items-center justify-between gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-[#D0FF72]/40 hover:bg-white/[0.07] sm:p-7"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8A0FF]">
                Your turn to cause trouble
              </span>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                MAKE YOUR OWN QUIZ
              </h2>
              <p className="mt-2 text-sm text-white/45">
                Create it. Share it. Expose your friends.
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D0FF72] text-xl font-black text-[#09090D] transition group-hover:rotate-45">
              ↗
            </span>
          </Link>
        </div>
      </section>

      <section className="relative mt-20 sm:mt-28">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
              Choose your weapon
            </p>
            <h2 className="text-4xl font-black tracking-[-0.07em] sm:text-6xl">
              PICK YOUR <span className="text-[#D0FF72]">POISON.</span>
            </h2>
          </div>
          <p className="text-sm text-white/40">
            {visibleChallenges.length} challenges to explore
          </p>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-3">
          {filters.map((filter) => {
            const selected = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={selected}
                className={`shrink-0 rounded-full border px-5 py-3 text-xs font-black transition ${
                  selected
                    ? "border-[#D0FF72] bg-[#D0FF72] text-[#09090D]"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleChallenges.map((challenge, index) => (
            <article
              key={challenge.id}
              className="group relative flex min-h-[390px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#111116] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/25 sm:p-6"
              style={
                {
                  "--challenge-color": challenge.color,
                } as React.CSSProperties
              }
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-15 blur-3xl transition duration-500 group-hover:opacity-30"
                style={{ backgroundColor: challenge.color }}
              />

              <div className="relative flex items-center justify-between gap-3">
                <span className="text-xs font-black text-white/25">
                  0{index + 1}
                </span>
                <span
                  className="rounded-full border px-3 py-1.5 text-[9px] font-black tracking-[0.12em]"
                  style={{
                    borderColor: `${challenge.color}55`,
                    color: challenge.color,
                    backgroundColor: `${challenge.color}0D`,
                  }}
                >
                  {challenge.badge}
                </span>
              </div>

              <div
                className="relative my-8 flex h-32 items-center justify-center rounded-2xl border border-white/5"
                style={{
                  background: `radial-gradient(circle at 50% 45%, ${challenge.color}20, transparent 70%)`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="text-7xl transition duration-500 group-hover:scale-110 group-hover:rotate-6"
                >
                  {challenge.emoji}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute right-5 top-4 text-xl opacity-40"
                  style={{ color: challenge.color }}
                >
                  ✳
                </span>
              </div>

              <p
                className="mb-3 text-[9px] font-black uppercase tracking-[0.18em]"
                style={{ color: challenge.color }}
              >
                {challenge.category}
              </p>

              <h3 className="text-2xl font-black leading-[0.95] tracking-[-0.06em]">
                {challenge.title}
              </h3>

              <p className="mt-3 flex-1 text-sm leading-6 text-white/45">
                {challenge.description}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                  {challenge.playCount}
                </span>
                <span
                  className="text-xl transition group-hover:translate-x-1"
                  style={{ color: challenge.color }}
                  aria-hidden="true"
                >
                  ↗
                </span>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-xs leading-5 text-white/30">
          These are the initial challenge previews. We&apos;ll connect
          them to published Firestore challenges and playable flows next.
        </p>
      </section>

      <section className="relative mt-16 overflow-hidden rounded-[32px] border border-[#B8A0FF]/20 bg-[#B8A0FF]/[0.06] p-7 sm:mt-24 sm:p-12">
        <span
          aria-hidden="true"
          className="absolute -right-8 -top-10 text-[180px] font-black leading-none text-[#B8A0FF]/[0.06]"
        >
          ?
        </span>

        <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#B8A0FF]">
              No challenge hits different?
            </p>
            <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-[-0.06em] sm:text-5xl">
              MAKE ONE THAT&apos;S{" "}
              <span className="text-[#D0FF72]">PERSONALLY OFFENSIVE.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">
              Write your questions, pick your answers and send your
              friends a link they absolutely should be scared to open.
            </p>
          </div>

          <Link
            href="/create"
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#D0FF72] px-7 py-4 text-sm font-black text-[#09090D] transition hover:scale-[1.03]"
          >
            CREATE A QUIZ <span className="text-lg">↗</span>
          </Link>
        </div>
      </section>
    </main>
  <Footer />  
 </>   
  );
}
