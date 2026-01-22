import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
}

export default function Pagination({ currentPage, totalPages, onPageChange, loading = false }: PaginationProps) {
    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < totalPages;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            padding: '24px 0',
            marginTop: '16px'
        }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevious || loading}
                style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: hasPrevious && !loading ? '#10b981' : '#e5e7eb',
                    color: hasPrevious && !loading ? 'white' : '#9ca3af',
                    cursor: hasPrevious && !loading ? 'pointer' : 'not-allowed',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                }}
            >
                ← Назад
            </button>

            <span style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500',
                minWidth: '120px',
                textAlign: 'center'
            }}>
                {loading ? 'Загрузка...' : `Страница ${currentPage} из ${totalPages}`}
            </span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext || loading}
                style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: hasNext && !loading ? '#10b981' : '#e5e7eb',
                    color: hasNext && !loading ? 'white' : '#9ca3af',
                    cursor: hasNext && !loading ? 'pointer' : 'not-allowed',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                }}
            >
                Вперед →
            </button>
        </div>
    );
}
