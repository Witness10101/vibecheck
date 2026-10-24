"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, ensureAnonymousUser } from "@/lib/firebase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type QuizQuestion = {
  id: string;
  text: string;
  answerMode: "text" | "multiple";
  options?: string[];
};

type PublicQuiz = {
  nickname?: string;
  category?: string;
  questions?: QuizQuestion[];
  status?: string;
};

const categoryInfo: Record<string, { label: string; emoji: string }> = {
  personality: { label: "PERSONALITY CHECK", emoji: "🧠" },
  friendship: { label: "FRIENDSHIP CHECK", emoji: "🫶" },
  confessions: { label: "CONFESSIONS", emoji: "🤫" },
  "group-chaos": { label: "GROUP CHAOS", emoji: "🌀" },
};

export default function TakeQuizPage() {
  const params = useParams<{ id: string }>();
  const quizId = params.id;

  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [nickname, setNickname] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [showNameError, setShowNameError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadQuiz() {
      setLoading(true);
      setError("");

      try {
        if (!quizId) {
          throw new Error("This quiz link is missing its ID.");
        }

        const snapshot = await getDoc(doc(db, "quizzes", quizId));

        if (!snapshot.exists()) {
          throw new Error("This quiz doesn't exist. Double-check the link.");
        }

        const data = snapshot.data() as PublicQuiz;

        if (
          data.status !== "published" ||
          !Array.isArray(data.questions) ||
          data.questions.length < 5 ||
          data.questions.length > 10
        ) {
          throw new Error("This quiz isn't available right now.");
        }

        const ids = data.questions.map((question) => question.id);
        const uniqueIds = new Set(ids);

        const valid = data.questions.every(
          (question) =>
            typeof question.id === "string" &&
            question.id.length > 0 &&
            typeof question.text === "string" &&
            question.text.trim().length > 0 &&
            (question.answerMode === "text" ||
              (question.answerMode === "multiple" &&
                Array.isArray(question.options) &&
                question.options.length >= 2 &&
                question.options.every(
                  (option) =>
                    typeof option === "string" && option.trim().length > 0
                )))
        );

        if (!valid || uniqueIds.size !== ids.length) {
          throw new Error("This quiz has invalid question data.");
        }

        if (!cancelled) {
          setQuiz(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading this quiz."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadQuiz();

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const questions = quiz?.questions ?? [];

  const answeredCount = questions.filter(
    (question) => (answers[question.id] ?? "").trim().length > 0
  ).length;

  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const category = categoryInfo[quiz?.category ?? ""] ?? {
    label: "VIBECHECK QUIZ",
    emoji: "✳️",
  };

  function updateAnswer(questionId: string, value: string) {
    if (submitting || submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));

    setValidationMessage("");
    setSubmitError("");
  }

  async function handleSubmit() {
    if (submitting || submitted) return;

    setShowNameError(!nickname.trim());
    setValidationMessage("");
    setSubmitError("");

    if (!nickname.trim()) {
      setValidationMessage("Add your name first so your friend knows who answered.");
      document.getElementById("respondent-name")?.focus();
      return;
    }

    if (nickname.trim().length > 30) {
      setValidationMessage("Keep your name under 30 characters.");
      return;
    }

    const unanswered = questions.find(
      (question) => !(answers[question.id] ?? "").trim()
    );

    if (unanswered) {
      setValidationMessage("Almost there! Answer every question before submitting.");

      document.getElementById(`question-${unanswered.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    // Build a fresh answer map containing only this quiz's question IDs.
    const cleanAnswers: Record<string, string> = {};

    for (const question of questions) {
      const answer = (answers[question.id] ?? "").trim();

      if (question.answerMode === "multiple") {
        if (!(question.options ?? []).includes(answer)) {
          setValidationMessage(
            `Please choose one of the available options for question ${questions.indexOf(question) + 1}.`
          );

          document.getElementById(`question-${question.id}`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          return;
        }
      }

      cleanAnswers[question.id] = answer;
    }

    setSubmitting(true);

    
    try {
      const user = await ensureAnonymousUser();
      const idToken = await user.getIdToken();

      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          quizId,
          respondentName: nickname.trim(),
          answers: cleanAnswers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Unable to submit your answers."
        );
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Quiz submission failed:", err);

      setSubmitError(
        err instanceof Error &&
          err.message !== "Failed to fetch"
          ? err.message
          : "We couldn't save your answers just yet. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
   }


  return (
    <div className="min-h-screen overflow-hidden bg-[#09090D] text-white">
      <Navbar />

      <main className="relative isolate min-h-[70vh] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-[#8B5CFF]/20 blur-[120px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-[32rem] -z-10 h-96 w-96 rounded-full bg-[#FF78CB]/10 blur-[120px]"
        />

        <div className="mx-auto max-w-3xl">
          {loading ? (
            <section
              className="rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-24 text-center"
              aria-live="polite"
            >
              <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-[#D0FF72]" />
              <p className="text-lg font-black">Loading the vibes...</p>
              <p className="mt-2 text-sm text-white/45">
                Your quiz is getting ready.
              </p>
            </section>
          ) : error ? (
            <section
              className="rounded-3xl border border-[#FF78CB]/20 bg-white/[0.035] px-6 py-16 text-center sm:px-12"
              role="alert"
            >
              <div className="mb-5 text-5xl">🫠</div>
              <p className="mb-3 text-xs font-black tracking-[0.2em] text-[#FF78CB]">
                VIBE NOT FOUND
              </p>
              <h1 className="text-3xl font-black tracking-tight">
                Well, this is awkward.
              </h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/55">
                {error}
              </p>
              <a
                href="/"
                className="mt-8 inline-flex rounded-xl bg-[#D0FF72] px-6 py-3.5 text-sm font-black text-[#09090D] transition hover:scale-[1.02]"
              >
                BACK TO VIBECHECK ↗
              </a>
            </section>
          ) : submitted ? (
            <section className="relative overflow-hidden rounded-[2rem] border border-[#D0FF72]/25 bg-gradient-to-br from-[#1B2415] via-[#111018] to-[#171022] px-6 py-14 text-center sm:px-12 sm:py-20">
              <div
                aria-hidden="true"
                className="absolute -right-5 -top-8 rotate-12 text-[10rem] leading-none text-[#D0FF72]/[0.06]"
              >
                ✳
              </div>

              <div className="relative">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#D0FF72]/30 bg-[#D0FF72]/10 text-4xl">
                  🎉
                </div>

                <p className="mt-7 text-xs font-black tracking-[0.22em] text-[#D0FF72]">
                  ANSWERS SAVED SUCCESSFULLY
                </p>

                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
                  You're a <span className="text-[#D0FF72]">legend.</span>
                </h1>

                <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/60 sm:text-base">
                  Your answers are in, {nickname.trim()}! Your friend can now
                  see that you've completed their VibeCheck.
                </p>

                <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-white/10 bg-black/20 p-5 text-left">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-white/45">Questions completed</span>
                    <span className="font-black text-[#D0FF72]">
                      {questions.length}/{questions.length}
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-full rounded-full bg-[#D0FF72]" />
                  </div>
                </div>

                <a
                  href="/"
                  className="mt-8 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-[#D0FF72] px-6 py-4 text-sm font-black text-[#09090D] transition hover:-translate-y-0.5 hover:bg-[#ddff9c]"
                >
                  MAKE YOUR OWN VIBECHECK ↗
                </a>

                <p className="mt-5 text-xs text-white/35">
                  Made for friends. Built for the vibe. ✳
                </p>
              </div>
            </section>
          ) : quiz ? (
            <>
              <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#181222] via-[#111018] to-[#11170D] p-6 sm:p-10">
                <div
                  aria-hidden="true"
                  className="absolute -right-5 -top-8 rotate-12 text-[10rem] leading-none text-[#D0FF72]/[0.07]"
                >
                  ✳
                </div>

                <div className="absolute right-8 top-8 h-2 w-2 rounded-full bg-[#D0FF72] shadow-[0_0_20px_#D0FF72]" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#D0FF72]/25 bg-[#D0FF72]/10 px-3.5 py-2 text-[10px] font-black tracking-[0.16em] text-[#D0FF72]">
                    <span>{category.emoji}</span>
                    {category.label}
                  </div>

                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-white/40">
                    OKAY, LET'S FIND OUT...
                  </p>

                  <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.04] tracking-tight sm:text-6xl">
                    How well do you know{" "}
                    <span className="text-[#D0FF72]">
                      {quiz.nickname?.trim() || "your friend"}
                    </span>
                    <span className="text-[#FF78CB]">?</span>
                  </h1>

                  <p className="mt-5 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                    No pressure. No overthinking. Just you, your answers, and
                    the ultimate friendship test.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2.5">
                    <span className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs font-bold text-white/70">
                      ✦ {questions.length} questions
                    </span>
                    <span className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-xs font-bold text-white/70">
                      ⚡ Your turn to shine
                    </span>
                  </div>
                </div>
              </section>

              <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-black">YOUR VIBE PROGRESS</span>
                  <span className="text-sm font-black text-[#D0FF72]">
                    {answeredCount}/{questions.length}
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-label="Questions answered"
                  aria-valuemin={0}
                  aria-valuemax={questions.length}
                  aria-valuenow={answeredCount}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#D0FF72] via-[#B8A0FF] to-[#FF78CB] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-white/40">
                  {progress === 100
                    ? "All answers in. You're a legend. ✨"
                    : "One question at a time. You've got this."}
                </p>
              </section>

              <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
                <label
                  htmlFor="respondent-name"
                  className="mb-3 block text-base font-black"
                >
                  First up — who are you?{" "}
                  <span className="text-[#FF78CB]">*</span>
                </label>

                <input
                  id="respondent-name"
                  type="text"
                  autoComplete="nickname"
                  maxLength={30}
                  value={nickname}
                  disabled={submitting}
                  onChange={(event) => {
                    setNickname(event.target.value);
                    setShowNameError(false);
                    setValidationMessage("");
                    setSubmitError("");
                  }}
                  placeholder="Your name or nickname..."
                  aria-invalid={showNameError}
                  className={`w-full rounded-xl border bg-[#09090D] px-4 py-4 text-sm outline-none transition placeholder:text-white/30 focus:ring-2 focus:ring-[#D0FF72]/10 ${
                    showNameError
                      ? "border-[#FF78CB]/70"
                      : "border-white/10 focus:border-[#D0FF72]/60"
                  }`}
                />
              </section>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <section
                    id={`question-${question.id}`}
                    key={question.id}
                    className="scroll-mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition-colors hover:border-white/20 sm:p-7"
                  >
                    <div className="mb-6 flex items-start gap-3.5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                          (answers[question.id] ?? "").trim()
                            ? "bg-[#D0FF72] text-[#09090D]"
                            : "border border-white/10 bg-white/[0.04] text-white/60"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-black leading-6 sm:text-lg">
                          {question.text}
                        </h2>
                        <p className="mt-2 text-[10px] font-black tracking-[0.16em] text-white/35">
                          {question.answerMode === "multiple"
                            ? "PICK YOUR ANSWER"
                            : "SAY IT WITH YOUR CHEST"}
                        </p>
                      </div>

                      {(answers[question.id] ?? "").trim() && (
                        <span
                          className="text-lg text-[#D0FF72]"
                          aria-label="Answered"
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    {question.answerMode === "multiple" ? (
                      <div className="grid gap-2.5">
                        {(question.options ?? []).map((option, optionIndex) => {
                          const selected = answers[question.id] === option;

                          return (
                            <button
                              key={`${question.id}-${optionIndex}`}
                              type="button"
                              disabled={submitting}
                              aria-pressed={selected}
                              onClick={() =>
                                updateAnswer(question.id, option)
                              }
                              className={`group flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left text-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:p-4 ${
                                selected
                                  ? "border-[#D0FF72]/70 bg-[#D0FF72]/10 text-white"
                                  : "border-white/[0.08] bg-[#09090D]/70 text-white/65 hover:border-[#B8A0FF]/50 hover:bg-white/[0.035] hover:text-white"
                              }`}
                            >
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-black transition ${
                                  selected
                                    ? "border-[#D0FF72] bg-[#D0FF72] text-[#09090D]"
                                    : "border-white/15 text-white/35 group-hover:border-[#B8A0FF]/60"
                                }`}
                              >
                                {selected
                                  ? "✓"
                                  : String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="leading-5">{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <textarea
                        value={answers[question.id] ?? ""}
                        onChange={(event) =>
                          updateAnswer(question.id, event.target.value)
                        }
                        disabled={submitting}
                        maxLength={500}
                        rows={3}
                        placeholder="Type your answer here..."
                        className="w-full resize-y rounded-xl border border-white/10 bg-[#09090D] px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-[#B8A0FF]/60 focus:ring-2 focus:ring-[#B8A0FF]/10 disabled:opacity-60"
                      />
                    )}
                  </section>
                ))}
              </div>

              <section className="mt-6 rounded-3xl border border-[#D0FF72]/20 bg-gradient-to-br from-[#D0FF72]/[0.08] via-white/[0.025] to-[#B8A0FF]/[0.06] p-5 sm:p-8">
                <div className="mb-5 flex items-start gap-3">
                  <span className="text-2xl">💚</span>
                  <div>
                    <h2 className="text-lg font-black">
                      Ready to lock in your answers?
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-white/50">
                      {answeredCount} of {questions.length} questions answered.
                      Give it one last look before submitting.
                    </p>
                  </div>
                </div>

                {validationMessage && (
                  <p
                    className="mb-4 rounded-xl border border-[#FF78CB]/20 bg-[#FF78CB]/[0.07] p-3.5 text-sm leading-6 text-white/80"
                    role="status"
                  >
                    {validationMessage}
                  </p>
                )}

                {submitError && (
                  <div
                    className="mb-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4"
                    role="alert"
                  >
                    <p className="text-sm leading-6 text-white/80">
                      {submitError}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleSubmit()}
                      disabled={submitting}
                      className="mt-3 text-sm font-black text-[#D0FF72] underline underline-offset-4 disabled:opacity-50"
                    >
                      TRY AGAIN
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={submitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#D0FF72] px-5 py-4 text-sm font-black text-[#09090D] transition hover:-translate-y-0.5 hover:bg-[#ddff9c] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#09090D]/30 border-t-[#09090D]" />
                      SAVING YOUR ANSWERS...
                    </>
                  ) : (
                    <>
                      SUBMIT MY ANSWERS
                      <span className="transition-transform group-hover:translate-x-1">
                        ↗
                      </span>
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-[11px] leading-5 text-white/35">
                  Your answers are saved securely when submission succeeds.
                </p>
              </section>

              <p className="mt-8 text-center text-[10px] font-bold tracking-[0.2em] text-white/25">
                MADE FOR FRIENDS · BUILT FOR THE VIBE ✳
              </p>
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
} 
