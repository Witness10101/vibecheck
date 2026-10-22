
import Link from "next/link";
import { VibeCheckIcon } from "@/ui/VibeCheckIcon";

export function FinalCTA() {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-8 sm:py-24 lg:py-32">
      <div className="final-cta relative isolate overflow-hidden rounded-[30px] border border-white/10 px-5 py-14 text-center sm:rounded-[40px] sm:px-10 sm:py-20 lg:py-24">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[#111019]" />
        <div className="final-cta-glow pointer-events-none absolute -left-20 top-0 -z-10 h-72 w-72 rounded-full bg-violet-600/30 blur-[100px]" />
        <div className="final-cta-glow final-cta-glow-lime pointer-events-none absolute -right-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-[#D0FF72]/20 blur-[100px]" />

        {/* Decorative rings */}
        <div className="final-cta-ring pointer-events-none absolute left-[-70px] top-[-90px] -z-10 h-64 w-64 rounded-full border border-violet-300/15 sm:left-[-35px] sm:top-[-100px] sm:h-80 sm:w-80" />
        <div className="final-cta-ring final-cta-ring-two pointer-events-none absolute bottom-[-120px] right-[-70px] -z-10 h-72 w-72 rounded-full border border-[#D0FF72]/15 sm:right-[-30px] sm:h-96 sm:w-96" />

        {/* Floating stickers */}
        <div className="final-cta-sticker absolute left-4 top-6 rotate-[-10deg] rounded-xl border border-violet-300/20 bg-[#21182F] px-3 py-2 text-[9px] font-black tracking-wider text-violet-200 sm:left-12 sm:top-12 sm:px-4 sm:py-3 sm:text-xs">
          NO FILTER 💀
        </div>

        <div className="final-cta-sticker final-cta-sticker-two absolute right-4 top-8 rotate-[9deg] rounded-xl bg-[#D0FF72] px-3 py-2 text-[9px] font-black tracking-wider text-[#171910] sm:right-12 sm:top-14 sm:px-4 sm:py-3 sm:text-xs">
          ALL RECEIPTS. 👀
        </div>

        {/* Mascot */}
        <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center sm:mb-9 sm:h-28 sm:w-28">
          <div className="absolute inset-0 rounded-full bg-[#D0FF72]/10 blur-2xl" />
          <div className="relative rotate-[-8deg] transition duration-500 hover:rotate-[8deg] hover:scale-110">
            <VibeCheckIcon size={88} />
          </div>
          <span className="absolute -right-1 top-0 rotate-12 text-2xl text-[#FF78CB] sm:text-3xl">
            ✳
          </span>
        </div>

        {/* Headline */}
        <p className="mb-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#B8A0FF] sm:text-xs">
          YOUR SIGN TO START SOMETHING
        </p>

        <h2 className="mx-auto max-w-4xl text-[clamp(2.7rem,10vw,7rem)] font-black leading-[0.84] tracking-[-0.085em]">
          YOUR GROUP
          <br />
          CHAT IS
          <br />
          <span className="text-[#D0FF72]">WAITING.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-white/55 sm:mt-8 sm:text-base sm:leading-7">
          Make the quiz. Drop the link. Watch the allegations
          fly. Your friends will never let you forget this.
        </p>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:mt-10">
          <Link
            href="/create"
            className="group inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-4 rounded-full bg-[#D0FF72] px-7 py-4 text-sm font-black text-[#11130B] shadow-[0_0_40px_rgba(208,255,114,0.12)] transition duration-300 hover:scale-[1.03] hover:shadow-[0_0_55px_rgba(208,255,114,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#111019] sm:w-auto"
          >
            MAKE MY QUIZ
            <span className="text-xl transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
              ↗
            </span>
          </Link>

          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
            YOUR PEOPLE. YOUR CHAOS. YOUR RULES.
          </p>
        </div>

        {/* Bottom reaction */}
        <div className="mx-auto mt-12 flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2.5 sm:mt-16">
          <span className="text-base">🤝</span>
          <span className="text-[10px] font-bold text-white/50 sm:text-xs">
            Friendship tested. Group chat activated.
          </span>
          <span className="text-base">💀</span>
        </div>
      </div>
    </section>
  );
}
