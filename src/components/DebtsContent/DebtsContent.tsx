"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DebtCard from '@/components/DebtCard/DebtCard';
import FloatingButton from '@/components/FloatingButton/FloatingButton';
import SearchBar from '@/components/SearchBar/SearchBar';
import CreateEntityModal from '@/components/CreateEntityModal/CreateEntityModal';
import CreateTransactionModal from '@/components/CreateTransactionModal/CreateTransactionModal';
import { Debt, createPerson, createFinance } from '@/lib/api';
import BackButton from '@/components/BackButton/BackButton';

interface DebtsContentProps {
    initialDebts: Debt[];
}

export default function DebtsContent({ initialDebts }: DebtsContentProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Transaction Modal State
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'plus' | 'minus'>('plus');
    const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
    const [isTransactionLoading, setIsTransactionLoading] = useState(false);

    const filteredDebts = initialDebts.filter(debt => {
        if (searchQuery && !debt.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    }).sort((a, b) => b.id - a.id);

    const handleCreate = async (name: string) => {
        setIsCreating(true);
        const success = await createPerson({
            name,
            type_class: 'finance',
        });

        if (success) {
            setIsCreateModalOpen(false);
            router.refresh(); // Refresh data
        } else {
            alert('Ошибка при создании записи');
        }
        setIsCreating(false);
    };

    const openTransactionModal = (personId: number, type: 'plus' | 'minus') => {
        setSelectedPersonId(personId);
        setTransactionType(type);
        setIsTransactionModalOpen(true);
    };

    const handleCreateTransaction = async (data: { amount: string; comment: string }) => {
        if (!selectedPersonId) return;

        setIsTransactionLoading(true);
        const success = await createFinance({
            cash: data.amount,
            name: data.comment,
            person: selectedPersonId,
            type_finance: transactionType,
            return_cash: true,
        });

        if (success) {
            setIsTransactionModalOpen(false);
            setSelectedPersonId(null);
            router.refresh();
        } else {
            alert('Ошибка при создании транзакции');
        }
        setIsTransactionLoading(false);
    };

    return (
        <main style={{ paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BackButton />
                <div style={{ flex: 1 }}>
                    <SearchBar onSearch={setSearchQuery} />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {filteredDebts.map((debt) => (
                    <Link
                        key={debt.id}
                        href={{
                            pathname: `/debts/${debt.id}`,
                            query: { name: debt.name }
                        }}
                        style={{ width: '100%' }}
                    >
                        <DebtCard
                            name={debt.name}
                            amount={parseFloat(debt.total_sum)}
                            onAccept={() => openTransactionModal(debt.id, 'plus')}
                            onGive={() => openTransactionModal(debt.id, 'minus')}
                        />
                    </Link>
                ))}

                {filteredDebts.length === 0 && (
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
                title="Новый долг"
                placeholder="Имя персоны"
            />

            <CreateTransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onSubmit={handleCreateTransaction}
                type={transactionType}
                isLoading={isTransactionLoading}
            />
        </main>
    );
}
