import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-5xl font-bold mb-4 text-white">
        Find Your Team. <span className="text-purple-500">Build Your Legacy.</span>
      </h1>
      <p className="text-gray-400 text-xl mb-8 max-w-xl">
        The esports recruitment platform connecting top players with competitive teams.
      </p>
      <div className="flex gap-4">
        <Link
          href="/listings"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition">
          Browse Listings
        </Link>
        <Link
          href="/login"
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition">
          Sign In
        </Link>
      </div>
    </main>
  );
}