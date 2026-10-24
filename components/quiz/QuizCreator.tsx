
"use client";

import { useMemo, useState } from "react";
import { Footer } from "../layout/Footer";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db, ensureAnonymousUser } from "@/lib/firebase";

const CATEGORIES = [
  { id: "personality", label: "Personality", eyebrow: "MAIN CHARACTER", color: "#B8A0FF", symbol: "✳", description: "Find out who you really are." },
  { id: "friendship", label: "Friendship", eyebrow: "BESTIE DETECTOR", color: "#D0FF72", symbol: "✦", description: "Who actually knows you best?" },
  { id: "confessions", label: "Confessions", eyebrow: "SPILL THE TEA", color: "#FF78CB", symbol: "♡", description: "Secrets, hot takes, zero chill." },
  { id: "group-chaos", label: "Group chaos", eyebrow: "GROUP CHAT EXPOSED", color: "#75CFFF", symbol: "ϟ", description: "Expose the entire friend group." },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];
type AnswerMode = "text" | "multiple";

type Question = {
  id: string;
  text: string;
  category: CategoryId;
  custom?: boolean;
  answerMode: AnswerMode;
  answer: string;
  options: string[];
  correctOptionIndex: number;
};


const QUESTION_BANK: Record<CategoryId, string[]> = {
  personality: [
    "What's my biggest red flag?",
    "What's my most irrational fear?",
    "What's my toxic trait?",
    "What instantly improves my mood?",
    "What's my dream life?",
    "What's my most-used phrase?",
    "What's my biggest ick?",
    "What would I be famous for?",
    "What's my comfort activity?",
    "What describes me in one word?",
  ],
  friendship: [
    "What's my go-to comfort food?",
    "Who do I call when things go wrong?",
    "What's my biggest pet peeve?",
    "What's my dream holiday?",
    "What's my most-used emoji?",
    "What always makes me laugh?",
    "What's my biggest fear?",
    "What's my ideal weekend?",
    "What's my favourite kind of gift?",
    "What's one thing I never forget?",
  ],
  confessions: [
    "What's my most embarrassing moment?",
    "What's a secret talent I have?",
    "What's my most questionable habit?",
    "What's the weirdest thing I love?",
    "What's my guilty pleasure?",
    "What's my biggest secret obsession?",
    "What's the pettiest thing I've done?",
    "What's my most delusional belief?",
    "What's something I'd never admit?",
    "What's my most chaotic decision?",
  ],
  "group-chaos": [
    "Who would survive a zombie apocalypse?",
    "Who is most likely to disappear for days?",
    "Who would accidentally become famous?",
    "Who starts the most drama?",
    "Who is always late?",
    "Who would spend all their money first?",
    "Who is the group's secret therapist?",
    "Who would get caught lying first?",
    "Who would win an argument with anyone?",
    "Who is most likely to send a risky text?",
  ],
};

const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 10;

function newQuestion(
  id: string,
  text: string,
  category: CategoryId,
  custom = false,
): Question {
  return {
    id,
    text,
    category,
    custom,
    answerMode: "text",
    answer: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
  };
}

