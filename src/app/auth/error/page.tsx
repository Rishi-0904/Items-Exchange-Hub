'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'An unknown error occurred.';
  if (error === 'Signin') {
    errorMessage = 'Try signing in with a different account.';
  } else if (error === 'OAuthSignin') {
    errorMessage = 'Try signing in with a different provider.';
  } else if (error === 'OAuthCallback') {
    errorMessage = 'Try signing in with a different provider.';
  } else if (error === 'OAuthCreateAccount') {
    errorMessage = 'Try signing in with a different provider.';
  } else if (error === 'EmailCreateAccount') {
    errorMessage = 'Try signing in with a different email address.';
  } else if (error === 'Callback') {
    errorMessage = 'Try signing in with a different account.';
  } else if (error === 'OAuthAccountNotLinked') {
    errorMessage = 'To confirm your identity, sign in with the same account you used originally.';
  } else if (error === 'EmailSignin') {
    errorMessage = 'Check your email address.';
  } else if (error === 'CredentialsSignin') {
    errorMessage = 'Invalid credentials. Please check your email and password.';
  } else if (error === 'SessionRequired') {
    errorMessage = 'Please sign in to access this page.';
  } else if (error === 'Default') {
    errorMessage = 'Unable to sign in.';
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Authentication Error
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* Error icon */}
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Authentication failed
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Link
              href="/auth/signin"
              className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Try signing in again
            </Link>
            <Link
              href="/"
              className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Return to home page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 