import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>404</h1>
      <p>Страница не найдена.</p>
      <p>
        <Link href="/">На главную</Link>
      </p>
    </main>
  );
}
