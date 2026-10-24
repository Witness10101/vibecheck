
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, ensureAnonymousUser } from "@/lib/firebase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type QuizQuestion = {
  id: string;
  text: string;
  answerMode: "text" | "multiple";
  options?: string[];
};

type QuizData = {
  ownerId: string;
  nickname?: string;
  category?: string;
  questions: QuizQuestion[];
  status: string;
};

type QuizResponse = {
  id: string;
  quizId: string;
  respondentName: string;
  answers: Record<string, string>;
  createdAt?: Timestamp | null;
};

const categoryLabels: Record<string, string> = {
  personality: "PERSONALITY",
  friendship: "FRIENDSHIP",
  confessions: "CONFESSIONS",
  "group-chaos": "GROUP CHAOS",
};

function formatDate(timestamp?: Timestamp | null) {
  if (!timestamp) return "Recently";

  return timestamp.toDate().toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function QuizResultsPage() {
  const params = useParams<{ id: string }>();
  const quizId = params.id;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [selectedResponse, setSelectedResponse] =
    useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const loadResults = useCallback(async (refresh = false) => {
    if (!quizId) {
      setError("This results link is missing its quiz ID.");
      setLoading(false);
      return;
    }

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setAccessDenied(false);

    try {
      const user = await ensureAnonymousUser();

      const quizSnapshot = await getDoc(doc(db, "quizzes", quizId));

      if (!quizSnapshot.exists()) {
        throw new Error("We couldn't find this quiz.");
      }

      const quizData = quizSnapshot.data() as QuizData;

      if (quizData.status !== "published") {
        throw new Error("This quiz isn't available.");
      }

      // Never query responses unless this account owns the quiz.
      if (quizData.ownerId !== user.uid) {
        setAccessDenied(true);
        throw new Error(
          "This dashboard belongs to the account that created the quiz. Open it in the same browser and account you used to create it."
        );
      }

      // This filter is important: Firestore rules are not query filters.
      const responseQuery = query(
        collection(db, "quizResponses"),
        where("quizId", "==", quizId)
      );

      const responseSnapshot = await getDocs(responseQuery);

      const loadedResponses = responseSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as QuizResponse[];

      loadedResponses.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() ?? 0;
        const bTime = b.createdAt?.toMillis() ?? 0;
        return bTime - aTime;
      });

      setQuiz(quizData);
      setResponses(loadedResponses);

      setSelectedResponse((current) => {
        if (!current) return null;
        return loadedResponses.find((item) => item.id === current.id) ?? null;
      });
    } catch (err) {
      console.error("Failed to load quiz results:", err);

      setResponses([]);
      setQuiz(null);
      setSelectedResponse(null);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading results."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [quizId]);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  const questions = quiz?.questions ?? [];
  const category =
    categoryLabels[quiz?.category ?? ""] ?? "VIBECHECK QUIZ";

  return (
    <div className="min-h-screen overflow-hidden bg-[#09090D] text-white">
      <Navbar />

      <main className="relative isolate min-h-[70vh] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-10 -z-10 h-96 w-96 rounded-full bg-[#8B5CFF]/15 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-96 -z-10 h-96 w-96 rounded-full bg-[#D0FF72]/[0.07] blur-[120px]"
        />

        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-24 text-center">
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#D0FF72]" />
              <h1 className="text-xl font-black">Collecting the vibes...</h1>
              <p className="mt-2 text-sm text-white/45">
                Loading your quiz results.
              </p>
            </div>
          ) : error ? (
            <section
              className="rounded-3xl border border-[#FF78CB]/20 bg-white/[0.035] px-6 py-16 text-center sm:px-12"
              role="alert"
            >
              <div className="mb-5 text-5xl">
                {accessDenied ? "🔒" : "🫠"}
              </div>
              <p className="mb-3 text-xs font-black tracking-[0.2em] text-[#FF78CB]">
                {accessDenied ? "OWNER ACCESS ONLY" : "RESULTS UNAVAILABLE"}
              </p>
              <h1 className="text-3xl font-black">
                {accessDenied
                  ? "Wrong account, partner."
                  : "We hit a little plot twist."}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/55">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void loadResults()}
                className="mt-8 rounded-xl bg-[#D0FF72] px-6 py-3.5 text-sm font-black text-[#09090D] transition hover:bg-[#ddff9c]"
              >
                TRY AGAIN ↻
              </button>
            </section>
          ) : quiz ? (
            <>
              {/* Header */}
              <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#181222] via-[#111018] to-[#11170D] p-6 sm:p-10">
                <div
                  aria-hidden="true"
                  className="absolute -right-4 -top-8 rotate-12 text-[10rem] leading-none text-[#D0FF72]/[0.06]"
                >
                  ✳
                </div>

                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#D0FF72]/25 bg-[#D0FF72]/10 px-3.5 py-2 text-[10px] font-black tracking-[0.16em] text-[#D0FF72]">
                    ✳ {category}
                  </div>

                  <p className="mt-7 text-xs font-bold tracking-[0.2em] text-white/40">
                    YOUR QUIZ. YOUR PEOPLE. THEIR ANSWERS.
                  </p>

                  <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                    The <span className="text-[#D0FF72]">vibe report.</span>
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                    Here's who's taken{" "}
                    <span className="font-bold text-white">
                      {quiz.nickname?.trim() || "your quiz"}
                    </span>
                    . Open a response to see what your friends said.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void loadResults(true)}
                      disabled={refreshing}
                      className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-bold transition hover:bg-white/[0.08] disabled:opacity-50"
                    >
                      {refreshing ? "REFRESHING..." : "↻ REFRESH RESULTS"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(
                          `${window.location.origin}/q/${quizId}`
                        );
                      }}
                      className="rounded-xl bg-[#D0FF72] px-4 py-3 text-sm font-black text-[#09090D] transition hover:bg-[#ddff9c]"
                    >
                      COPY QUIZ LINK ↗
                    </button>
                  </div>
                </div>
              </section>

              {/* Stats */}
              <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
                  <p className="text-xs font-bold tracking-wide text-white/45">
                    TOTAL RESPONSES
                  </p>
                  <p className="mt-3 text-4xl font-black text-[#D0FF72]">
                    {responses.length}
                  </p>
                  <p className="mt-2 text-xs text-white/35">
                    Friends who answered
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
                  <p className="text-xs font-bold tracking-wide text-white/45">
                    QUESTIONS
                  </p>
                  <p className="mt-3 text-4xl font-black text-[#B8A0FF]">
                    {questions.length}
                  </p>
                  <p className="mt-2 text-xs text-white/35">
                    In this quiz
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:col-span-1 sm:p-6">
                  <p className="text-xs font-bold tracking-wide text-white/45">
                    QUIZ STATUS
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xl font-black">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D0FF72] shadow-[0_0_12px_#D0FF72]" />
                    LIVE
                  </p>
                  <p className="mt-2 text-xs text-white/35">
                    Share it with more friends
                  </p>
                </div>
              </section>

              {/* Responses list and answer detail */}
              <div className="grid items-start gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
                  <div className="border-b border-white/[0.08] p-5 sm:p-6">
                    <h2 className="text-lg font-black">Your people</h2>
                    <p className="mt-1 text-sm text-white/45">
                      Select someone to open their answers.
                    </p>
                  </div>

                  {responses.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="text-4xl">👀</div>
                      <h3 className="mt-4 font-black">It's quiet in here...</h3>
                      <p className="mt-2 text-sm leading-6 text-white/45">
                        Share your quiz link and your friends' responses will
                        show up here.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[620px] space-y-2 overflow-y-auto p-3">
                      {responses.map((response) => {
                        const selected = selectedResponse?.id === response.id;

                        return (
                          <button
                            key={response.id}
                            type="button"
                            onClick={() => setSelectedResponse(response)}
                            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                              selected
                                ? "border-[#D0FF72]/50 bg-[#D0FF72]/[0.07]"
                                : "border-transparent bg-black/10 hover:border-white/10 hover:bg-white/[0.035]"
                            }`}
                          >
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
                                selected
                                  ? "bg-[#D0FF72] text-[#09090D]"
                                  : "bg-[#B8A0FF]/10 text-[#B8A0FF]"
                              }`}
                            >
                              {(response.respondentName?.trim() || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-black">
                                {response.respondentName || "Anonymous"}
                              </span>
                              <span className="mt-1 block text-xs text-white/40">
                                {formatDate(response.createdAt)}
                              </span>
                            </span>

                            <span className="text-white/35">↗</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035]">
                  {selectedResponse ? (
                    <>
                      <div className="border-b border-white/[0.08] p-5 sm:p-6">
                        <p className="text-[10px] font-black tracking-[0.2em] text-[#D0FF72]">
                          RESPONSE DETAILS
                        </p>
                        <h2 className="mt-2 break-words text-2xl font-black">
                          {selectedResponse.respondentName}
                        </h2>
                        <p className="mt-2 text-xs text-white/40">
                          Submitted {formatDate(selectedResponse.createdAt)}
                        </p>
                      </div>

                      <div className="space-y-3 p-4 sm:p-6">
                        {questions.map((question, index) => {
                          const answer = selectedResponse.answers?.[question.id];

                          return (
                            <article
                              key={question.id}
                              className="rounded-xl border border-white/[0.08] bg-black/20 p-4"
                            >
                              <p className="text-[10px] font-black tracking-[0.15em] text-[#B8A0FF]">
                                QUESTION {String(index + 1).padStart(2, "0")}
                              </p>
                              <h3 className="mt-2 text-sm font-bold leading-6">
                                {question.text}
                              </h3>
                              <p className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-white/[0.035] p-3 text-sm leading-6 text-white/75">
                                {typeof answer === "string" && answer.trim()
                                  ? answer
                                  : "No answer recorded."}
                              </p>
                            </article>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="px-6 py-16 text-center sm:py-24">
                      <div className="text-4xl">💌</div>
                      <h2 className="mt-4 text-xl font-black">
                        The tea goes here.
                      </h2>
                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/45">
                        Choose a response on the left to see every answer your
                        friend submitted.
                      </p>
                    </div>
                  )}
                </section>
              </div>

              <p className="mt-8 text-center text-[10px] font-bold tracking-[0.2em] text-white/25">
                YOUR PEOPLE · YOUR VIBE · YOUR VIBECHECK ✳
              </p>
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
