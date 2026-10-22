
const steps = [
  {
    number: "01",
    tag: "THE SETUP",
    title: "Pick your\nanswers.",
    description: "Your secrets. Your rules. Let's see what your friends really know.",
    accent: "#D0FF72",
    emoji: "🤫",
    note: "KEEP IT MYSTERIOUS",
    rotation: "sm:rotate-[-2deg]",
  },
  {
    number: "02",
    tag: "SPREAD THE CHAOS",
    title: "Drop it in\nthe group chat.",
    description: "One link. Your entire friend group. Absolutely no peace.",
    accent: "#B8A0FF",
    emoji: "📲",
    note: "SENT AT 2:13 AM",
    rotation: "sm:rotate-[2deg]",
  },
  {
    number: "03",
    tag: "THE REVEAL",
    title: "Find out\nwho's real.",
    description: "Expose the real ones, question the suspicious ones, start the debate.",
    accent: "#FF78CB",
    emoji: "👀",
    note: "FRIENDSHIP AUDIT: ON",
    rotation: "sm:rotate-[-1deg]",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative mx-auto max-w-7xl overflow-hidden px-5 py-24 sm:px-8 sm:py-32"
    >
      {/* Section intro */}
      <div className="relative mb-14 flex flex-col gap-6 sm:mb-20 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D0FF72]/20 bg-[#D0FF72]/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D0FF72]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D0FF72]">
              Three steps. Maximum chaos.
            </span>
          </div>

          <h2 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[0.88] tracking-[-0.075em]">
            LET'S TEST
            <br />
            THAT{" "}
            <span className="relative inline-block text-[#D0FF72]">
              FRIENDSHIP.
              <svg
                viewBox="0 0 300 12"
                className="absolute -bottom-2 left-0 w-full"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8C72 1 214 2 296 7"
                  stroke="#B8A0FF"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
        </div>

        <p className="max-w-xs text-sm leading-6 text-white/45 sm:pb-2">
          It takes a link to start it.
          <br />
          It takes a real friend to survive it.
          <span className="ml-1 text-[#FF78CB]">♡</span>
        </p>
      </div>

      {/* Step cards */}
      <div className="relative grid gap-5 md:grid-cols-3 md:items-start">
        {steps.map((step, index) => (
          <article
            key={step.number}
            className={`group relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-[#121118]/80 p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-white/25 sm:p-7 ${step.rotation} ${
              index === 1 ? "md:mt-12" : ""
            }`}
          >
            {/* Accent glow */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full opacity-[0.09] blur-[55px] transition duration-500 group-hover:opacity-25"
              style={{ backgroundColor: step.accent }}
            />

            {/* Card header */}
            <div className="flex items-start justify-between">
              <span
                className="text-xs font-black tracking-[0.2em]"
                style={{ color: step.accent }}
              >
                STEP {step.number}
              </span>

              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl transition duration-500 group-hover:rotate-[-10deg] group-hover:scale-110"
                aria-hidden="true"
              >
                {step.emoji}
              </span>
            </div>

            {/* Oversized number */}
            <div
              className="mt-7 select-none text-[clamp(5rem,10vw,8rem)] font-black leading-[0.8] tracking-[-0.1em] transition duration-500 group-hover:translate-x-2"
              style={{
                color: step.accent,
                opacity: 0.13,
              }}
              aria-hidden="true"
            >
              {step.number}
            </div>

            {/* Main content */}
            <div className="mt-7">
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.22em] text-white/35">
                {step.tag}
              </p>

              <h3 className="whitespace-pre-line text-3xl font-black leading-[0.98] tracking-[-0.055em] sm:text-4xl">
                {step.title.split("\n").map((line, lineIndex) => (
                  <span key={line}>
                    {lineIndex > 0 && <br />}
                    {lineIndex === 1 ? (
                      <span style={{ color: step.accent }}>{line}</span>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </h3>

              <p className="mt-4 max-w-[270px] text-sm leading-6 text-white/50">
                {step.description}
              </p>
            </div>

            {/* Bottom signature */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
              <span
                className="text-[9px] font-black uppercase tracking-[0.13em]"
                style={{ color: step.accent }}
              >
                {step.note}
              </span>

              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                style={{ color: step.accent }}
                aria-hidden="true"
              >
                ↗
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Closing punchline */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center sm:mt-16">
        <span className="text-sm text-white/40">
          Sounds easy, right?
        </span>
        <span className="text-sm font-black text-[#D0FF72]">
          Famous last words. 💀
        </span>
      </div>
    </section>
  );
}
