
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { auth, ensureAnonymousUser } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";


type CreatorQuiz = {
  id: string;
  nickname: string;
  category: string;
  status: string;
  questionCount: number;
  responseCount: number;
  createdAt: string | null;
  quizUrl: string;
  resultsUrl: string;
};

const categoryStyles: Record<
  string,
  { label: string; accent: string; wash: string; symbol: string }
> = {
  personality: {
    label: "Personality",
    accent: "#D0FF72",
    wash: "rgba(208,255,114,0.12)",
    symbol: "✳",
  },
  friendship: {
    label: "Friendship",
    accent: "#B8A0FF",
    wash: "rgba(184,160,255,0.14)",
    symbol: "♡",
  },
  confessions: {
    label: "Confessions",
    accent: "#FF78CB",
    wash: "rgba(255,120,203,0.13)",
    symbol: "✦",
  },
  "group-chaos": {
    label: "Group chaos",
    accent: "#75CFFF",
    wash: "rgba(117,207,255,0.13)",
    symbol: "⚡",
  },
};

const fallbackStyle = {
  label: "Your quiz",
  accent: "#D0FF72",
  wash: "rgba(208,255,114,0.12)",
  symbol: "✳",
};

function formatDate(value: string | null) {
  if (!value) return "Date unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unknown";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState<CreatorQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyingId, setCopyingId] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError("");
    setCopiedId("");

    try {
      const user = await ensureAnonymousUser();
      const token = await user.getIdToken();

      const response = await fetch("/api/my-quizzes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Couldn't load your quizzes."
        );
      }

      setQuizzes(Array.isArray(data.quizzes) ? data.quizzes : []);
    } catch (err) {
      console.error("Loading creator quizzes failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't load your quizzes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      if (!user) {
        try {
          await ensureAnonymousUser();
        } catch {
          if (active) {
            setError(
              "Couldn't start your session. Please refresh and try again."
            );
            setLoading(false);
          }
        }
        return;
      }

      await loadQuizzes();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadQuizzes]);

  async function copyQuizLink(quiz: CreatorQuiz) {
    setCopyingId(quiz.id);
    setCopiedId("");
    setError("");

    try {
      const absoluteUrl = new URL(
        quiz.quizUrl,
        window.location.origin
      ).toString();

      await navigator.clipboard.writeText(absoluteUrl);
      setCopiedId(quiz.id);
    } catch {
      setError("Couldn't copy the link. Open the quiz and copy its URL.");
    } finally {
      setCopyingId("");
    }
  }

  const totalResponses = quizzes.reduce(
    (total, quiz) => total + (Number(quiz.responseCount) || 0),
    0
  );

  const liveQuizzes = quizzes.filter(
    (quiz) => quiz.status.toLowerCase() === "published"
  ).length;

  return (
    <>
    <Navbar />
    <main className="relative z-10 min-h-screen overflow-hidden px-4 pb-32 pt-7 text-white sm:px-6 sm:pt-10">
      <div className="pointer-events-none absolute left-[-100px] top-40 -z-10 h-64 w-64 rounded-full bg-violet-500/[0.09] blur-[100px]" />
      <div className="pointer-events-none absolute right-[-100px] top-[460px] -z-10 h-72 w-72 rounded-full bg-pink-500/[0.07] blur-[110px]" />

      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-bold text-white/65 transition hover:border-[#D0FF72]/40 hover:text-[#D0FF72]"
        >
          <span aria-hidden="true">←</span>
          Back to the vibe
        </Link>

        <header className="relative mb-9 mt-9 sm:mb-12 sm:mt-12">
          <div className="pointer-events-none absolute right-2 top-0 hidden rotate-12 rounded-2xl border border-[#FF78CB]/30 bg-[#FF78CB]/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#FF78CB] sm:block">
            YOUR WORLD ✳
          </div>

          <p className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#B8A0FF] sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-[#B8A0FF] shadow-[0_0_12px_#B8A0FF]" />
            Creator headquarters
          </p>

          <h1 className="max-w-3xl text-[clamp(3.25rem,10vw,6.8rem)] font-black leading-[0.86] tracking-[-0.075em]">
            MY QUIZZES
            <span className="ml-2 inline-block -rotate-6 text-[#D0FF72]">.</span>
          </h1>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
              Your questions. Your people. Their answers.
              <span className="font-semibold text-white/85">
                {" "}Let the group-chat chaos begin.
              </span>
            </p>

            <Link
              href="/create"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#D0FF72] px-6 py-4 text-sm font-black text-[#171910] shadow-[0_5px_0_#789A34] transition duration-200 hover:-translate-y-1 hover:shadow-[0_8px_0_#789A34] active:translate-y-0 active:shadow-[0_2px_0_#789A34] sm:w-auto"
            >
              <span className="text-xl transition-transform group-hover:rotate-90">
                +
              </span>
              Create a quiz
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </header>

        {!loading && !error && quizzes.length > 0 && (
          <section
            aria-label="Quiz overview"
            className="mb-9 grid grid-cols-3 gap-2.5 sm:mb-12 sm:gap-4"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#14131A] p-3.5 sm:rounded-3xl sm:p-5">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 sm:text-[10px]">
                Total quizzes
              </span>
              <p className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                {quizzes.length}
              </p>
              <span className="absolute -bottom-3 -right-1 rotate-12 text-3xl text-[#B8A0FF]/20 sm:text-5xl">
                ✳
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[#D0FF72]/15 bg-[#D0FF72]/[0.055] p-3.5 sm:rounded-3xl sm:p-5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#D0FF72]/65 sm:text-[10px]">
                Responses
              </span>
              <p className="mt-2 text-3xl font-black tracking-tight text-[#D0FF72] sm:text-5xl">
                {totalResponses}
              </p>
              <span className="absolute -bottom-3 -right-1 -rotate-12 text-3xl text-[#D0FF72]/20 sm:text-5xl">
                ↗
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[#FF78CB]/15 bg-[#FF78CB]/[0.055] p-3.5 sm:rounded-3xl sm:p-5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#FF78CB]/75 sm:text-[10px]">
                Published
              </span>
              <p className="mt-2 text-3xl font-black tracking-tight text-[#FF78CB] sm:text-5xl">
                {liveQuizzes}
              </p>
              <span className="absolute -bottom-3 -right-1 rotate-12 text-3xl text-[#FF78CB]/20 sm:text-5xl">
                ♥
              </span>
            </div>
          </section>
        )}

        <section aria-label="Your quizzes">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-black tracking-tight sm:text-xl">
                Your collection<span className="text-[#D0FF72]">.</span>
              </p>
              <p className="mt-1 text-xs text-white/40">
                The lore lives here.
              </p>
            </div>

            {!loading && !error && quizzes.length > 0 && (
              <button
                type="button"
                onClick={loadQuizzes}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-3.5 py-2.5 text-xs font-bold text-white/60 transition hover:border-[#D0FF72]/35 hover:text-[#D0FF72] sm:px-4"
              >
                <span aria-hidden="true">↻</span>
                Refresh
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="min-h-[310px] animate-pulse rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-5 sm:p-6"
                >
                  <div className="h-6 w-24 rounded-full bg-white/10" />
                  <div className="mt-10 h-8 w-3/4 rounded-lg bg-white/10" />
                  <div className="mt-3 h-3 w-1/2 rounded-full bg-white/[0.07]" />
                  <div className="mt-9 grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-2xl bg-white/[0.06]" />
                    <div className="h-16 rounded-2xl bg-white/[0.06]" />
                  </div>
                  <div className="mt-6 h-11 rounded-full bg-white/[0.07]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-[28px] border border-[#FF78CB]/20 bg-[#FF78CB]/[0.06] p-6 sm:p-9"
            >
              <span className="text-3xl text-[#FF78CB]" aria-hidden="true">
                !
              </span>
              <h2 className="mt-4 text-xl font-black">
                We hit a little plot twist.
              </h2>
              <p className="mt-2 break-words text-sm leading-6 text-white/60">
                {error}
              </p>
              <button
                type="button"
                onClick={loadQuizzes}
                className="mt-5 rounded-full bg-[#D0FF72] px-5 py-3 text-sm font-black text-[#171910] transition hover:bg-[#ddff9b]"
              >
                Try again ↻
              </button>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="relative isolate overflow-hidden rounded-[30px] border border-white/10 bg-[#121117] p-6 sm:rounded-[36px] sm:p-10 lg:p-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-14 -z-10 h-56 w-56 rounded-full bg-violet-500/20 blur-[75px] sm:h-72 sm:w-72"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 h-48 w-48 rounded-full bg-[#D0FF72]/10 blur-[70px]"
              />

              <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-14 w-14 rotate-[-8deg] items-center justify-center rounded-2xl bg-[#D0FF72] text-3xl text-[#171910] shadow-[0_4px_0_#789A34]">
                      ✳
                    </span>
                    <span className="rotate-3 rounded-full border border-[#B8A0FF]/30 bg-[#B8A0FF]/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#B8A0FF]">
                      Main character energy
                    </span>
                  </div>

                  <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                    It&apos;s giving...
                    <span className="block text-[#D0FF72]">
                      blank canvas.
                    </span>
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
                    No quizzes in your universe yet. Make one, send it to your
                    group chat, and find out who actually knows you.
                  </p>

                  <Link
                    href="/create"
                    className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-[#D0FF72] px-6 py-4 text-sm font-black text-[#171910] shadow-[0_4px_0_#789A34] transition hover:-translate-y-1"
                  >
                    Make your first quiz
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>

                <div
                  aria-hidden="true"
                  className="relative mx-auto flex h-44 w-44 shrink-0 items-center justify-center sm:mr-4 sm:h-56 sm:w-56"
                >
                  <div className="absolute inset-4 rotate-12 rounded-[32px] border border-[#B8A0FF]/30 bg-[#B8A0FF]/10" />
                  <div className="absolute inset-4 -rotate-12 rounded-[32px] border border-[#FF78CB]/30 bg-[#FF78CB]/10" />
                  <div className="relative flex h-32 w-32 rotate-6 items-center justify-center rounded-[30px] border border-[#D0FF72]/30 bg-[#D0FF72]/10 text-7xl text-[#D0FF72] shadow-[0_0_70px_rgba(208,255,114,0.08)] sm:h-40 sm:w-40 sm:text-8xl">
                    ?
                  </div>
                  <span className="absolute right-0 top-0 rotate-12 text-3xl text-[#FF78CB]">
                    ✦
                  </span>
                  <span className="absolute bottom-1 left-0 -rotate-12 text-3xl text-[#B8A0FF]">
                    ✳
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs font-semibold text-white/35">
                {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}{" "}
                in your orbit
              </p>

              <div className="grid items-stretch gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                {quizzes.map((quiz, index) => {
                  const style =
                    categoryStyles[quiz.category] ?? fallbackStyle;
                  const isPublished =
                    quiz.status.toLowerCase() === "published";
                  const isFeatured = index === 0;

                  return (
                    <article
                      key={quiz.id}
                      className={`group relative isolate flex min-w-0 flex-col overflow-hidden rounded-[28px] border p-5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_65px_rgba(0,0,0,0.28)] sm:rounded-[32px] sm:p-6 ${
                        isFeatured
                          ? "border-white/[0.16] bg-[#17151D]"
                          : "border-white/[0.09] bg-[#121117]/95 hover:border-white/20"
                      }`}
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-14 -top-16 -z-10 h-48 w-48 rounded-full blur-[65px] transition duration-300 group-hover:scale-125"
                        style={{ backgroundColor: style.wash }}
                      />

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-20 right-4 -z-10 select-none text-8xl font-black opacity-[0.045] transition duration-300 group-hover:rotate-12 group-hover:scale-110"
                        style={{ color: style.accent }}
                      >
                        {style.symbol}
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="inline-flex max-w-[70%] items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-wider"
                          style={{
                            color: style.accent,
                            borderColor: `${style.accent}35`,
                            backgroundColor: style.wash,
                          }}
                        >
                          <span aria-hidden="true">{style.symbol}</span>
                          <span className="truncate">
                            {style.label === "Your quiz"
                              ? quiz.category
                              : style.label}
                          </span>
                        </span>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-2 text-[9px] font-black uppercase tracking-wider ${
                            isPublished
                              ? "border-[#D0FF72]/20 bg-[#D0FF72]/[0.07] text-[#D0FF72]"
                              : "border-white/10 bg-white/[0.04] text-white/50"
                          }`}
                        >
                          <span
                            className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                              isPublished ? "bg-[#D0FF72]" : "bg-white/35"
                            }`}
                          />
                          {quiz.status || "Unknown"}
                        </span>
                      </div>

                      <div className="mt-7 flex min-h-[108px] flex-col">
                        {isFeatured && (
                          <span className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-white/35">
                            YOUR LATEST CREATION
                          </span>
                        )}

                        <h2 className="break-words text-[1.65rem] font-black leading-[1.08] tracking-[-0.045em] sm:text-3xl">
                          {quiz.nickname || "Your quiz"}
                          <span
                            className="inline-block"
                            style={{ color: style.accent }}
                          >
                            .
                          </span>
                        </h2>

                        <p className="mt-3 text-[11px] font-medium text-white/40">
                          Created {formatDate(quiz.createdAt)}
                        </p>
                      </div>

                      <div className="my-6 h-px bg-gradient-to-r from-white/[0.13] via-white/[0.06] to-transparent" />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-3.5 sm:p-4">
                          <p
                            className="text-3xl font-black tracking-tight sm:text-4xl"
                            style={{ color: style.accent }}
                          >
                            {Number(quiz.responseCount) || 0}
                          </p>
                          <p className="mt-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-white/40">
                            Responses
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-3.5 sm:p-4">
                          <p className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                            {Number(quiz.questionCount) || 0}
                          </p>
                          <p className="mt-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-white/40">
                            Questions
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-2.5 pt-6">
                        <Link
                          href={quiz.resultsUrl}
                          className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-2.5 py-3.5 text-xs font-black text-[#171910] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D0FF72] sm:rounded-2xl sm:px-3"
                          style={{ backgroundColor: style.accent }}
                        >
                          Results <span aria-hidden="true">↗</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => copyQuizLink(quiz)}
                          disabled={copyingId === quiz.id}
                          className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.035] px-2.5 py-3.5 text-xs font-black text-white/80 transition hover:border-white/25 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF] disabled:cursor-wait disabled:opacity-50 sm:rounded-2xl sm:px-3"
                        >
                          {copyingId === quiz.id
                            ? "Copying…"
                            : copiedId === quiz.id
                              ? "Copied ✓"
                              : "Copy link ↗"}
                        </button>
                      </div>

                      <p className="sr-only" aria-live="polite">
                        {copiedId === quiz.id
                          ? "Quiz link copied."
                          : copyingId === quiz.id
                            ? "Copying quiz link."
                            : ""}
                      </p>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {!loading && !error && quizzes.length > 0 && (
          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-5">
            <p className="text-xs leading-5 text-white/45 sm:text-sm">
              The group chat is waiting. Share a quiz and let the lore unfold.
            </p>
            <Link
              href="/create"
              className="inline-flex w-fit items-center gap-2 text-xs font-black text-[#D0FF72] transition hover:gap-3"
            >
              Make another one <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </main>
   <Footer /> 
 </>

  );
}
