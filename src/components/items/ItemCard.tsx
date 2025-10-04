import Image from 'next/image';
import Link from 'next/link';

interface Item {
  _id: string;
  title: string;
  description?: string;
  category: string[];
  condition: string;
  type: string;
  availability: string;
  price?: number;
  images: string[];
  owner: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  createdAt: string;
}

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
  className?: string;
}

export default function ItemCard({ item, onClick, className = '' }: ItemCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer ${className}`}
    >
      <div className="relative h-48 w-full">
        {item.images && item.images.length > 0 ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {item.type}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {item.title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span className="mr-2">Condition:</span>
          <span className="font-medium">{item.condition}</span>
        </div>
        
        {item.price !== undefined && (
          <div className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-2">
            ${item.price.toFixed(2)}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 mr-2 overflow-hidden">
              {item.owner?.profileImage ? (
                <Image
                  src={item.owner.profileImage}
                  alt={item.owner.name}
                  width={24}
                  height={24}
                  className="object-cover h-full w-full"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                  {item.owner?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              {item.owner?.name || 'Unknown'}
            </span>
          </div>
          
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
