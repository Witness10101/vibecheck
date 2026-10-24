
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Home", href: "/", icon: "⌂" },
  { label: "Explore", href: "/explore", icon: "✳" },
  { label: "Play", href: "/challenges", icon: "⚡", featured: true },
  { label: "Quizzes", href: "/my-quizzes", icon: "▤" },
  { label: "Friends", href: "/friends", icon: "♧" },
  { label: "Profile", href: "/profile", icon: "☺" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 px-2 pt-3 md:hidden"
    >
      <div className="relative mx-auto flex max-w-lg items-end justify-around rounded-[26px] border border-white/[0.12] bg-[#17151F]/95 px-1 pb-2 pt-2 shadow-[0_12px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-5 left-1/2 h-12 w-32 -translate-x-1/2 rounded-full bg-violet-500/15 blur-2xl"
        />

        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          if (item.featured) {
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label="Play challenges"
                aria-current={active ? "page" : undefined}
                className="group relative -mt-6 flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D0FF72]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-[17px] border border-[#e0ffa0]/70 bg-[#D0FF72] text-xl text-[#171910] shadow-[0_0_24px_rgba(208,255,114,0.2),0_4px_0_#789A34] transition duration-200 group-hover:-translate-y-1 group-active:translate-y-0 sm:h-[50px] sm:w-[50px] sm:text-2xl">
                  {item.icon}
                </span>

                <span className="text-[9px] font-black uppercase tracking-[0.08em] text-[#D0FF72] sm:text-[10px]">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="group flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D0FF72]"
            >
              <span
                className={`flex h-8 w-9 items-center justify-center rounded-xl text-xl transition-all duration-200 sm:h-9 sm:w-10 sm:text-[23px] ${
                  active
                    ? "bg-violet-400/15 text-[#D0FF72]"
                    : "text-white/55 group-hover:bg-white/5 group-hover:text-white/90"
                }`}
              >
                {item.icon}
              </span>

              <span
                className={`whitespace-nowrap text-[9px] font-semibold sm:text-[10px] ${
                  active ? "text-white" : "text-white/55"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
