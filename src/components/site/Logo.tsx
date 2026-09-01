/**
 * The Smart Stamp mark: a perforated postage stamp with a check inside.
 *
 * The perforations are punched with a mask rather than drawn as a dashed
 * border, which is what keeps the silhouette readable down to a 16px favicon.
 * The gradient and mask ids are fixed rather than generated, so several marks
 * on one page share a single identical definition instead of fighting over it.
 */
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  const perforations = [4, 10, 16, 22, 28];

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="smartstamp-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <mask id="smartstamp-perforations">
          <rect width="32" height="32" fill="#000" />
          <rect x="2" y="2" width="28" height="28" rx="4" fill="#fff" />
          {perforations.map((v) => (
            <g key={v}>
              <circle cx={v} cy="2" r="1.7" fill="#000" />
              <circle cx={v} cy="30" r="1.7" fill="#000" />
              <circle cx="2" cy={v} r="1.7" fill="#000" />
              <circle cx="30" cy={v} r="1.7" fill="#000" />
            </g>
          ))}
        </mask>
      </defs>
      <rect
        width="32"
        height="32"
        fill="url(#smartstamp-mark)"
        mask="url(#smartstamp-perforations)"
      />
      <path
        d="M10.5 16.6l3.6 3.6 7.2-7.6"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
