import { useState } from 'react';

interface ItemFilterProps {
  onFilterChange: (filters: {
    type: string[];
    category: string[];
    condition: string[];
    availability: string[];
  }) => void;
}

const ITEM_TYPES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Sports',
  'Other'
];

const ITEM_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Sports',
  'Home & Garden',
  'Toys & Games',
  'Collectibles',
  'Other'
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const AVAILABILITY = ['Available', 'Reserved', 'Sold'];

export default function ItemFilter({ onFilterChange }: ItemFilterProps) {
  const [filters, setFilters] = useState({
    type: [] as string[],
    category: [] as string[],
    condition: [] as string[],
    availability: [] as string[],
  });

  const handleCheckboxChange = (filterType: keyof typeof filters, value: string) => {
    const newFilters = { ...filters };
    
    if (newFilters[filterType].includes(value)) {
      newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
    } else {
      newFilters[filterType] = [...newFilters[filterType], value];
    }
    
    // Update local state and notify parent component
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const FilterSection = ({ title, items, filterType }: { 
    title: string; 
    items: string[]; 
    filterType: keyof typeof filters 
  }) => (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center">
            <input
              id={`${filterType}-${item}`}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              checked={filters[filterType].includes(item)}
              onChange={() => handleCheckboxChange(filterType, item)}
            />
            <label
              htmlFor={`${filterType}-${item}`}
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              {item}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h2>
      
      <FilterSection 
        title="Item Type" 
        items={ITEM_TYPES} 
        filterType="type" 
      />
      
      <FilterSection 
        title="Category" 
        items={ITEM_CATEGORIES} 
        filterType="category" 
      />
      
      <FilterSection 
        title="Condition" 
        items={CONDITIONS} 
        filterType="condition" 
      />
      
      <FilterSection 
        title="Availability" 
        items={AVAILABILITY} 
        filterType="availability" 
      />
      
      <button
        onClick={() => {
          const resetFilters = {
            type: [],
            category: [],
            condition: [],
            availability: [],
          };
          setFilters(resetFilters);
          onFilterChange(resetFilters);
        }}
        className="w-full mt-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
      >
        Clear all filters
      </button>
    </div>
  );
}
