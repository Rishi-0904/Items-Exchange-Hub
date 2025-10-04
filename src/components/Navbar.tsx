'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Menu, Transition } from '@headlessui/react';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useUnreadCount } from '@/hooks/useUnreadCount';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useUnreadCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Browse Books', href: '/books' },
    ...(session ? [{ name: 'Add Book', href: '/books/add' }] : []),
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile' },
    { name: 'My Books', href: '/profile/books' },
    { name: 'Messages', href: '/messages' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600">
                Book Exchange Hub
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MoonIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {session ? (
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button className="bg-white dark:bg-gray-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            href={item.href}
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-700' : ''
                            } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 relative`}
                          >
                            {item.name}
                            {item.name === 'Messages' && unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut()}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex space-x-4 ml-4">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-3 py-1.5 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 dark:bg-transparent dark:text-primary-400 dark:border-primary-400 dark:hover:bg-gray-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1 rounded-full text-gray-500 dark:text-gray-300 mr-3"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MoonIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'bg-primary-50 dark:bg-gray-800 border-primary-500 text-primary-700 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={toggleMenu}
            >
              {item.name}
            </Link>
          ))}
        </div>
        {session ? (
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">
                  {session.user?.name || 'User'}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  {session.user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                  onClick={toggleMenu}
                >
                  {item.name}
                  {item.name === 'Messages' && unreadCount > 0 && (
                    <span className="absolute top-2 right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              ))}
              <button
                onClick={() => {
                  signOut();
                  toggleMenu();
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2 px-4">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                onClick={toggleMenu}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="w-full flex justify-center py-2 px-4 border border-primary-600 rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50 dark:bg-transparent dark:text-primary-400 dark:border-primary-400 dark:hover:bg-gray-800"
                onClick={toggleMenu}
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 