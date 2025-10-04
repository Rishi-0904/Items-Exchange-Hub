import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Book Exchange Hub</h1>
        <p className="text-center mb-8">
          A platform for students to exchange, lend, or sell books
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/auth/signin"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
} 