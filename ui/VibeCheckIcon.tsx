
type VibeCheckIconProps = {
  size?: number;
  className?: string;
};

export function VibeCheckIcon({
  size = 48,
  className = "",
}: VibeCheckIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="VibeCheck mascot"
      className={className}
    >
      {/* Main character */}
      <path
        d="M27 5.8C29.3 2.8 33.1 3.6 35 7.1L43.1 22.4L58.2 26.2C62.1 27.2 63.2 31.6 60 34.1L47.7 43.8L47.1 58.1C46.9 62.4 42.5 64.1 39.4 61.2L28.5 51.1L13.2 55.3C9.1 56.4 6.1 52.7 7.9 48.9L14.4 34.8L6.2 22.3C3.8 18.7 6.3 14.8 10.4 15.1L25.3 16.4L27 5.8Z"
        fill="#D0FF72"
        transform="rotate(-8 32 32)"
      />

      {/* Open eye */}
      <ellipse
        cx="23.5"
        cy="29"
        rx="3.2"
        ry="5.2"
        fill="#171910"
        transform="rotate(-8 23.5 29)"
      />

      {/* Winking eye */}
      <path
        d="M35 30.5Q39.5 35 44 28.5"
        stroke="#171910"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Violet sparkle */}
      <path
        d="M49 3L52.3 11.2L60.5 14.5L52.3 17.8L49 26L45.7 17.8L37.5 14.5L45.7 11.2L49 3Z"
        fill="#8B5CFF"
      />

      {/* Motion marks */}
      <path
        d="M5 31L1.5 27M8 42L3 43"
        stroke="#8B5CFF"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M54 40L59 37"
        stroke="#8B5CFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
