import Script from 'next/script';

import { siteAnalytics } from '@/config/site';

/**
 * Yandex Metrika + Google Tag (GA4 via Site Kit) for native Next.js pages.
 *
 * Legacy Elementor homepages load the same counters via WordPressRuntimeScripts;
 * PageShell skips this component when `loadElementorRuntime` is true to avoid
 * double-counting.
 */
export function AnalyticsScripts() {
  const { yandexMetrikaId, googleTagId } = siteAnalytics;

  return (
    <>
      <Script
        id="gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-config" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('set', 'linker', { domains: ['pppoker.pro'] });
gtag('js', new Date());
gtag('config', '${googleTagId}');
        `}
      </Script>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
ym(${yandexMetrikaId}, 'init', {
  clickmap:true,
  trackLinks:true,
  accurateTrackBounce:true,
  webvisor:true,
  ecommerce:'dataLayer'
});
        `}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${yandexMetrikaId}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
