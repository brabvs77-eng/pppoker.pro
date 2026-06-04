import { getManifest } from '@/lib/content';

export async function CoreStylesheets() {
  const manifest = await getManifest();

  return (
    <>
      {manifest.coreStylesheets.map((href) => (
        <link key={`core-${href}`} rel="stylesheet" href={href} />
      ))}
    </>
  );
}
