
import Link from "next/link";
import { VibeCheckIcon } from "@/ui/VibeCheckIcon";

const vibes = [
  {
    id: "personality",
    n: "01",
    category: "PERSONALITY TEST",
    title: "WHO ARE YOU,\nREALLY?",
    description: "Your friend-group alter ego. No appeals. No refunds.",
    color: "#B8A0FF",
    bg: "vibe-purple",
    emoji: "👾",
    sticker: "MAIN CHARACTER",
  },
  {
    id: "friendship",
    n: "02",
    category: "FRIENDSHIP CHECK",
    title: "WHO KNOWS\nYOU BEST?",
    description: "Put your besties to the test. Fake friends, beware.",
    color: "#D0FF72",
    bg: "vibe-lime",
    emoji: "✳",
    sticker: "BESTIE DETECTOR",
  },
  {
    id: "confessions",
    n: "03",
    category: "CONFESSION MODE",
    title: "SPILL THE\nTEA.",
    description: "Hot takes, questionable secrets, zero chill.",
    color: "#FF78CB",
    bg: "vibe-pink",
    emoji: "♥",
    sticker: "NO SCREENSHOTS...",
  },
  {
    id: "group-chaos",
    n: "04",
    category: "GROUP CHAT ENERGY",
    title: "EXPOSE THE\nSQUAD.",
    description: "Who's most likely to cause drama, then vanish?",
    color: "#75CFFF",
    bg: "vibe-blue",
    emoji: "⚡",
    sticker: "UNDER INVESTIGATION",
  },
];

function VibeArtwork({
  vibe,
}: {
  vibe: (typeof vibes)[number];
}) {
  return (
    <div
      className={`vibe-art ${vibe.bg}`}
      style={{ "--vibe": vibe.color } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="vibe-art-orbit" />
      <span className="vibe-art-ring" />

      {vibe.id === "personality" ? (
        <div className="vibe-blob">
          <span className="vibe-eye vibe-eye-left" />
          <span className="vibe-eye vibe-eye-right" />
          <span className="vibe-mouth" />
        </div>
      ) : vibe.id === "friendship" ? (
        <div className="vibe-star">
          <VibeCheckIcon size={112} />
        </div>
      ) : vibe.id === "confessions" ? (
        <div className="vibe-heart">
          <span>♥</span>
          <i />
        </div>
      ) : (
        <div className="vibe-bolt">
          <span>ϟ</span>
        </div>
      )}

      <span className="vibe-art-spark vibe-spark-one">✳</span>
      <span className="vibe-art-spark vibe-spark-two">✦</span>
      <span className="vibe-art-caption">{vibe.sticker}</span>
    </div>
  );
}

export function VibeCategories() {
  return (
    <section
      id="challenges"
      className="relative mx-auto max-w-[1440px] overflow-hidden px-5 py-24 sm:px-8 sm:py-32"
    >
      {/* Editorial heading */}
      <div className="relative mb-12 sm:mb-16">
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-full border border-violet-300/30 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">
            ✳ Find your kind of chaos
          </span>
          <span className="hidden text-xs font-bold text-white/25 sm:inline">
            FOUR WAYS TO EXPOSE YOURSELF
          </span>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-4xl text-[clamp(3.5rem,9vw,7.5rem)] font-black leading-[0.79] tracking-[-0.09em]">
            PICK YOUR
            <br />
            <span className="text-[#D0FF72]">VIBE</span>
            <span className="text-[#B8A0FF]">.</span>
          </h2>

          <div className="max-w-sm pb-1">
            <p className="text-lg font-bold leading-snug text-white/80 sm:text-xl">
              Same friends.
              <br />
              <span className="text-white/40">Different kinds of chaos.</span>
            </p>
            <p className="mt-3 text-sm leading-6 text-white/40">
              Pick a vibe. Create your quiz. Let the group chat deal with it.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive editorial grid */}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {vibes.map((vibe, index) => (
          <Link
            key={vibe.id}
            href={`/create?category=${vibe.id}`}
            className={`vibe-tile group ${vibe.bg} ${
              index % 2 === 1 ? "sm:translate-y-7 xl:translate-y-5" : ""
            }`}
            style={{ "--vibe": vibe.color } as React.CSSProperties}
          >
            <div className="vibe-tile-top">
              <span className="vibe-number">{vibe.n}</span>
              <span className="vibe-category">{vibe.category}</span>
            </div>

            <VibeArtwork vibe={vibe} />

            <div className="vibe-tile-copy">
              <h3 className="whitespace-pre-line text-[clamp(2rem,3.3vw,3rem)] font-black leading-[0.88] tracking-[-0.075em]">
                {vibe.title.split("\n").map((line, i) => (
                  <span key={line}>
                    {i > 0 && <br />}
                    {i === 1 ? (
                      <span style={{ color: vibe.color }}>{line}</span>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </h3>

              <p className="mt-4 max-w-[270px] text-sm leading-6 text-white/55">
                {vibe.description}
              </p>
            </div>

            <div className="vibe-tile-action">
              <span>CREATE THIS QUIZ</span>
              <span className="vibe-action-arrow">↗</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom call to action */}
      <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-7 sm:mt-24 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#09090D] bg-violet-400">😈</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#09090D] bg-pink-400">💅</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#09090D] bg-lime-300">👀</span>
          </div>
          <p className="text-xs font-bold text-white/45">
            YOUR FRIEND GROUP ISN'T READY.
          </p>
        </div>

        <Link
          href="/create"
          className="group inline-flex w-full items-center justify-center gap-4 rounded-full bg-[#D0FF72] px-6 py-4 text-sm font-black text-[#11130B] transition hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(208,255,114,0.2)] sm:w-auto"
        >
          CREATE YOUR OWN
          <span className="text-lg transition-transform group-hover:translate-x-1">
            ↗
          </span>
        </Link>
      </div>
    </section>
  );
}
