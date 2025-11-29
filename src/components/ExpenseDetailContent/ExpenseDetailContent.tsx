"use client"
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ExpenseCard from '@/components/ExpenseCard/ExpenseCard';
import TransactionItem from '@/components/TransactionItem/TransactionItem';
import CreateTransactionModal from '@/components/CreateTransactionModal/CreateTransactionModal';
import { Debt, Finance, createConsumption, getExpense, getPersonTransactions } from '@/lib/api';
import styles from './ExpenseDetailContent.module.css';
import BackButton from '@/components/BackButton/BackButton';

interface ExpenseDetailContentProps {
    expenseId: string;
}

export default function ExpenseDetailContent({ expenseId }: ExpenseDetailContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialName = searchParams.get('name');

    const [expense, setExpense] = useState<Debt | null>(null);
    const [transactions, setTransactions] = useState<Finance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const expenseData = await getExpense(expenseId);
            const transactionsData = await getPersonTransactions(expenseId);

            // Sort by date descending (newest first), use ID as tie-breaker
            transactionsData.sort((a, b) => {
                const dateA = new Date(a.create_dt || 0).getTime();
                const dateB = new Date(b.create_dt || 0).getTime();
                if (dateB !== dateA) {
                    return dateB - dateA;
                }
                return b.id - a.id;
            });

            setExpense(expenseData);
            setTransactions(transactionsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [expenseId]);

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
            await fetchData();
            router.refresh();
        } else {
            alert('Ошибка при создании записи');
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>;
    }

    if (!expense) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>Расход не найден</div>;
    }

    // ...

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
                {transactions.map((item) => (
                    <TransactionItem
                        key={item.id}
                        name={item.name}
                        date={new Date(item.create_dt || Date.now()).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        amount={parseFloat(item.cash)}
                        time={new Date(item.create_dt || Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        showSign={false} // Expenses usually don't need +/- sign, or always +
                    />
                ))}
                {transactions.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '32px' }}>
                        История пуста
                    </div>
                )}
            </div>

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
