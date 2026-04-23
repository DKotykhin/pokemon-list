import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-6xl font-bold text-gray-600">404</p>
      <p className="text-xl text-gray-300">Page not found.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-300"
      >
        Back to home
      </Link>
    </main>
  );
}
