'use client';

import { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { BookType, BookCondition, BookAvailability } from '@/models/Book';

interface BookFilterProps {
  onFilterChange: (filterName: string, values: string[]) => void;
}

export default function BookFilter({ onFilterChange }: BookFilterProps) {
  // Define common book genres
  const genres = [
    'Fiction',
    'Non-Fiction',
    'Science',
    'Technology',
    'Engineering',
    'Mathematics',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Literature',
    'History',
    'Philosophy',
    'Psychology',
  ];

  // State for selected filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  // Handle checkbox changes for types
  const handleTypeChange = (type: string) => {
    const updatedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(updatedTypes);
    onFilterChange('type', updatedTypes);
  };

  // Handle checkbox changes for genres
  const handleGenreChange = (genre: string) => {
    const updatedGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    
    setSelectedGenres(updatedGenres);
    onFilterChange('genre', updatedGenres);
  };

  // Handle checkbox changes for conditions
  const handleConditionChange = (condition: string) => {
    const updatedConditions = selectedConditions.includes(condition)
      ? selectedConditions.filter(c => c !== condition)
      : [...selectedConditions, condition];
    
    setSelectedConditions(updatedConditions);
    onFilterChange('condition', updatedConditions);
  };

  // Handle checkbox changes for availability
  const handleAvailabilityChange = (availability: string) => {
    const updatedAvailability = selectedAvailability.includes(availability)
      ? selectedAvailability.filter(a => a !== availability)
      : [...selectedAvailability, availability];
    
    setSelectedAvailability(updatedAvailability);
    onFilterChange('availability', updatedAvailability);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
      </div>

      {/* Type Filter */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span>Type</span>
              <ChevronDownIcon 
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-2 pb-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-2">
                {Object.values(BookType).map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      id={`filter-type-${type}`}
                      name={`type-${type}`}
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeChange(type)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`filter-type-${type}`}
                      className="ml-3 text-sm text-gray-600 dark:text-gray-400"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Genre Filter */}
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span>Genre</span>
              <ChevronDownIcon 
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-2 pb-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="grid grid-cols-2 gap-2">
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center">
                    <input
                      id={`filter-genre-${genre}`}
                      name={`genre-${genre}`}
                      type="checkbox"
                      checked={selectedGenres.includes(genre)}
                      onChange={() => handleGenreChange(genre)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`filter-genre-${genre}`}
                      className="ml-3 text-sm text-gray-600 dark:text-gray-400"
                    >
                      {genre}
                    </label>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Condition Filter */}
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span>Condition</span>
              <ChevronDownIcon 
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-2 pb-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-2">
                {Object.values(BookCondition).map((condition) => (
                  <div key={condition} className="flex items-center">
                    <input
                      id={`filter-condition-${condition}`}
                      name={`condition-${condition}`}
                      type="checkbox"
                      checked={selectedConditions.includes(condition)}
                      onChange={() => handleConditionChange(condition)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`filter-condition-${condition}`}
                      className="ml-3 text-sm text-gray-600 dark:text-gray-400"
                    >
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Availability Filter */}
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span>Availability</span>
              <ChevronDownIcon 
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-2 pb-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-2">
                {Object.values(BookAvailability).map((availability) => (
                  <div key={availability} className="flex items-center">
                    <input
                      id={`filter-availability-${availability}`}
                      name={`availability-${availability}`}
                      type="checkbox"
                      checked={selectedAvailability.includes(availability)}
                      onChange={() => handleAvailabilityChange(availability)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`filter-availability-${availability}`}
                      className="ml-3 text-sm text-gray-600 dark:text-gray-400"
                    >
                      {availability}
                    </label>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
} 