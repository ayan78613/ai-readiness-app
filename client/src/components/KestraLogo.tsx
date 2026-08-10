// Geometric monogram + wordmark. No real Kestra Financial brand asset was
// available to source (their site is client-rendered and unscrapeable — see
// the build spec), so this is an original mark in the documented brand
// palette: three ascending bars reading as both a "K" and an uptrend, set in
// a rounded badge, paired with a tracked-out wordmark.
export function KestraLogo({ size = 30 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kestraMarkGrad" x1="2" y1="28" x2="30" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B98F45" />
            <stop offset="100%" stopColor="#EAD19B" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="#10141A" />
        <rect width="32" height="32" rx="8" fill="url(#kestraMarkGrad)" fillOpacity="0.14" />
        <path d="M9 8V24" stroke="url(#kestraMarkGrad)" strokeWidth="2.75" strokeLinecap="round" />
        <path d="M9 16.5L18 8" stroke="url(#kestraMarkGrad)" strokeWidth="2.75" strokeLinecap="round" />
        <path d="M9 16.5L19.5 24" stroke="url(#kestraMarkGrad)" strokeWidth="2.75" strokeLinecap="round" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, fontWeight: 600, letterSpacing: '0.06em', color: '#F5F3EE' }}>
          KESTRA
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', color: '#C6A05A', marginTop: 2 }}>
          FINANCIAL
        </span>
      </div>
    </div>
  );
}
