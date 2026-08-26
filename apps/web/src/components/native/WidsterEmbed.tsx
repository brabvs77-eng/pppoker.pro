import Script from 'next/script';

import { siteWidster } from '@/config/site';

/**
 * Widster chat/widget bootstrap for native home shells.
 *
 * Legacy Elementor pages load the same snippet via WordPressRuntimeScripts;
 * native homes skip that runtime, so the mount div in the body needs this script.
 */
export function WidsterEmbed() {
  const { widgetId } = siteWidster;

  return (
    <Script id="widster-embed" strategy="afterInteractive">
      {`
(function (d, w) {
  if (w.__nutsWidsterLoaded) return;
  w.__nutsWidsterLoaded = true;
  w.wwidget = '${widgetId}';
  var s = d.createElement('script');
  s.async = true;
  s.src = 'https://widster.ru/embed/' + w.wwidget;
  s.charset = 'UTF-8';
  d.head.appendChild(s);
})(document, window);
      `}
    </Script>
  );
}
