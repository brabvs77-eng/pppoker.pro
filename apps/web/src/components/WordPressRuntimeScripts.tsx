import type { RuntimeScriptEntry } from '@/lib/types';

type WordPressRuntimeScriptsProps = {
  scripts: RuntimeScriptEntry[];
};

/** Legacy WordPress/Elementor runtime (jQuery, Elementor config, carousels, popups, FAQ). */
export function WordPressRuntimeScripts({ scripts }: WordPressRuntimeScriptsProps) {
  if (scripts.length === 0) return null;

  return (
    <>
      {scripts.map((entry, index) => {
        if (entry.kind === 'external') {
          return (
            <script
              key={`${entry.src}-${index}`}
              src={entry.src}
              id={entry.id}
              type={entry.type}
              defer={entry.defer || undefined}
              async={entry.async || undefined}
            />
          );
        }

        return (
          <script
            key={`inline-${entry.id ?? index}`}
            id={entry.id}
            type={entry.type}
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
        );
      })}
    </>
  );
}
