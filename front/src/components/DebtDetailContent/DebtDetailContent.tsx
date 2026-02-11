"use client"
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import DebtCard from '@/components/DebtCard/DebtCard';
import TransactionItem from '@/components/TransactionItem/TransactionItem';
import ActionButtons from '@/components/ActionButtons/ActionButtons';
import CreateTransactionModal from '@/components/CreateTransactionModal/CreateTransactionModal';
import { Debt, Finance, createFinance, getPerson, getPersonTransactions } from '@/lib/api';
import BackButton from '@/components/BackButton/BackButton';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/Pagination/Pagination';

interface DebtDetailContentProps {
    personId: string;
}

export default function DebtDetailContent({ personId }: DebtDetailContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialName = searchParams.get('name');

    const [person, setPerson] = useState<Debt | null>(null);
    const [isLoadingPerson, setIsLoadingPerson] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'plus' | 'minus'>('plus');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination for transactions
    const fetchTransactions = useCallback((page: number) => getPersonTransactions(personId, page), [personId]);
    const { data: transactions, currentPage, totalPages, loading, goToPage, reload } = usePagination(
        fetchTransactions,
        []
    );

    const fetchPerson = async () => {
        setIsLoadingPerson(true);
        const personData = await getPerson(personId);
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

    const openModal = (type: 'plus' | 'minus') => {
        setTransactionType(type);
        setIsModalOpen(true);
    };

    const handleCreateTransaction = async (data: { amount: string; comment: string }) => {
        if (!person) return;

        setIsSubmitting(true);
        const success = await createFinance({
            cash: data.amount,
            name: data.comment,
            person: person.id,
            type_finance: transactionType,
            return_cash: true,
        });

        if (success) {
            setIsModalOpen(false);
            reload(); // Reload transactions
            fetchPerson(); // Refresh person to update total sum
            router.refresh();
        } else {
            alert('Ошибка при создании транзакции');
        }
        setIsSubmitting(false);
    };

    if (isLoadingPerson) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>;
    }

    if (!person) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>Персона не найдена</div>;
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
                        amount={parseFloat(item.cash) * (item.type_finance === 'minus' ? -1 : 1)}
                        time={new Date(item.create_dt || Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
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

            <ActionButtons
                onPlus={() => openModal('plus')}
                onMinus={() => openModal('minus')}
            />

            <CreateTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTransaction}
                type={transactionType}
                isLoading={isSubmitting}
            />
        </main>
    );
}
