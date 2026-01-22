import { useState, useEffect, useCallback } from 'react';
import { PaginatedResponse } from '@/lib/api';

export function usePagination<T>(
    fetchFunction: (page: number) => Promise<PaginatedResponse<T>>,
    dependencies: any[] = []
) {
    const [data, setData] = useState<T[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPage = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetchFunction(page);
            setData(response.results);
            setCurrentPage(page);

            // Calculate total pages from count
            // Assuming 10 items per page (you can adjust based on API)
            const itemsPerPage = response.results.length || 10;
            const calculatedTotalPages = Math.ceil(response.count / itemsPerPage);
            setTotalPages(calculatedTotalPages || 1);
        } catch (err) {
            console.error('Error fetching page:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [fetchFunction]);

    // Load first page on mount or when dependencies change
    useEffect(() => {
        fetchPage(1);
    }, dependencies);

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages && !loading) {
            fetchPage(page);
        }
    }, [totalPages, loading, fetchPage]);

    const nextPage = useCallback(() => {
        if (currentPage < totalPages && !loading) {
            fetchPage(currentPage + 1);
        }
    }, [currentPage, totalPages, loading, fetchPage]);

    const previousPage = useCallback(() => {
        if (currentPage > 1 && !loading) {
            fetchPage(currentPage - 1);
        }
    }, [currentPage, loading, fetchPage]);

    const reload = useCallback(() => {
        fetchPage(currentPage);
    }, [currentPage, fetchPage]);

    return {
        data,
        currentPage,
        totalPages,
        loading,
        error,
        goToPage,
        nextPage,
        previousPage,
        reload,
    };
}
