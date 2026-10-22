
export function ChaosBackground() {
  return (
    <div
      aria-hidden="true"
      className="chaos-world pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Ambient liquid lighting */}
      <div className="chaos-liquid absolute inset-0" />

      <div className="chaos-orb chaos-orb-purple absolute -left-40 top-[8%] h-[380px] w-[380px] rounded-full sm:h-[560px] sm:w-[560px]" />
      <div className="chaos-orb chaos-orb-lime absolute -right-40 top-[28%] h-[300px] w-[300px] rounded-full sm:h-[440px] sm:w-[440px]" />
      <div className="chaos-orb chaos-orb-pink absolute -left-32 top-[65%] h-[320px] w-[320px] rounded-full sm:h-[440px] sm:w-[440px]" />

      {/* Liquid chrome accents */}
      <div className="chaos-chrome chaos-chrome-one absolute left-[8%] top-[34%]" />
      <div className="chaos-chrome chaos-chrome-two absolute right-[7%] top-[70%]" />

      {/* Hand-drawn star */}
      <svg
        viewBox="0 0 100 100"
        className="chaos-doodle chaos-doodle-star absolute left-[5%] top-[20%] w-14 text-[#D0FF72] sm:left-[12%] sm:w-20"
        fill="none"
      >
        <path
          d="M50 5L60 36L92 26L69 50L91 73L60 64L50 95L40 64L9 74L31 50L8 27L40 36Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>

      {/* Sketchy arrow */}
      <svg
        viewBox="0 0 160 90"
        className="chaos-doodle chaos-doodle-arrow absolute right-[4%] top-[38%] w-24 text-[#B8A0FF] sm:right-[12%] sm:w-36"
        fill="none"
      >
        <path
          d="M8 67C44 9 82 12 122 39L145 52M145 52L132 27M145 52L119 58"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Pink scribble */}
      <svg
        viewBox="0 0 120 100"
        className="chaos-doodle chaos-doodle-loop absolute bottom-[17%] right-[12%] w-20 text-[#FF78CB] sm:bottom-[20%] sm:right-[22%] sm:w-28"
        fill="none"
      >
        <path
          d="M20 55C-1 30 30 5 52 28C75 52 31 91 17 65C3 39 70 14 91 39C110 61 77 91 57 76"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      {/* Floating sticker shapes */}
      <div className="chaos-sticker chaos-sticker-one absolute right-[18%] top-[14%] flex h-10 w-10 items-center justify-center rounded-xl bg-[#D0FF72] text-xl text-[#171910] shadow-[0_0_35px_rgba(208,255,114,0.2)] sm:right-[27%]">
        ✳
      </div>

      <div className="chaos-sticker chaos-sticker-two absolute left-[8%] top-[72%] hidden -rotate-6 rounded-full border border-[#FF78CB]/50 bg-[#09090D]/70 px-3 py-2 text-[10px] font-black tracking-widest text-[#FF78CB] backdrop-blur-md sm:block">
        NO FILTER ✦
      </div>

      <div className="chaos-sticker chaos-sticker-three absolute right-[8%] top-[52%] hidden rotate-6 rounded-xl border border-violet-300/30 bg-[#151020]/70 px-3 py-2 text-[10px] font-black tracking-widest text-violet-200 backdrop-blur-md sm:block">
        CHAOS MODE ↗
      </div>

      {/* Orbiting accent */}
      <div className="chaos-orbit absolute left-[8%] top-[53%] hidden h-20 w-20 rounded-full border border-violet-300/30 sm:block">
        <span className="absolute -right-1 top-4 h-3 w-3 rounded-full bg-violet-300 shadow-[0_0_15px_#B8A0FF]" />
      </div>

      {/* Tiny glints */}
      <span className="chaos-glint absolute left-[72%] top-[24%]" />
      <span className="chaos-glint chaos-glint-two absolute left-[24%] top-[58%]" />
      <span className="chaos-glint chaos-glint-three absolute right-[18%] bottom-[12%]" />

      {/* Protect foreground readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090D]/20 via-[#09090D]/5 to-[#09090D]/65" />
    </div>
  );
}
