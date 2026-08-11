// Real Kestra Financial logo (client-provided asset, served from
// /public/kestra-logo.svg). Its wordmark is a mid-gray (#64666A) tuned for
// a white background, so on the nav's always-dark chrome it sits on a small
// light backing plate rather than having its brand colors altered.
export function KestraLogo({ height = 34 }: { height?: number }) {
  return (
    <div className="kestra-logo-plate">
      <img src="/kestra-logo.svg" alt="Kestra Financial" style={{ height, display: 'block' }} />
    </div>
  );
}
