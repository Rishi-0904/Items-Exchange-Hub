import Link from 'next/link';
import { BookOpenIcon, ArrowPathIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  const features = [
    {
      name: 'Easy Exchange',
      description: 'Connect with other students to exchange books easily.',
      icon: ArrowPathIcon,
    },
    {
      name: 'Wide Selection',
      description: 'Find textbooks, novels, and study materials across various subjects.',
      icon: BookOpenIcon,
    },
    {
      name: 'Affordable Options',
      description: 'Buy, sell, or trade books at student-friendly prices.',
      icon: CurrencyDollarIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HeroSection />
      
      {/* Features Section */}
      <div className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              A better way to exchange books
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              Our platform makes it easy for students to find, exchange, and manage their books.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Start exchanging books today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Join our community of students and make the most of your academic resources.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto"
          >
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}