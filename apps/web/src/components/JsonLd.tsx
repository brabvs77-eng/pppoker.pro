type JsonLdProps = {
  blocks: string[];
};

export function JsonLd({ blocks }: JsonLdProps) {
  if (!blocks.length) return null;

  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: block }}
        />
      ))}
    </>
  );
}
