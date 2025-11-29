
"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Filter } from 'lucide-react';
import ExpenseCard from '@/components/ExpenseCard/ExpenseCard';
import FloatingButton from '@/components/FloatingButton/FloatingButton';
import SearchBar from '@/components/SearchBar/SearchBar';
import CreateTransactionModal from '@/components/CreateTransactionModal/CreateTransactionModal';
import { Debt, Finance, createPerson, createConsumption, getConsumptions } from '@/lib/api';
import CreateEntityModal from '@/components/CreateEntityModal/CreateEntityModal';
import FilterModal, { FilterPeriod } from '@/components/FilterModal/FilterModal';
import BackButton from '@/components/BackButton/BackButton';

interface ExpensesContentProps {
    initialExpenses: Debt[];
}

export default function ExpensesContent({ initialExpenses }: ExpensesContentProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter State
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterPeriod>('all_time');
    const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});

    // Data State
    const [allTransactions, setAllTransactions] = useState<Finance[]>([]);
    const [calculatedExpenses, setCalculatedExpenses] = useState<Debt[]>(initialExpenses);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Create Expense Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Add Transaction Modal State
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [activeExpenseId, setActiveExpenseId] = useState<number | null>(null);
    const [isTransactionSubmitting, setIsTransactionSubmitting] = useState(false);

    // Fetch all transactions for client-side filtering
    const fetchTransactions = async () => {
        setIsLoadingData(true);
        const data = await getConsumptions();
        setAllTransactions(data);
        setIsLoadingData(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Recalculate totals when filter or transactions change
    useEffect(() => {
        if (isLoadingData) return;

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

        const newExpenses = initialExpenses.map(expense => {
            // If "All Time", use the total_sum from the person object (or recalculate if we trust transactions more)
            // The user requirement says: "if in this month ... sum only this operation".
            // So we should recalculate from transactions for consistency.

            if (activeFilter === 'all_time') {
                return expense; // Use default total_sum
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

        setCalculatedExpenses(newExpenses);

    }, [activeFilter, customDateRange, allTransactions, initialExpenses, isLoadingData]);


    const filteredExpenses = calculatedExpenses.filter(expense => {
        if (searchQuery && !expense.name.toLowerCase().includes(searchQuery.toLowerCase())) {
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
            router.refresh();
            fetchTransactions(); // Refresh transactions
        } else {
            alert('Ошибка при создании записи');
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
            router.refresh();
            fetchTransactions(); // Refresh transactions to update sums
        } else {
            alert('Ошибка при создании транзакции');
        }
        setIsTransactionSubmitting(false);
    };

    const handleApplyFilter = (filter: FilterPeriod, start?: Date, end?: Date) => {
        setActiveFilter(filter);
        if (filter === 'custom') {
            setCustomDateRange({ start, end });
        }
    };

    // ...

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
                {filteredExpenses.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '32px' }}>
                        Ничего не найдено
                    </div>
                )}
            </div>

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

