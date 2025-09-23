import React, { useState, useEffect } from 'react';

// A simple in-memory cache to avoid re-fetching from puter.kv on every component mount
const cache = new Map<string, any>();

declare global {
    interface Window {
        puter: any;
    }
}

export function usePuterStorage<T>(
    key: string,
    initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        return cache.get(key) ?? initialValue;
    });
    const [isInitialized, setIsInitialized] = useState(cache.has(key));

    // Initial fetch from puter.kv
    useEffect(() => {
        if (isInitialized) return;

        let isMounted = true;
        let retryTimeout: number;

        const loadValue = async () => {
            try {
                // Ensure puter is loaded
                if (typeof window.puter?.kv?.get !== 'function' || typeof window.puter?.auth?.isSignedIn !== 'function') {
                    // Puter.js not ready, will retry loading from storage.
                    retryTimeout = window.setTimeout(loadValue, 200);
                    return;
                }
                
                if (await window.puter.auth.isSignedIn()) {
                    const savedValue = await window.puter.kv.get(key);
                    if (isMounted) {
                        const result = savedValue !== null ? savedValue : initialValue;
                        setValue(result);
                        cache.set(key, result);
                    }
                } else {
                    // Not signed in, use initial value without error
                    if (isMounted) {
                        setValue(initialValue);
                        cache.set(key, initialValue);
                    }
                }
            } catch (error) {
                // This might catch other errors, e.g. network errors even when signed in.
                console.error(`Error reading from puter.kv for key "${key}"`, error);
                if (isMounted) {
                    setValue(initialValue);
                    cache.set(key, initialValue);
                }
            } finally {
                if (isMounted) {
                    setIsInitialized(true);
                }
            }
        };

        loadValue();

        return () => {
            isMounted = false;
            clearTimeout(retryTimeout);
        };
    }, [key, initialValue, isInitialized]);

    // Save to puter.kv whenever value changes
    useEffect(() => {
        if (!isInitialized) {
            return; // Don't save until we have loaded the initial state
        }
        
        // Update cache immediately for responsiveness
        cache.set(key, value);

        const handler = setTimeout(async () => {
            try {
                if (typeof window.puter?.kv?.set === 'function' && typeof window.puter?.auth?.isSignedIn === 'function') {
                    if (await window.puter.auth.isSignedIn()) {
                        await window.puter.kv.set(key, value);
                    }
                    // If not signed in, we just don't save to kv. No error.
                }
            } catch (error) {
                console.error(`Error writing to puter.kv for key "${key}"`, error);
            }
        }, 500); // Debounce saves

        return () => {
            clearTimeout(handler);
        };
    }, [key, value, isInitialized]);

    return [value, setValue];
}