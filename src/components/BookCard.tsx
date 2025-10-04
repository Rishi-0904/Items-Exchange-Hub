'use client';

import Image from 'next/image';
import { BookAvailability } from '@/models/Book';
import MessageButton from './MessageButton';

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string[];
  condition: string;
  type: string;
  availability: string;
  price?: number;
  images: string[];
  createdAt: string;
  owner: {
    _id: string;
    name: string;
  };
}

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  const defaultImage = '/images/book-placeholder.jpg';
  const imageUrl = book.images && book.images.length > 0 ? book.images[0] : defaultImage;

  // Format the date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get badge color based on availability
  const getBadgeColor = (availability: string) => {
    switch (availability) {
      case BookAvailability.AVAILABLE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case BookAvailability.RESERVED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case BookAvailability.SOLD:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
      {/* Badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${getBadgeColor(book.availability)}`}>
          {book.availability}
        </span>
      </div>

      {/* Image */}
      <div className="relative h-48 w-full cursor-pointer" onClick={onClick}>
        <Image
          src={imageUrl}
          alt={book.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={false}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="cursor-pointer" onClick={onClick}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{book.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{book.author}</p>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {book.genre.slice(0, 2).map((genre, index) => (
              <span 
                key={index} 
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded"
              >
                {genre}
              </span>
            ))}
            {book.genre.length > 2 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                +{book.genre.length - 2}
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(book.createdAt)}
            </div>
            
            {book.price ? (
              <div className="font-semibold text-primary-600 dark:text-primary-400">
                ₹{book.price}
              </div>
            ) : (
              <div className="font-medium text-gray-600 dark:text-gray-300">
                {book.type}
              </div>
            )}
          </div>
        </div>
        
        {/* Message Button */}
        <MessageButton
          bookId={book._id}
          ownerId={book.owner._id}
          bookTitle={book.title}
          ownerName={book.owner.name}
        />
      </div>
    </div>
  );
} 