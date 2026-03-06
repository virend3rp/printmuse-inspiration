import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-6xl font-bold text-neutral-200">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-neutral-500 text-sm">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
