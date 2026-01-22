"use client"
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DebtCard from '@/components/DebtCard/DebtCard';
import TransactionItem from '@/components/TransactionItem/TransactionItem';
import CreateTransactionModal from '@/components/CreateTransactionModal/CreateTransactionModal';
import { Debt, Finance, createSalary, getSalaryPerson, getPersonTransactions } from '@/lib/api';
import styles from './SalaryDetailContent.module.css';
import BackButton from '@/components/BackButton/BackButton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/Pagination/Pagination';

interface SalaryDetailContentProps {
    personId: string;
}

export default function SalaryDetailContent({ personId }: SalaryDetailContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialName = searchParams.get('name');

    const [person, setPerson] = useState<Debt | null>(null);
    const [isLoadingPerson, setIsLoadingPerson] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination for transactions
    const fetchTransactions = useCallback((page: number) => getPersonTransactions(personId, page), [personId]);
    const { data: transactions, currentPage, totalPages, loading, goToPage, reload } = usePagination(
        fetchTransactions,
        []
    );

    const fetchPerson = async () => {
        setIsLoadingPerson(true);
        const personData = await getSalaryPerson(personId);
        setPerson(personData);
        setIsLoadingPerson(false);
    };

    useEffect(() => {
        fetchPerson();
    }, [personId]);

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
        if (!person) return;

        setIsSubmitting(true);
        // For Salaries, "plus" likely means adding to the balance (accruing/paying).
        // Using 'plus' as default for now.
        // Use createSalary for salary transactions
        const success = await createSalary({
            cash: data.amount,
            name: data.comment,
            person: person.id,
        });

        if (success) {
            setIsModalOpen(false);
            reload(); // Reload transactions
            fetchPerson(); // Refresh person to update total sum
            router.refresh();
        } else {
            alert('Ошибка при создании записи');
        }
        setIsSubmitting(false);
    };

    if (isLoadingPerson) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>;
    }

    if (!person) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>Сотрудник не найден</div>;
    }

    return (
        <main style={{ paddingBottom: '100px' }}>
            <div style={{ marginBottom: '16px' }}>
                <BackButton />
            </div>
            <DebtCard
                name={person.name}
                amount={parseFloat(person.total_sum)}
                showActions={false}
            />

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {sortedTransactions.map((item) => (
                    <TransactionItem
                        key={item.id}
                        name={item.name}
                        date={new Date(item.create_dt || Date.now()).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        amount={parseFloat(item.cash)}
                        time={new Date(item.create_dt || Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        showSign={false}
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
