export function Brand() {
  return (
    <a className="brand" href="/" aria-label="TransHub Jabodetabek">
      <svg className="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id="th-gold" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#d9b85a" />
            <stop offset="1" stopColor="#f2dc92" />
          </linearGradient>
          <linearGradient id="th-mint" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8bd9bf" />
            <stop offset="1" stopColor="#5fc4a2" />
          </linearGradient>
        </defs>
        <rect className="brand__mark-frame" x="2" y="2" width="36" height="36" rx="12.5" />
        <path className="brand__mark-line brand__mark-line--gold" pathLength={1} d="M9.5 28.5c5.5 0 6.5-8.5 10.5-8.5s5-8.5 10.5-8.5" />
        <path className="brand__mark-line brand__mark-line--mint" pathLength={1} d="M9.5 11.5c5.5 0 6.5 8.5 10.5 8.5s5 8.5 10.5 8.5" />
        <circle className="brand__mark-dot brand__mark-dot--gold" cx="9.5" cy="28.5" r="2" />
        <circle className="brand__mark-dot brand__mark-dot--gold" cx="30.5" cy="11.5" r="2" />
        <circle className="brand__mark-dot brand__mark-dot--mint" cx="9.5" cy="11.5" r="2" />
        <circle className="brand__mark-dot brand__mark-dot--mint" cx="30.5" cy="28.5" r="2" />
        <circle className="brand__mark-hub" cx="20" cy="20" r="3.6" />
      </svg>
      <span className="brand__name">Trans<span>Hub</span></span>
      <span className="brand__city">Jabodetabek</span>
    </a>
  );
}
