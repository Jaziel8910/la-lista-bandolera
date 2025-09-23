import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

declare global {
    interface Window {
        puter: any;
    }
}

interface PuterImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    puterPath: string;
    fallback?: React.ReactNode;
}

const PuterImage: React.FC<PuterImageProps> = ({ puterPath, fallback, ...props }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let retryTimeout: number;
        
        if (!puterPath) {
            setIsLoading(false);
            setError(true);
            return;
        };

        const fetchUrl = async () => {
            setIsLoading(true);
            setError(false);
            try {
                if (typeof window.puter?.fs?.getReadURL !== 'function') {
                     retryTimeout = window.setTimeout(fetchUrl, 200); // Retry if puter.js not ready
                     return;
                }
                const url = await window.puter.fs.getReadURL(puterPath);
                if (isMounted) {
                    setImageUrl(url);
                }
            } catch (err) {
                console.error("Failed to get image URL from Puter:", err);
                if (isMounted) {
                    setError(true);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchUrl();

        return () => { 
            isMounted = false; 
            clearTimeout(retryTimeout);
        };
    }, [puterPath]);

    const fallbackUI = fallback ? <>{fallback}</> : <div {...props} className={`${props.className} flex items-center justify-center bg-gray-200 dark:bg-gray-700`}><ImageIcon className="text-gray-400" /></div>;


    if (isLoading) {
        return (
            <div {...props} className={`${props.className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse`}>
                <ImageIcon className="text-gray-400" />
            </div>
        );
    }

    if (error || !imageUrl) {
        return fallbackUI;
    }

    return <img src={imageUrl} alt={props.alt || 'Puter Image'} {...props} />;
};

export default PuterImage;
