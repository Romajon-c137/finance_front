import { useState, useEffect, useRef, useCallback } from 'react';
import { PaginatedResponse } from '@/lib/api';

interface UseInfiniteScrollOptions<T> {
    initialData?: T[];
    threshold?: number; // How close to bottom before loading more (in pixels)
}

export function useInfiniteScroll<T>(
    fetchFunction: (page: number) => Promise<PaginatedResponse<T>>,
    dependencies: any[] = [],
    options: UseInfiniteScrollOptions<T> = {}
) {
    const { initialData = [], threshold = 200 } = options;

    const [data, setData] = useState<T[]>(initialData);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const observerTarget = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false); // Track loading state to prevent race conditions
    const mountedRef = useRef(true);

    // Stable reference to dependencies for comparison
    const depsRef = useRef(dependencies);

    // Check if dependencies changed
    useEffect(() => {
        const depsChanged = JSON.stringify(dependencies) !== JSON.stringify(depsRef.current);
        if (depsChanged) {
            console.log('[useInfiniteScroll] Dependencies changed, resetting');
            depsRef.current = dependencies;
            setData([]);
            setPage(1);
            setHasMore(true);
            setError(null);
            loadingRef.current = false;
        }
    }, [dependencies]);

    // Fetch data function
    const fetchData = async (pageNum: number, reset: boolean = false) => {
        if (loadingRef.current) {
            console.log('[useInfiniteScroll] Already loading, skipping fetch for page:', pageNum);
            return;
        }

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        console.log('[useInfiniteScroll] Fetching page:', pageNum, 'reset:', reset);

        try {
            const response = await fetchFunction(pageNum);

            if (!mountedRef.current) return; // Component unmounted

            console.log('[useInfiniteScroll] Received:', response.results.length, 'items, hasMore:', response.next !== null);

            if (reset) {
                setData(response.results);
            } else {
                setData(prev => [...prev, ...response.results]);
            }

            setHasMore(response.next !== null);
            setPage(pageNum);
        } catch (err) {
            if (!mountedRef.current) return;
            console.error('[useInfiniteScroll] Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            setHasMore(false);
        } finally {
            if (mountedRef.current) {
                loadingRef.current = false;
                setLoading(false);
            }
        }
    };

    // Initial load
    useEffect(() => {
        console.log('[useInfiniteScroll] Initial load, fetching page 1');
        fetchData(1, true);

        return () => {
            mountedRef.current = false;
        };
    }, []); // Only run on mount

    // Infinite scroll observer
    useEffect(() => {
        const target = observerTarget.current;
        if (!target || !hasMore) {
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
                    console.log('[useInfiniteScroll] Intersection detected, loading page:', page + 1);
                    fetchData(page + 1, false);
                }
            },
            { threshold: 0.1, rootMargin: `${threshold}px` }
        );

        observer.observe(target);

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        };
    }, [hasMore, page, threshold]); // Removed fetchData to prevent loop

    const reload = useCallback(() => {
        console.log('[useInfiniteScroll] Manual reload triggered');
        setData([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        loadingRef.current = false;
        fetchData(1, true);
    }, [fetchFunction]);

    return {
        data,
        loading,
        hasMore,
        error,
        observerTarget,
        reload,
        page,
    };
}
