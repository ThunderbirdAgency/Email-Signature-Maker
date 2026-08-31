export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sig-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#sig-logo)" />
      {/* An envelope flap that doubles as a signature stroke. */}
      <path
        d="M7 12.5 16 19l9-6.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      <path
        d="M8.5 22.5c2.6 0 3.4-4.2 5-4.2 1.2 0 1.3 2.2 2.7 2.2 1.9 0 2.6-5 4.6-5 1.1 0 1.3 1.6 2.7 1.6"
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
