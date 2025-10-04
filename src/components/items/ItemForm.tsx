'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ItemFormData {
  title: string;
  description: string;
  category: string[];
  condition: string;
  type: string;
  availability: string;
  price?: number;
  images: string[];
}

interface ItemFormProps {
  initialData?: ItemFormData;
  itemId?: string;
  isEditing?: boolean;
}

// Available item types
export enum ItemType {
  SELL = 'Sell',
  EXCHANGE = 'Exchange',
  LEND = 'Lend',
  DONATE = 'Donate'
}

// Item conditions
export enum ItemCondition {
  NEW = 'New',
  LIKE_NEW = 'Like New',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor'
}

// Availability status
export enum ItemAvailability {
  AVAILABLE = 'Available',
  RESERVED = 'Reserved',
  SOLD = 'Sold'
}

// Available categories
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

export default function ItemForm({ initialData, itemId, isEditing = false }: ItemFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    category: [],
    condition: ItemCondition.GOOD,
    type: ItemType.SELL,
    availability: ItemAvailability.AVAILABLE,
    price: undefined,
    images: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => {
      const newCategories = prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category];
      
      return {
        ...prev,
        category: newCategories
      };
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    setFormData(prev => ({
      ...prev,
      price: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('You must be signed in to add or edit items.');
      return;
    }

    if (formData.type === ItemType.SELL && (formData.price === undefined || formData.price <= 0)) {
      setError('Please provide a valid price for items that are for sale');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const url = isEditing 
        ? `/api/items/${itemId}` 
        : '/api/items';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save item');
      }
      
      const data = await response.json();
      
      // Show success message
      setSuccess(isEditing ? 'Item updated successfully!' : 'Item added successfully!');
      
      // Redirect after successful submission
      if (isEditing) {
        router.push(`/items/${itemId}?updated=true`);
      } else {
        router.push(`/items/${data._id}?created=true`);
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not authenticated, show a message
  if (!session) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-md mb-4">
        <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
        <p>You must be signed in to add or edit items.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md mb-4">
          {success}
        </div>
      )}
      
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Item Information
        </h2>
        
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              placeholder="Enter item title"
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              placeholder="Add a description of the item (optional)"
            />
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          Categories <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select all categories that apply to this item.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {ITEM_CATEGORIES.map((category) => (
            <div key={category} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category}`}
                checked={formData.category.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label 
                htmlFor={`category-${category}`}
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
        
        {formData.category.length === 0 && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Please select at least one category
          </p>
        )}
      </div>
      
      {/* Item Details */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Item Details</h2>
        
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Listing Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              {Object.values(ItemType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose whether you want to sell, lend, exchange, or donate this item.
            </p>
          </div>
          
          {/* Condition */}
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              {Object.values(ItemCondition).map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
          
          {/* Price - Only shown for Sell */}
          {formData.type === ItemType.SELL && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  min="0"
                  step="any"
                  value={formData.price === undefined ? '' : formData.price}
                  onChange={handlePriceChange}
                  required={formData.type === ItemType.SELL}
                  className="pl-8 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}
          
          {/* Availability */}
          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Availability <span className="text-red-500">*</span>
            </label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              {Object.values(ItemAvailability).map(availability => (
                <option key={availability} value={availability}>{availability}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Images Section - Placeholder for future implementation */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 opacity-75">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Images</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Upload images of your item. (Image upload functionality to be implemented later)
        </p>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || formData.category.length === 0}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${(isSubmitting || formData.category.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting 
            ? (isEditing ? 'Updating...' : 'Adding...') 
            : (isEditing ? 'Update Item' : 'Add Item')}
        </button>
      </div>
    </form>
  );
}
