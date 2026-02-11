
"use client"
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Filter } from 'lucide-react';
import ExpenseCard from '@/components/ExpenseCard/ExpenseCard';
import FloatingButton from '@/components/FloatingButton/FloatingButton';
import SearchBar from '@/components/SearchBar/SearchBar';
import CreateTransactionModal from '@/components/CreateTransactionModal/CreateTransactionModal';
import { Debt, Finance, createPerson, createConsumption, getConsumptions, getPersons, getAllTransactions } from '@/lib/api';
import CreateEntityModal from '@/components/CreateEntityModal/CreateEntityModal';
import FilterModal, { FilterPeriod } from '@/components/FilterModal/FilterModal';
import BackButton from '@/components/BackButton/BackButton';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/Pagination/Pagination';
import { useToast } from '@/components/Toast/ToastProvider';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingSkeleton from '@/components/LoadingSkeleton/LoadingSkeleton';

interface ExpensesContentProps {
    initialExpenses?: Debt[];
}

export default function ExpensesContent({ initialExpenses = [] }: ExpensesContentProps) {
    const router = useRouter();
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Filter State
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterPeriod>('all_time');
    const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});

    // Data State
    const [allTransactions, setAllTransactions] = useState<Finance[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Create Expense Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Add Transaction Modal State
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [activeExpenseId, setActiveExpenseId] = useState<number | null>(null);
    const [isTransactionSubmitting, setIsTransactionSubmitting] = useState(false);

    // Pagination for expenses list
    const fetchExpenses = useCallback((page: number) => getPersons('consumption', page), []);
    const { data: expenses, currentPage, totalPages, loading: expensesLoading, goToPage, reload: reloadExpenses } = usePagination(
        fetchExpenses,
        [debouncedSearchQuery]
    );

    // Fetch all transactions for client-side filtering
    const fetchTransactions = async () => {
        setIsLoadingData(true);
        const data = await getAllTransactions(getConsumptions);
        setAllTransactions(data);
        setIsLoadingData(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Calculate expenses based on filter
    const calculatedExpenses = expenses.map(expense => {
        // If "All Time", use the total_sum from the person object
        if (activeFilter === 'all_time') {
            return expense;
        }

        const now = new Date();
        let start: Date | null = null;
        let end: Date | null = null;

        if (activeFilter === 'this_month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        } else if (activeFilter === 'last_month') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        } else if (activeFilter === 'custom' && customDateRange.start && customDateRange.end) {
            start = customDateRange.start;
            end = new Date(customDateRange.end);
            end.setHours(23, 59, 59);
        }

        const expenseTransactions = allTransactions.filter(t =>
            (typeof t.person === 'object' ? t.person.id : t.person) === expense.id
        );

        const filteredTransactions = expenseTransactions.filter(t => {
            if (!start || !end) return true;
            const date = new Date(t.create_dt || 0);
            return date >= start && date <= end;
        });

        const sum = filteredTransactions.reduce((acc, t) => acc + parseFloat(t.cash), 0);

        return {
            ...expense,
            total_sum: sum.toString()
        };
    });

    const filteredExpenses = calculatedExpenses.filter(expense => {
        if (debouncedSearchQuery && !expense.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
            return false;
        }
        return true;
    }).sort((a, b) => b.id - a.id);

    const handleCreate = async (name: string) => {
        setIsCreating(true);
        const success = await createPerson({
            name,
            type_class: 'consumption',
        });

        if (success) {
            setIsCreateModalOpen(false);
            toast.success('Расход успешно создан');
            reloadExpenses();
            fetchTransactions(); // Refresh transactions
            router.refresh();
        } else {
            toast.error('Ошибка при создании записи');
        }
        setIsCreating(false);
    };

    const handleOpenTransactionModal = (id: number) => {
        setActiveExpenseId(id);
        setIsTransactionModalOpen(true);
    };

    const handleCreateTransaction = async (data: { amount: string; comment: string }) => {
        if (!activeExpenseId) return;

        setIsTransactionSubmitting(true);
        const success = await createConsumption({
            name: data.comment,
            cash: data.amount,
            person: activeExpenseId,
        });

        if (success) {
            setIsTransactionModalOpen(false);
            setActiveExpenseId(null);
            toast.success('Транзакция успешно создана');
            reloadExpenses();
            fetchTransactions(); // Refresh transactions to update sums
            router.refresh();
        } else {
            toast.error('Ошибка при создании транзакции');
        }
        setIsTransactionSubmitting(false);
    };

    const handleApplyFilter = (filter: FilterPeriod, start?: Date, end?: Date) => {
        setActiveFilter(filter);
        if (filter === 'custom') {
            setCustomDateRange({ start, end });
        }
    };

    return (
        <main style={{ paddingBottom: '100px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <BackButton />
                <div style={{ flex: 1 }}>
                    <SearchBar onSearch={setSearchQuery} />
                </div>
                <button
                    onClick={() => setIsFilterModalOpen(true)}
                    style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: activeFilter !== 'all_time' ? '#10b981' : '#6b7280'
                    }}
                >
                    <Filter size={24} />
                </button>
            </div>

            {(expensesLoading || isLoadingData) ? (
                <div style={{ marginTop: '16px' }}>
                    <LoadingSkeleton count={5} />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    {filteredExpenses.map((expense) => (
                        <ExpenseCard
                            key={expense.id}
                            title={expense.name}
                            amount={parseFloat(expense.total_sum)}
                            href={{
                                pathname: `/expenses/${expense.id}`,
                                query: { name: expense.name }
                            }}
                            onAdd={() => handleOpenTransactionModal(expense.id)}
                        />
                    ))}
                    {filteredExpenses.length === 0 && !expensesLoading && !isLoadingData && (
                        <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '32px' }}>
                            Ничего не найдено
                        </div>
                    )}
                </div>
            )}

            {/* Pagination controls */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    loading={expensesLoading}
                />
            )}

            <FloatingButton onClick={() => setIsCreateModalOpen(true)} />

            <CreateEntityModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isLoading={isCreating}
                title="Новый расход"
                placeholder="Название расхода"
            />

            <CreateTransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onSubmit={handleCreateTransaction}
                type="plus"
                isLoading={isTransactionSubmitting}
            />

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                activeFilter={activeFilter}
                onApply={handleApplyFilter}
            />
        </main>
    );
}

