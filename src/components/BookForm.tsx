'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BookType, BookCondition, BookAvailability } from '@/models/Book';

interface BookFormData {
  title: string;
  author: string;
  description: string;
  genre: string[];
  condition: string;
  type: string;
  availability: string;
  price?: number;
  images: string[];
}

interface BookFormProps {
  initialData?: BookFormData;
  bookId?: string;
  isEditing?: boolean;
}

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
  'Business',
  'Self-Help',
  'Biography',
  'Romance',
  'Fantasy',
  'Sci-Fi',
  'Mystery',
  'Thriller',
  'Horror',
  'Poetry',
  'Drama',
  'Comic Book',
  'Cookbook',
  'Art',
  'Travel',
  'Religion',
  'Other',
];

export default function BookForm({ initialData, bookId, isEditing = false }: BookFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    description: '',
    genre: [],
    condition: BookCondition.GOOD,
    type: BookType.SELL,
    availability: BookAvailability.AVAILABLE,
    price: undefined,
    images: [],
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherGenre, setOtherGenre] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  
  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedGenres(new Set(initialData.genre));
    }
  }, [initialData]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle numeric input for price
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
    setFormData(prev => ({
      ...prev,
      price: value,
    }));
  };
  
  // Handle genre selection
  const handleGenreToggle = (genre: string) => {
    const newSelectedGenres = new Set(selectedGenres);
    
    if (newSelectedGenres.has(genre)) {
      newSelectedGenres.delete(genre);
    } else {
      newSelectedGenres.add(genre);
    }
    
    setSelectedGenres(newSelectedGenres);
    setFormData(prev => ({
      ...prev,
      genre: Array.from(newSelectedGenres),
    }));
  };
  
  // Add custom genre
  const handleAddGenre = () => {
    if (otherGenre.trim() && !selectedGenres.has(otherGenre)) {
      const newSelectedGenres = new Set(selectedGenres);
      newSelectedGenres.add(otherGenre.trim());
      setSelectedGenres(newSelectedGenres);
      setFormData(prev => ({
        ...prev,
        genre: Array.from(newSelectedGenres),
      }));
      setOtherGenre('');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.author || formData.genre.length === 0) {
      setError('Please fill in all required fields (title, author, and at least one genre)');
      return;
    }
    
    if (formData.type === BookType.SELL && (formData.price === undefined || formData.price <= 0)) {
      setError('Please provide a valid price for books that are for sale');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const url = isEditing 
        ? `/api/books/${bookId}` 
        : '/api/books';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // Redirect after successful submission
      if (isEditing) {
        router.push(`/books/${bookId}?updated=true`);
      } else {
        router.push(`/books/${data._id}?created=true`);
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };
  
  // Handle image upload (placeholder for future implementation)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This would typically connect to an image upload service
    // For now, just a placeholder to show how it would be structured
    alert('Image upload functionality would be implemented here');
  };
  
  if (!session) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-md mb-4">
        <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
        <p>You must be signed in to add or edit books.</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md mb-4">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>
        
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
              placeholder="Enter book title"
            />
          </div>
          
          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              placeholder="Enter author name"
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
              placeholder="Add a description of the book (optional)"
            />
          </div>
        </div>
      </div>
      
      {/* Genres */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Genres <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select all genres that apply to this book.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {genres.map(genre => (
            <div key={genre} className="flex items-center">
              <input
                type="checkbox"
                id={`genre-${genre}`}
                checked={selectedGenres.has(genre)}
                onChange={() => handleGenreToggle(genre)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor={`genre-${genre}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {genre}
              </label>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2 mt-4">
          <input
            type="text"
            value={otherGenre}
            onChange={(e) => setOtherGenre(e.target.value)}
            className="flex-grow rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            placeholder="Add a custom genre"
          />
          <button
            type="button"
            onClick={handleAddGenre}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add
          </button>
        </div>
        
        {/* Display selected genres */}
        {selectedGenres.size > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Genres:</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedGenres).map(genre => (
                <span
                  key={genre}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 focus:outline-none"
                  >
                    <span className="sr-only">Remove {genre}</span>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Book Details */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Book Details</h2>
        
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              {Object.values(BookType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose whether you want to sell, lend, or exchange this book.
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
              {Object.values(BookCondition).map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
          
          {/* Price - Only shown for Sell */}
          {formData.type === BookType.SELL && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="any"
                  value={formData.price === undefined ? '' : formData.price}
                  onChange={handlePriceChange}
                  required={formData.type === BookType.SELL}
                  className="pl-8 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}
          
          {/* Availability - Only shown when editing */}
          {isEditing && (
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Availability Status
              </label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                {Object.values(BookAvailability).map(availability => (
                  <option key={availability} value={availability}>{availability}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Images - Placeholder for future implementation */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 opacity-75">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Images</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Upload images of your book. (Image upload functionality to be implemented later)
        </p>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
          <input
            type="file"
            multiple
            className="hidden"
            id="image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            disabled
          />
          <label
            htmlFor="image-upload"
            className="cursor-not-allowed inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 dark:bg-gray-600"
          >
            Upload Images (Coming Soon)
          </label>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, or GIF up to 10MB each
          </p>
        </div>
      </div>
      
      {/* Submit Buttons */}
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? (isEditing ? 'Updating...' : 'Adding...') 
            : (isEditing ? 'Update Book' : 'Add Book')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
} 