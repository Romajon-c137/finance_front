"use client"
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ExpenseCard from '@/components/ExpenseCard/ExpenseCard';
import TransactionItem from '@/components/TransactionItem/TransactionItem';
import CreateTransactionModal from '@/components/CreateTransactionModal/CreateTransactionModal';
import { Debt, Finance, createConsumption, getExpense, getPersonTransactions } from '@/lib/api';
import styles from './ExpenseDetailContent.module.css';
import BackButton from '@/components/BackButton/BackButton';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/Pagination/Pagination';

interface ExpenseDetailContentProps {
    expenseId: string;
}

export default function ExpenseDetailContent({ expenseId }: ExpenseDetailContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialName = searchParams.get('name');

    const [expense, setExpense] = useState<Debt | null>(null);
    const [isLoadingExpense, setIsLoadingExpense] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination for transactions
    const fetchTransactions = useCallback((page: number) => getPersonTransactions(expenseId, page), [expenseId]);
    const { data: transactions, currentPage, totalPages, loading, goToPage, reload } = usePagination(
        fetchTransactions,
        []
    );

    const fetchExpense = async () => {
        setIsLoadingExpense(true);
        const expenseData = await getExpense(expenseId);
        setExpense(expenseData);
        setIsLoadingExpense(false);
    };

    useEffect(() => {
        fetchExpense();
    }, [expenseId]);

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(a.create_dt || 0).getTime();
        const dateB = new Date(b.create_dt || 0).getTime();
        if (dateB !== dateA) {
            return dateB - dateA;
        }
        return b.id - a.id;
    });

    const handleCreateTransaction = async (data: { amount: string; comment: string }) => {
        if (!expense) return;

        setIsSubmitting(true);

        // Use createConsumption instead of createFinance
        const success = await createConsumption({
            cash: data.amount,
            name: data.comment,
            person: expense.id,
        });

        if (success) {
            setIsModalOpen(false);
            reload(); // Reload transactions
            fetchExpense(); // Refresh expense to update total sum
            router.refresh();
        } else {
            alert('Ошибка при создании записи');
        }
        setIsSubmitting(false);
    };

    if (isLoadingExpense) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>;
    }

    if (!expense) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>Расход не найден</div>;
    }

    return (
        <main style={{ paddingBottom: '100px' }}>
            <div style={{ marginBottom: '16px' }}>
                <BackButton />
            </div>
            <ExpenseCard
                title={expense.name}
                amount={parseFloat(expense.total_sum)}
            />

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {sortedTransactions.map((item) => (
                    <TransactionItem
                        key={item.id}
                        name={item.name}
                        date={new Date(item.create_dt || Date.now()).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        amount={parseFloat(item.cash)}
                        time={new Date(item.create_dt || Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        showSign={false} // Expenses usually don't need +/- sign, or always +
                    />
                ))}
                {sortedTransactions.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '32px' }}>
                        История пуста
                    </div>
                )}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    loading={loading}
                />
            )}

            {/* Custom Action Button for Expenses - Only Plus */}
            <div className={styles.actionContainer}>
                <button
                    className={styles.plusButton}
                    onClick={() => setIsModalOpen(true)}
                >
                    Добавить +
                </button>
            </div>

            <CreateTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTransaction}
                type="plus"
                isLoading={isSubmitting}
            />
        </main>
    );
}
