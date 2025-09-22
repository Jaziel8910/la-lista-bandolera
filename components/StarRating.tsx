import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    setRating?: (rating: number) => void;
    size?: number;
    className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, size = 20, className = '' }) => {
    const handleStarClick = (index: number) => {
        if (setRating) {
            setRating(index + 1);
        }
    };

    return (
        <div className={`flex items-center space-x-1 ${className}`}>
            {[...Array(5)].map((_, index) => (
                <Star
                    key={index}
                    size={size}
                    className={`cursor-pointer transition-all duration-200 ${
                        index < rating ? 'text-[#FFC300] fill-[#FFC300]' : 'text-gray-300 dark:text-gray-600'
                    }`}
                    onClick={() => handleStarClick(index)}
                    style={{ pointerEvents: setRating ? 'auto' : 'none' }}
                />
            ))}
        </div>
    );
};

export default StarRating;
