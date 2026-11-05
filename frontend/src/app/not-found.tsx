import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="text-6xl font-extrabold text-[var(--brand)]">
        404
      </div>

      <h1 className="text-2xl font-bold text-[var(--text-main)]">
        Page Not Found
      </h1>

      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="pt-3">
        <Link
          href="/"
          className="btn-brand inline-block py-3 px-6 text-sm font-bold rounded-[var(--radius-md)]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