export function QuizCreator({
  initialCategory = "friendship",
}: {
  initialCategory?: string;
}) {
  const [category, setCategory] = useState<CategoryId>(
    CATEGORIES.some((item) => item.id === initialCategory)
      ? (initialCategory as CategoryId)
      : "friendship",
  );

  const [nickname, setNickname] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [notice, setNotice] = useState("");
  const [deckIndex, setDeckIndex] = useState(0);
  const [activeAnswerId, setActiveAnswerId] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [publishError, setPublishError] = useState("");
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const activeCategory = CATEGORIES.find((item) => item.id === category)!;
  const displayName = nickname.trim() || "YOUR NAME";

  const deck = useMemo(
    () =>
      QUESTION_BANK[category].map((text, index) => ({
        id: `${category}-${index}`,
        text,
        category,
      })),
    [category],
  );

  const selectedIds = new Set(selectedQuestions.map((question) => question.id));
  const remaining = deck.filter((question) => !selectedIds.has(question.id));
  const currentPrompt = remaining.length
    ? remaining[deckIndex % remaining.length]
    : null;

  const answeredCount = selectedQuestions.filter((question) => {
    if (question.answerMode === "text") {
      return Boolean(question.answer.trim());
    }

    return (
      question.options.length === 4 &&
      question.options.every((option) => option.trim().length > 0) &&
      question.correctOptionIndex >= 0 &&
      question.correctOptionIndex < 4
    );
  }).length;

  function collectQuestion(text: string, id: string, custom = false) {
    if (selectedQuestions.some((question) => question.id === id)) {
      setNotice("Already in your lineup. Great minds think alike.");
      return;
    }

    if (selectedQuestions.length >= MAX_QUESTIONS) {
      setNotice("Your lineup is full. Remove a question to make room.");
      return;
    }

    const question = newQuestion(id, text, category, custom);

    setSelectedQuestions((current) => [...current, question]);
    setActiveAnswerId(question.id);
    setNotice("Added to your lineup. Make it yours!");
  }

  function removeQuestion(id: string) {
    setSelectedQuestions((current) => current.filter((item) => item.id !== id));

    if (activeAnswerId === id) {
      setActiveAnswerId(null);
    }

    setNotice("Question released back into the universe.");
  }

  function updateQuestion(id: string, changes: Partial<Question>) {
    setSelectedQuestions((current) =>
      current.map((question) =>
        question.id === id ? { ...question, ...changes } : question,
      ),
    );
  }

  function addCustomQuestion() {
    const text = customQuestion.trim();

    if (!text) {
      setNotice("Give your question a little personality first.");
      return;
    }

    if (selectedQuestions.length >= MAX_QUESTIONS) {
      setNotice("Your lineup is full. Remove a question to make room.");
      return;
    }

    if (
      selectedQuestions.some(
        (question) => question.text.toLowerCase() === text.toLowerCase(),
      )
    ) {
      setNotice("You've already got that question.");
      return;
    }

    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    collectQuestion(text, id, true);
    setCustomQuestion("");
  }

  function nextPrompt() {
    if (remaining.length <= 1) return;
    setDeckIndex((index) => (index + 1) % remaining.length);
    setNotice("Next up. What else have you got?");
  }

  function shufflePrompts() {
    if (remaining.length <= 1) return;

    let next = Math.floor(Math.random() * remaining.length);
    if (next === deckIndex % remaining.length) {
      next = (next + 1) % remaining.length;
    }

    setDeckIndex(next);
    setNotice("The universe has chosen another one.");
  }

  function updateOption(
    question: Question,
    optionIndex: number,
    value: string,
  ) {
    const options = [...question.options];
    options[optionIndex] = value;
    updateQuestion(question.id, { options });
  }

  
  if (showReview) {
    return (
      <main className="relative min-h-screen overflow-hidden px-5 pb-24 pt-10 text-white sm:px-8 sm:pt-14 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => setShowReview(false)}
            className="mb-10 border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-wider transition hover:border-[#D0FF72] hover:text-[#D0FF72]"
          >
            ← Back to editing
          </button>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D0FF72]">
            Final preview · Before publishing
          </p>

          <h1 className="mt-4 break-words text-[clamp(3rem,9vw,6rem)] font-black uppercase leading-[0.85] tracking-[-0.08em]">
            {nickname.trim() || "YOUR NAME"}'S
            <br />
            <span style={{ color: activeCategory.color }}>VIBE CHECK.</span>
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span
              className="px-3 py-2 text-xs font-black uppercase text-[#09090D]"
              style={{ background: activeCategory.color }}
            >
              {activeCategory.label}
            </span>
            <span className="text-xs text-white/45">
              {selectedQuestions.length} questions
            </span>
            <span className="text-xs text-white/45">
              {answeredCount} answers completed
            </span>
          </div>

          <div className="mt-10 border-y border-white/15 py-6">
            <h2 className="text-xl font-black">Your quiz, your rules.</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Review every question and its correct answer before sharing your
              quiz with your friends.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {selectedQuestions.map((question, index) => (
              <article
                key={question.id}
                className="border border-white/10 p-5 sm:p-7"
                style={{
                  background: `linear-gradient(135deg, ${activeCategory.color}0D, #111116 65%)`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: activeCategory.color }}
                  >
                    QUESTION {String(index + 1).padStart(2, "0")}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAnswerId(question.id);
                      setShowReview(false);
                    }}
                    className="shrink-0 text-[10px] font-black uppercase tracking-wide text-white/50 transition hover:text-white"
                  >
                    Edit answer ↗
                  </button>
                </div>

                <h3 className="mt-4 text-lg font-black leading-7 sm:text-2xl">
                  {question.text}
                </h3>

                {question.answerMode === "text" ? (
                  <div className="mt-5 border-l-2 pl-4 py-1" style={{ borderColor: activeCategory.color }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                      Correct answer
                    </p>
                    <p className="mt-2 break-words text-sm font-semibold">
                      {question.answer.trim() || "Answer not completed"}
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-2">
                    <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-white/40">
                      Multiple-choice answers
                    </p>

                    {question.options.map((option, optionIndex) => {
                      const isCorrect =
                        optionIndex === question.correctOptionIndex;

                      return (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-3 border px-3 py-3 text-sm"
                          style={{
                            borderColor: isCorrect
                              ? `${activeCategory.color}80`
                              : "rgba(255,255,255,0.08)",
                            background: isCorrect
                              ? `${activeCategory.color}12`
                              : "transparent",
                          }}
                        >
                          <span
                            className="grid size-7 shrink-0 place-items-center text-xs font-black"
                            style={{
                              background: isCorrect
                                ? activeCategory.color
                                : "#272731",
                              color: isCorrect ? "#09090D" : "white",
                            }}
                          >
                            {isCorrect
                              ? "✓"
                              : String.fromCharCode(65 + optionIndex)}
                          </span>

                          <span className="min-w-0 flex-1 break-words">
                            {option.trim() || `Option ${optionIndex + 1} not filled`}
                          </span>

                          {isCorrect && (
                            <span
                              className="text-[9px] font-black uppercase"
                              style={{ color: activeCategory.color }}
                            >
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}
          </div>

          
<div className="mt-10 border border-white/10 p-5 sm:p-7">
  {publishedUrl ? (
    <>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#D0FF72]">
        ✦ Quiz published successfully
      </p>

      <h2 className="mt-3 text-2xl font-black">
        It's officially a vibe.
      </h2>

      <p className="mt-2 text-sm leading-6 text-white/50">
        Your quiz is live. Share this link with your friends.
      </p>

      <div className="mt-5 break-all border border-white/10 bg-white/[0.03] p-4 text-sm">
        {publishedUrl}
      </div>

      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(publishedUrl).then(
            () => setPublishError("Link copied! Send it to your friends."),
            () => setPublishError("Copy failed. Select the link above and copy it.")
          );
        }}
        className="mt-4 w-full border border-white/15 px-5 py-4 text-sm font-black uppercase tracking-wide transition hover:border-[#D0FF72] hover:text-[#D0FF72]"
      >
        Copy quiz link ↗
      </button>

      <button
        type="button"
        onClick={() => setShowReview(false)}
        className="mt-3 w-full px-5 py-3 text-xs font-bold text-white/50 hover:text-white"
      >
        Back to creator
      </button>
    </>
  ) : (
    <>
      <h2 className="text-lg font-black">Ready to share your quiz?</h2>

      <p className="mt-2 text-xs leading-5 text-white/45">
        Publish your quiz and get a unique link. Your answer key stays private.
      </p>

      {publishError && (
        <p role="status" className="mt-4 text-sm text-[#FF78CB]">
          {publishError}
        </p>
      )}

      <button
        type="button"
        onClick={() => void publishQuiz()}
        disabled={isPublishing}
        className="mt-6 flex w-full items-center justify-between px-5 py-4 text-sm font-black uppercase tracking-wide text-[#09090D] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-50"
        style={{ background: activeCategory.color }}
      >
        <span>{isPublishing ? "Publishing your quiz..." : "Publish my quiz"}</span>
        <span className="text-xl">{isPublishing ? "…" : "↗"}</span>
      </button>

      <button
        type="button"
        onClick={() => setShowReview(false)}
        disabled={isPublishing}
        className="mt-3 w-full px-5 py-3 text-xs font-bold text-white/50 hover:text-white disabled:opacity-40"
      >
        Back to editing
      </button>
    </>
  )}
</div>

        </div>

        <Footer />
      </main>
    );
  }

  
async function publishQuiz() {
  if (isPublishing) return;

  if (
    selectedQuestions.length < MIN_QUESTIONS ||
    selectedQuestions.length > MAX_QUESTIONS ||
    answeredCount !== selectedQuestions.length
  ) {
    setPublishError("Complete at least 5 questions and all their answers first.");
    return;
  }

  setIsPublishing(true);
  setPublishError("");

  try {
    const user = await ensureAnonymousUser();

    // Generate a unique quiz ID before creating either document.
    const quizRef = doc(collection(db, "quizzes"));
    const answerKeyRef = doc(db, "quizAnswerKeys", quizRef.id);

    // Never include correct answers in the public quiz document.
    const publicQuestions = selectedQuestions.map((question) => ({
      id: question.id,
      text: question.text,
      answerMode: question.answerMode,
      ...(question.answerMode === "multiple"
        ? { options: question.options.map((option) => option.trim()) }
        : {}),
    }));

    // Keep every correct answer in the private answer-key document.
    const answers = Object.fromEntries(
      selectedQuestions.map((question) => [
        question.id,
        question.answerMode === "text"
          ? {
              answerMode: "text",
              answer: question.answer.trim(),
            }
          : {
              answerMode: "multiple",
              correctOptionIndex: question.correctOptionIndex,
            },
      ])
    );

    const batch = writeBatch(db);

    batch.set(quizRef, {
      ownerId: user.uid,
      nickname: nickname.trim() || "YOUR NAME",
      category,
      questions: publicQuestions,
      status: "published",
      createdAt: serverTimestamp(),
    });

    batch.set(answerKeyRef, {
      ownerId: user.uid,
      answers,
      createdAt: serverTimestamp(),
    });

    await batch.commit();

    setPublishedUrl(`${window.location.origin}/q/${quizRef.id}`);
  } catch (error) {
    console.error("Quiz publishing failed:", error);

    setPublishError(
      error instanceof Error
        ? `Couldn't publish your quiz: ${error.message}`
        : "Couldn't publish your quiz. Please try again."
    );
  } finally {
    setIsPublishing(false);
  }
}



  return (
    
    <main className="relative min-h-screen overflow-hidden px-5 pb-24 pt-10 text-white sm:px-8 sm:pt-14 lg:px-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 top-24 size-72 rounded-full bg-[#B8A0FF]/10 blur-[110px]" />
        <div className="absolute -left-32 top-[650px] size-72 rounded-full bg-[#FF78CB]/[0.07] blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-[1240px]">
        {/* Identity and category */}
        <header className="relative mb-12 border-b border-white/10 pb-9 sm:mb-14 sm:pb-12">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
              <span className="size-2 rounded-full bg-[#D0FF72]" />
              Creator studio
            </span>
            <span className="rotate-[-2deg] border border-[#B8A0FF]/60 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#B8A0FF]">
              Your rules, your quiz
            </span>
          </div>

          <h1 className="text-[clamp(3.2rem,8vw,7rem)] font-black uppercase leading-[0.84] tracking-[-0.085em]">
            MAKE IT
            <br />
            <span style={{ color: activeCategory.color }}>
              PERSONAL<span className="text-white">.</span>
            </span>
          </h1>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-sm leading-7 text-white/55 sm:text-base">
              Build a quiz about yourself. Drop it in the group chat. Find out
              who has actually been paying attention.
            </p>
            <span className="w-fit rotate-2 bg-[#D0FF72] px-3 py-2 text-[9px] font-black uppercase tracking-wider text-[#09090D]">
              Good vibes. Questionable results.
            </span>
          </div>

          <span aria-hidden="true" className="pointer-events-none absolute right-1 top-16 rotate-12 text-4xl text-[#FF78CB] sm:right-8 sm:top-20 sm:text-6xl">
            ✳
          </span>
        </header>

        {/* Setup */}
        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Part one</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                Set the vibe<span className="text-[#D0FF72]">.</span>
              </h2>
            </div>
            <span className="rotate-[-5deg] text-3xl text-[#B8A0FF]">✎</span>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="min-w-0">
              <div className="mb-5 flex items-center gap-3">
                <span className="text-xs font-black text-[#D0FF72]">01</span>
                <h3 className="text-xs font-bold uppercase tracking-[0.13em]">Pick your vibe</h3>
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:gap-x-7">
                {CATEGORIES.map((item, index) => {
                  const active = category === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCategory(item.id);
                        setDeckIndex(0);
                        setNotice("New category, new energy.");
                      }}
                      aria-pressed={active}
                      className={`group relative min-w-0 border-b-2 pb-4 text-left transition duration-200 hover:-translate-y-1 ${
                        index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
                      }`}
                      style={{
                        borderColor: active ? item.color : "rgba(255,255,255,0.13)",
                      }}
                    >
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span
                          className="grid size-10 place-items-center text-xl transition duration-200 group-hover:rotate-12"
                          style={{
                            background: active ? item.color : `${item.color}18`,
                            color: active ? "#09090D" : item.color,
                          }}
                        >
                          {item.symbol}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: active ? item.color : "rgba(255,255,255,.3)" }}>
                          {active ? "Selected ✓" : `0${index + 1}`}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: item.color }}>
                        {item.eyebrow}
                      </p>
                      <h4 className="mt-1 text-lg font-black tracking-[-0.055em] sm:text-2xl">{item.label}</h4>
                      <p className="mt-2 text-xs leading-5 text-white/45">{item.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-12 border-t border-dashed border-white/20 pt-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-xs font-black text-[#FF78CB]">02</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.13em]">Who's the main character?</h3>
                </div>
                <label htmlFor="nickname" className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Your display name
                </label>
                <div className="flex items-center gap-3 border-b-2 border-white/20 transition focus-within:border-[#D0FF72]">
                  <span className="text-xl text-[#FF78CB]">@</span>
                  <input
                    id="nickname"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value.slice(0, 30))}
                    maxLength={30}
                    placeholder="certified yapper"
                    className="min-w-0 flex-1 bg-transparent py-4 text-lg font-bold text-white outline-none placeholder:font-normal placeholder:text-white/25 sm:text-xl"
                  />
                  <span className="text-[10px] tabular-nums text-white/30">{nickname.length}/30</span>
                </div>
              </div>
            </div>

            {/* Live cover preview */}
            <aside className="min-w-0 lg:sticky lg:top-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D0FF72]">Live preview</p>
                  <p className="mt-1 text-xs text-white/40">Your quiz, taking shape.</p>
                </div>
                <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/40">
                  <span className="size-1.5 animate-pulse rounded-full bg-[#D0FF72]" />
                  Live
                </span>
              </div>

              <div className="relative overflow-hidden border border-white/10 p-5 transition-colors duration-300 sm:p-7" style={{ background: `linear-gradient(145deg, ${activeCategory.color}12, #14141B 48%, #0D0D12)` }}>
                <span aria-hidden="true" className="pointer-events-none absolute right-5 top-16 text-6xl opacity-10 sm:text-8xl" style={{ color: activeCategory.color }}>
                  {activeCategory.symbol}
                </span>
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <span className="text-sm font-black tracking-[-0.06em]">vibecheck<span style={{ color: activeCategory.color }}>.</span></span>
                  <span className="border px-2 py-1 text-[8px] font-black uppercase tracking-widest" style={{ borderColor: `${activeCategory.color}70`, color: activeCategory.color }}>Friend check</span>
                </div>
                <div className="relative py-10 sm:py-14">
                  <div className="mb-4 inline-block -rotate-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#09090D]" style={{ background: activeCategory.color }}>
                    {activeCategory.eyebrow}
                  </div>
                  <h2 className="break-words text-[clamp(2.5rem,6vw,4.8rem)] font-black uppercase leading-[0.84] tracking-[-0.09em]">
                    {displayName}<span style={{ color: activeCategory.color }}>'S</span>
                    <br /><span className="mt-2 block">VIBE</span>
                    <span className="mt-2 block" style={{ color: activeCategory.color }}>CHECK.</span>
                  </h2>
                  <p className="mt-5 max-w-xs text-xs leading-6 text-white/50 sm:text-sm">
                    {activeCategory.description} Think you know {nickname.trim() || "this person"}? Prove it.
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <div className="flex -space-x-2">
                    <span className="grid size-8 place-items-center rounded-full border-2 border-[#14141B] bg-[#B8A0FF] text-sm">😈</span>
                    <span className="grid size-8 place-items-center rounded-full border-2 border-[#14141B] bg-[#FF78CB] text-sm">👀</span>
                    <span className="grid size-8 place-items-center rounded-full border-2 border-[#14141B] bg-[#D0FF72] text-sm">✨</span>
                  </div>
                  <p className="text-right text-[9px] font-bold uppercase leading-4 tracking-wider text-white/35">
                    Made for the group chat<br />Drama potential: high
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between px-4 py-4 text-xs font-black uppercase tracking-wider text-[#09090D]" style={{ background: activeCategory.color }}>
                  <span>Let's find out</span><span className="text-lg">↗</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Question playground */}
        <section id="question-builder" className="scroll-mt-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8A0FF]">Part two · The playground</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-none tracking-[-0.07em] sm:text-5xl">
                Collect your questions<span className="text-[#D0FF72]">.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
                Keep the good ones. Skip the boring ones. This is your quiz.
              </p>
            </div>
            <div className="rotate-[-2deg] px-4 py-3 text-black" style={{ background: activeCategory.color }}>
              <p className="text-[9px] font-black uppercase tracking-wider">Your lineup</p>
              <p className="mt-1 text-2xl font-black leading-none">{selectedQuestions.length}<span className="text-sm"> / {MAX_QUESTIONS}</span></p>
            </div>
          </div>

          {/* Prompt deck */}
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                {activeCategory.label} deck
              </span>
              <span className="text-[10px] font-bold text-white/35">
                {remaining.length} prompts left to discover
              </span>
            </div>

            {currentPrompt ? (
              <div key={currentPrompt.id} className="relative">
                <span aria-hidden="true" className="absolute -left-2 -top-5 z-10 -rotate-12 text-4xl text-[#FF78CB] sm:-left-5 sm:text-5xl">✳</span>
                <span aria-hidden="true" className="absolute -right-1 bottom-16 z-10 rotate-12 text-4xl text-[#B8A0FF] sm:-right-5 sm:text-5xl">✦</span>

                <div className="relative overflow-hidden border-2 border-white/15 p-6 transition-all duration-200 sm:p-10" style={{ background: `linear-gradient(140deg, ${activeCategory.color}18, #111116 65%)` }}>
                  <div className="absolute right-4 top-3 text-7xl font-black opacity-[0.07] sm:right-8 sm:top-5 sm:text-9xl">
                    {activeCategory.symbol}
                  </div>

                  <div className="relative flex items-center justify-between gap-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: activeCategory.color }}>
                      QUESTION DROP
                    </span>
                    <span className="rotate-2 bg-white px-2 py-1 text-[9px] font-black uppercase text-black">
                      {currentPrompt.category === "group-chaos" ? "chaos mode" : "your story"}
                    </span>
                  </div>

                  <p className="relative mt-8 max-w-2xl text-[clamp(1.8rem,5vw,3.5rem)] font-black leading-[1.02] tracking-[-0.065em] sm:mt-10">
                    {currentPrompt.text}
                  </p>

                  <div className="relative mt-8 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => collectQuestion(currentPrompt.text, currentPrompt.id)}
                      disabled={selectedQuestions.length >= 10}
                      className="flex flex-1 items-center justify-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-wide text-black transition hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ background: activeCategory.color }}
                    >
                      <span className="text-lg">＋</span> Add to my quiz
                    </button>
                    <button
                      type="button"
                      onClick={nextPrompt}
                      disabled={remaining.length <= 1}
                      className="border border-white/15 px-5 py-4 text-xs font-black uppercase tracking-wide text-white/70 transition hover:border-white/40 hover:text-white disabled:opacity-30"
                    >
                      Skip ↗
                    </button>
                    <button
                      type="button"
                      onClick={shufflePrompts}
                      disabled={remaining.length <= 1}
                      aria-label="Shuffle questions"
                      className="grid size-12 place-items-center border border-white/15 text-xl text-[#B8A0FF] transition hover:rotate-12 hover:border-[#B8A0FF] disabled:opacity-30"
                    >
                      ⤨
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/20 px-5 py-12 text-center">
                <p className="text-4xl text-[#D0FF72]">✦</p>
                <h3 className="mt-4 text-xl font-black">You cleared the deck.</h3>
                <p className="mt-2 text-sm text-white/45">Add your own question or switch categories to discover more.</p>
              </div>
            )}

            {notice && (
              <p role="status" aria-live="polite" className="mt-4 text-center text-xs font-bold" style={{ color: activeCategory.color }}>
                {notice}
              </p>
            )}
          </div>

          {/* Category deck shortcuts */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCategory(item.id);
                  setDeckIndex(0);
                  setNotice(`Switched to ${item.label}.`);
                }}
                className="border px-3 py-2 text-[9px] font-black uppercase tracking-wider transition hover:-translate-y-0.5"
                style={{
                  borderColor: category === item.id ? item.color : "rgba(255,255,255,.12)",
                  color: category === item.id ? item.color : "rgba(255,255,255,.5)",
                  background: category === item.id ? `${item.color}12` : "transparent",
                }}
              >
                {item.symbol} {item.label}
              </button>
            ))}
          </div>

          {/* Custom question */}
          <div className="mx-auto mt-12 max-w-3xl border-l-2 border-[#FF78CB] bg-white/[0.025] p-5 sm:p-7">
            <div className="mb-5 flex items-start gap-4">
              <span className="text-3xl text-[#FF78CB]">✎</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF78CB]">Your plot twist</p>
                <h3 className="mt-1 text-xl font-black sm:text-2xl">Write your own question.</h3>
                <p className="mt-2 text-xs leading-5 text-white/45">Inside jokes belong here. Make it something only your people know.</p>
              </div>
            </div>

            <form onSubmit={(event) => { event.preventDefault(); addCustomQuestion(); }}>
              <label htmlFor="custom-question" className="sr-only">Write your own question</label>
              <textarea
                id="custom-question"
                value={customQuestion}
                onChange={(event) => setCustomQuestion(event.target.value.slice(0, 160))}
                maxLength={160}
                rows={2}
                placeholder="What's something only my bestie knows about me?"
                className="w-full resize-y border-b-2 border-white/20 bg-transparent px-1 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#FF78CB]"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[10px] text-white/30">{customQuestion.length}/160 characters</span>
                <button type="submit" disabled={selectedQuestions.length >= 10 || !customQuestion.trim()} className="flex items-center gap-3 bg-[#FF78CB] px-5 py-3 text-xs font-black uppercase tracking-wide text-[#09090D] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">
                  Collect custom question ↗
                </button>
              </div>
            </form>
          </div>

          {/* Collected lineup */}
          <div className="mt-14">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-black tracking-tight">Your collection<span className="text-[#D0FF72]">.</span></h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">{selectedQuestions.length} collected</span>
            </div>

            {selectedQuestions.length === 0 ? (
              <div className="border border-dashed border-white/20 px-5 py-10 text-center">
                <p className="text-3xl">🪩</p>
                <p className="mt-3 text-sm font-bold">Your collection starts with one.</p>
                <p className="mt-1 text-xs text-white/40">Add a prompt from the deck above.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`relative border p-4 transition hover:-translate-y-0.5 ${
                      index % 2 === 0 ? "rotate-[-0.5deg]" : "rotate-[0.5deg]"
                    }`}
                    style={{
                      borderColor: `${activeCategory.color}55`,
                      background: `linear-gradient(135deg, ${activeCategory.color}12, rgba(255,255,255,.015))`,
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: activeCategory.color }}>
                        #{String(index + 1).padStart(2, "0")} · {question.custom ? "YOUR CREATION" : "COLLECTED"}
                      </span>
                      <button type="button" onClick={() => removeQuestion(question.id)} aria-label={`Remove ${question.text}`} className="text-lg text-white/35 transition hover:text-[#FF78CB]">×</button>
                    </div>
                    <p className="pr-2 text-sm font-bold leading-6">{question.text}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAnswerId(question.id);
                        document.getElementById(`answer-${question.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider"
                      style={{ color: activeCategory.color }}
                    >
                      Set the answer <span>↗</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Answer playground */}
        <section id="answer-builder" className="mt-20 scroll-mt-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF78CB]">Part three · Inside knowledge</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-none tracking-[-0.07em] sm:text-5xl">
                Lock in answers<span className="text-[#D0FF72]">.</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
                Pick a question. Decide what counts as the right answer. Make it yours.
              </p>
            </div>
            <div className="rotate-2 border border-white/15 px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Answer streak</p>
              <p className="mt-1 text-2xl font-black"><span style={{ color: activeCategory.color }}>{answeredCount}</span><span className="text-sm text-white/40"> / {selectedQuestions.length}</span></p>
            </div>
          </div>

          {selectedQuestions.length === 0 ? (
            <div className="border border-dashed border-white/20 px-5 py-10 text-center">
              <p className="text-3xl text-[#B8A0FF]">↟</p>
              <p className="mt-3 text-sm font-bold">Your answer playground is waiting.</p>
              <p className="mt-1 text-xs text-white/40">Collect questions first, then come back to lock in the answers.</p>
              <button type="button" onClick={() => document.getElementById("question-builder")?.scrollIntoView({ behavior: "smooth" })} className="mt-5 text-xs font-black uppercase tracking-wide text-[#D0FF72]">Back to the deck ↑</button>
            </div>
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              {/* Choose a question */}
              <div>
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Choose your next move</p>
                <div className="space-y-2">
                  {selectedQuestions.map((question, index) => {
                    const complete = question.answerMode === "text"
                      ? Boolean(question.answer.trim())
                      : question.options.every((option) => option.trim()) &&
                        question.correctOptionIndex >= 0 &&
                        question.correctOptionIndex < 4;

                    const active = activeAnswerId === question.id;

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => setActiveAnswerId(question.id)}
                        className="flex w-full items-start gap-3 border p-3 text-left transition hover:translate-x-1"
                        style={{
                          borderColor: active ? activeCategory.color : "rgba(255,255,255,.1)",
                          background: active ? `${activeCategory.color}12` : "rgba(255,255,255,.015)",
                        }}
                      >
                        <span className="grid size-8 shrink-0 place-items-center text-[10px] font-black" style={{ background: complete ? activeCategory.color : "#272731", color: complete ? "#09090D" : "white" }}>
                          {complete ? "✓" : String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 text-xs font-semibold leading-5">{question.text}</span>
                        <span className="pt-1 text-xs" style={{ color: activeCategory.color }}>{active ? "●" : "↗"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active answer editor */}
              <div className="min-w-0">
                {(() => {
                  const question = selectedQuestions.find((item) => item.id === activeAnswerId) ?? selectedQuestions[0];

                  if (!question) return null;

                  const mode = question.answerMode;
                  const complete = mode === "text"
                    ? Boolean(question.answer.trim())
                    : question.options.every((option) => option.trim()) &&
                      question.correctOptionIndex >= 0 &&
                      question.correctOptionIndex < 4;

                  return (
                    <div id={`answer-${question.id}`} className="relative border border-white/10 p-5 sm:p-7" style={{ background: `linear-gradient(145deg, ${activeCategory.color}10, #111116 55%)` }}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: activeCategory.color }}>
                          QUESTION {selectedQuestions.findIndex((item) => item.id === question.id) + 1}
                        </span>
                        <span className="rotate-2 px-2 py-1 text-[9px] font-black uppercase" style={{ background: complete ? activeCategory.color : "#292932", color: complete ? "#09090D" : "#B7B7C5" }}>
                          {complete ? "Locked in ✓" : "Your move"}
                        </span>
                      </div>

                      <h3 className="mt-5 text-2xl font-black leading-tight tracking-[-0.05em] sm:text-3xl">{question.text}</h3>

                      <p className="mt-3 text-xs leading-5 text-white/40">
                        How should your friends answer this one?
                      </p>

                      <div className="mt-6 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuestion(question.id, { answerMode: "text" })}
                          className="border px-3 py-3 text-left transition"
                          style={{ borderColor: mode === "text" ? activeCategory.color : "rgba(255,255,255,.12)", background: mode === "text" ? `${activeCategory.color}14` : "transparent" }}
                        >
                          <span className="block text-lg">✎</span>
                          <span className="mt-2 block text-[10px] font-black uppercase">Free-text</span>
                          <span className="mt-1 block text-[9px] text-white/40">Type the answer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQuestion(question.id, { answerMode: "multiple" })}
                          className="border px-3 py-3 text-left transition"
                          style={{ borderColor: mode === "multiple" ? activeCategory.color : "rgba(255,255,255,.12)", background: mode === "multiple" ? `${activeCategory.color}14` : "transparent" }}
                        >
                          <span className="block text-lg">☷</span>
                          <span className="mt-2 block text-[10px] font-black uppercase">Multiple choice</span>
                          <span className="mt-1 block text-[9px] text-white/40">Pick one winner</span>
                        </button>
                      </div>

                      {mode === "text" ? (
                        <div className="mt-7">
                          <label htmlFor={`text-answer-${question.id}`} className="mb-3 block text-[9px] font-black uppercase tracking-widest text-white/40">
                            The answer only you know
                          </label>
                          <input
                            id={`text-answer-${question.id}`}
                            value={question.answer}
                            onChange={(event) => updateQuestion(question.id, { answer: event.target.value.slice(0, 200) })}
                            maxLength={200}
                            placeholder={category === "group-chaos" ? "Drop the person's name..." : "Type your correct answer..."}
                            className="w-full border-b-2 bg-transparent py-4 text-lg font-bold outline-none placeholder:font-normal placeholder:text-white/25"
                            style={{ borderColor: question.answer.trim() ? activeCategory.color : "rgba(255,255,255,.18)" }}
                          />
                          <p className="mt-3 text-[10px] leading-5 text-white/35">
                            You can decide how answers are matched when we build the quiz-taking experience.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-7">
                          <p className="mb-4 text-[9px] font-black uppercase tracking-widest text-white/40">
                            Tap a letter to mark the correct answer
                          </p>
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => {
                              const correct = question.correctOptionIndex === optionIndex;

                              return (
                                <div key={optionIndex} className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    aria-pressed={correct}
                                    aria-label={`Mark option ${String.fromCharCode(65 + optionIndex)} as correct`}
                                    onClick={() => updateQuestion(question.id, { correctOptionIndex: optionIndex })}
                                    className="grid size-10 shrink-0 place-items-center border-2 text-xs font-black transition hover:scale-105"
                                    style={{ borderColor: correct ? activeCategory.color : "rgba(255,255,255,.15)", background: correct ? activeCategory.color : "transparent", color: correct ? "#09090D" : "white" }}
                                  >
                                    {correct ? "✓" : String.fromCharCode(65 + optionIndex)}
                                  </button>
                                  <input
                                    value={option}
                                    onChange={(event) => updateOption(question, optionIndex, event.target.value.slice(0, 120))}
                                    maxLength={120}
                                    aria-label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                    placeholder={`Write option ${String.fromCharCode(65 + optionIndex)}...`}
                                    className="min-w-0 flex-1 border-b border-white/15 bg-transparent py-3 text-sm outline-none placeholder:text-white/25 focus:border-[#D0FF72]"
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <p className="mt-4 text-[10px] leading-5 text-white/35">
                            Fill all four options. Tap the letter beside the correct one.
                          </p>
                        </div>
                      )}

                      <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">
                          {complete ? "This answer is ready" : "One question at a time"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const index = selectedQuestions.findIndex((item) => item.id === question.id);
                            const next = selectedQuestions[index + 1];
                            if (next) {
                              setActiveAnswerId(next.id);
                            } else {
                              setActiveAnswerId(null);
                              setNotice("You've reached the end of your lineup!");
                            }
                          }}
                          className="px-3 py-2 text-[10px] font-black uppercase tracking-wide transition hover:translate-x-1"
                          style={{ color: activeCategory.color }}
                        >
                          Next question →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="mt-10 border-t border-white/15 pt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-white/60">
                {selectedQuestions.length < MIN_QUESTIONS
                  ? `Collect ${MIN_QUESTIONS - selectedQuestions.length} more question(s).`
                  : answeredCount < selectedQuestions.length
                    ? `${selectedQuestions.length - answeredCount} answer(s) still need work.`
                    : "Every question has an answer. Looking good!"}
              </p>
              <span className="shrink-0 text-xs font-black text-[#D0FF72]">
                {answeredCount}/{selectedQuestions.length}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden bg-white/10">
              <div className="h-full transition-all duration-300" style={{ width: `${selectedQuestions.length ? (answeredCount / selectedQuestions.length) * 100 : 0}%`, background: activeCategory.color }} />
            </div>

            <button
              type="button"
              disabled={selectedQuestions.length < MIN_QUESTIONS || answeredCount !== selectedQuestions.length}
              onClick={() => { setPublishError(""); setShowReview(true); }}
              className="mt-6 flex w-full items-center justify-between px-5 py-4 text-sm font-black uppercase tracking-wide text-[#09090D] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: activeCategory.color }}
            >
              <span>{selectedQuestions.length < MIN_QUESTIONS ? `Collect at least ${MIN_QUESTIONS} questions` : answeredCount !== selectedQuestions.length ? "Finish the answers" : "Ready for the next step"}</span>
              <span className="text-xl">↗</span>
            </button>

            <p className="mt-3 text-center text-[10px] leading-5 text-white/30">
              YOUR QUIZ IS READY FOR REVIEW · PUBLISHING SAVES IT TO FIREBASE
            </p>
          </div>
        </section>
      </div>
     <Footer />  
    </main>
  );
}
