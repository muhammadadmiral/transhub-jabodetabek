export function Brand() {
  return (
    <a className="brand" href="/" aria-label="TransHub Jabodetabek">
      <svg className="brand__mark" viewBox="0 0 36 36" aria-hidden="true">
        <path d="M18 3.5 31 11v14L18 32.5 5 25V11L18 3.5Z" />
        <path d="M12 13.5h12M12 18h12M18 9v18" />
        <circle cx="12" cy="23" r="1.4" /><circle cx="24" cy="23" r="1.4" />
      </svg>
      <span className="brand__name">Trans<span>Hub</span></span>
      <span className="brand__city">Jabodetabek</span>
    </a>
  );
}
