
import Link from "next/link";
import { VibeCheckIcon } from "@/ui/VibeCheckIcon";

const footerLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Challenges", href: "#challenges" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden px-4 pb-5 pt-16 sm:px-6 sm:pt-24">
      {/* Atmospheric glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-72 w-[min(800px,100%)] -translate-x-1/2 rounded-full bg-violet-600/[0.13] blur-[100px]"
      />

      <div className="mx-auto max-w-7xl">
        {/* Main footer panel */}
        <div className="relative overflow-hidden rounded-[30px] border border-white/[0.10] bg-[#121119] p-6 sm:rounded-[40px] sm:p-10 lg:p-14">
          {/* Decorative shapes */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-violet-400/15 sm:h-80 sm:w-80"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-5 -top-10 h-48 w-48 rounded-full border border-violet-400/10 sm:h-64 sm:w-64"
          />

          <div className="relative grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            {/* Brand statement */}
            <div>
              <div className="flex items-center gap-3">
                <VibeCheckIcon size={48} />
                <span className="text-2xl font-black tracking-[-1.5px] sm:text-3xl">
                  Vibe<span className="text-[#D0FF72]">Check</span>
                  <span className="text-violet-400">.</span>
                </span>
              </div>

              <h2 className="mt-9 text-4xl font-black leading-[0.98] tracking-[-2px] sm:text-6xl lg:text-7xl">
                YOUR PEOPLE.
                <br />
                YOUR <span className="text-[#D0FF72]">CHAOS.</span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/50 sm:text-base">
                Friendship tests, questionable scores, and group-chat
                lore. Find out who really knows you.
              </p>

              <a
                href="#challenges"
                className="group mt-7 inline-flex items-center gap-3 rounded-full bg-[#D0FF72] py-3 pl-5 pr-3 text-sm font-black text-[#171910] transition hover:-translate-y-0.5 hover:bg-[#ddff9b]"
              >
                MAKE SOME CHAOS
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-lg transition-transform group-hover:rotate-45">
                  ↗
                </span>
              </a>
            </div>

            {/* Navigation */}
            <div className="lg:justify-self-end lg:min-w-56">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300">
                FIND YOUR WAY
              </p>

              <nav
                aria-label="Footer navigation"
                className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-2"
              >
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="w-fit text-sm text-white/60 transition hover:translate-x-1 hover:text-[#D0FF72]"
                  >
                    {link.label} ↗
                  </Link>
                ))}
              </nav>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#D0FF72] shadow-[0_0_10px_#D0FF72]" />
                <span className="text-xs font-medium text-white/60">
                  Good vibes. Friendly chaos.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="relative mt-12 flex flex-col gap-3 border-t border-white/[0.09] pt-5 text-xs text-white/35 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} VibeCheck. All vibes reserved.</p>
            <p className="flex items-center gap-1.5">
              Built for the group chat
              <span className="text-violet-300">✳</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
