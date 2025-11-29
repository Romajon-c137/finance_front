"use client"
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import DebtCard from '@/components/DebtCard/DebtCard';
import TransactionItem from '@/components/TransactionItem/TransactionItem';
import ActionButtons from '@/components/ActionButtons/ActionButtons';
import CreateTransactionModal from '@/components/CreateTransactionModal/CreateTransactionModal';
import { Debt, Finance, createFinance, getPerson, getPersonTransactions } from '@/lib/api';
import BackButton from '@/components/BackButton/BackButton';

interface DebtDetailContentProps {
    personId: string;
}

export default function DebtDetailContent({ personId }: DebtDetailContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialName = searchParams.get('name');

    const [person, setPerson] = useState<Debt | null>(null);
    const [transactions, setTransactions] = useState<Finance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'plus' | 'minus'>('plus');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch person details (for name and total sum)
            // We still use getPerson (which falls back to list lookup) because direct endpoint is 404
            const personData = await getPerson(personId);

            // Fetch transactions from the new specific endpoint
            const transactionsData = await getPersonTransactions(personId);

            // Sort by date descending (newest first), use ID as tie-breaker
            transactionsData.sort((a, b) => {
                const dateA = new Date(a.create_dt || 0).getTime();
                const dateB = new Date(b.create_dt || 0).getTime();
                if (dateB !== dateA) {
                    return dateB - dateA;
                }
                return b.id - a.id;
            });

            setPerson(personData);
            setTransactions(transactionsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [personId]);

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
            await fetchData(); // Refresh data to show new transaction and updated sum
            router.refresh();
        } else {
            alert('Ошибка при создании транзакции');
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>;
    }

    if (!person) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>Персона не найдена</div>;
    }

    // ...

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
                {transactions.map((item) => (
                    <TransactionItem
                        key={item.id}
                        name={item.name}
                        date={new Date(item.create_dt || Date.now()).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        amount={parseFloat(item.cash) * (item.type_finance === 'minus' ? -1 : 1)}
                        time={new Date(item.create_dt || Date.now()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    />
                ))}
                {transactions.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '32px' }}>
                        История пуста
                    </div>
                )}
            </div>

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
