import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// Simple cache key type
type CacheKey = 'dashboard' | 'tests' | 'all';

interface DataCacheContextValue {
    // Cache version - when incremented, components should refetch
    cacheVersion: number;
    // Invalidate specific caches or all
    invalidateCache: (key?: CacheKey) => void;
    // Check if cache should be invalidated for a specific key
    getCacheVersion: (key: CacheKey) => number;
}

const DataCacheContext = createContext<DataCacheContextValue>({
    cacheVersion: 0,
    invalidateCache: () => { },
    getCacheVersion: () => 0,
});

export const useDataCache = () => useContext(DataCacheContext);

export const DataCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use separate versions for different caches for more granular control
    const [cacheVersions, setCacheVersions] = useState<Record<CacheKey, number>>({
        dashboard: 0,
        tests: 0,
        all: 0,
    });

    const invalidateCache = useCallback((key: CacheKey = 'all') => {
        setCacheVersions(prev => {
            if (key === 'all') {
                return {
                    dashboard: prev.dashboard + 1,
                    tests: prev.tests + 1,
                    all: prev.all + 1,
                };
            }
            return {
                ...prev,
                [key]: prev[key] + 1,
            };
        });
    }, []);

    const getCacheVersion = useCallback((key: CacheKey): number => {
        return cacheVersions[key];
    }, [cacheVersions]);

    // Global cacheVersion is max of all versions
    const cacheVersion = Math.max(
        cacheVersions.dashboard,
        cacheVersions.tests,
        cacheVersions.all
    );

    return (
        <DataCacheContext.Provider value={{ cacheVersion, invalidateCache, getCacheVersion }}>
            {children}
        </DataCacheContext.Provider>
    );
};

export default DataCacheContext;
