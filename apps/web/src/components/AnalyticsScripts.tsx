import Script from 'next/script';

const GTM_ID = 'GTM-K375NJP4';

export function AnalyticsScripts() {
  return (
    <>
      <Script
        id="google-optimize"
        src={`https://www.googleoptimize.com/optimize.js?id=${GTM_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
