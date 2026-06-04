import { localeFlags } from '@/config/site';
import type { HreflangEntry } from '@/lib/types';

type LocaleSwitcherProps = {
  alternates: HreflangEntry[];
  currentLocale: string;
  label: string;
};

export function LocaleSwitcher({ alternates, currentLocale, label }: LocaleSwitcherProps) {
  if (alternates.length < 2) {
    return null;
  }

  return (
    <nav className="locale-switcher" aria-label={label}>
      <ul className="locale-switcher__list">
        {alternates.map((entry, index) => {
          const isActive = entry.hreflang === currentLocale;
          const flag = localeFlags[entry.hreflang as keyof typeof localeFlags];

          return (
            <li key={entry.hreflang} className="locale-switcher__item">
              {index > 0 ? <span className="locale-switcher__sep" aria-hidden="true">/</span> : null}
              <a
                href={entry.href}
                hrefLang={entry.hreflang}
                className={isActive ? 'locale-switcher__link is-active' : 'locale-switcher__link'}
                aria-current={isActive ? 'page' : undefined}
                title={entry.hreflang.toUpperCase()}
              >
                {flag ? (
                  <img
                    className="locale-switcher__flag"
                    src={flag}
                    alt=""
                    width={18}
                    height={12}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <span>{entry.hreflang.toUpperCase()}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
