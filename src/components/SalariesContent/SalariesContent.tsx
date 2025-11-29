"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';
import SalaryCard from '@/components/SalaryCard/SalaryCard';
import FloatingButton from '@/components/FloatingButton/FloatingButton';
import SearchBar from '@/components/SearchBar/SearchBar';
import CreateEntityModal from '@/components/CreateEntityModal/CreateEntityModal';
import CreateTransactionModal from '@/components/CreateTransactionModal/CreateTransactionModal';
import { Debt, Finance, createPerson, createFinance, createSalary, getSalaries } from '@/lib/api';
import FilterModal, { FilterPeriod } from '@/components/FilterModal/FilterModal';
import BackButton from '@/components/BackButton/BackButton';

interface SalariesContentProps {
    initialSalaries: Debt[];
}

export default function SalariesContent({ initialSalaries }: SalariesContentProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter State
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterPeriod>('all_time');
    const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});

    // Data State
    const [allTransactions, setAllTransactions] = useState<Finance[]>([]);
    const [calculatedSalaries, setCalculatedSalaries] = useState<Debt[]>(initialSalaries);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Transaction Modal State
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
    const [isTransactionLoading, setIsTransactionLoading] = useState(false);

    // Fetch all transactions for client-side filtering
    const fetchTransactions = async () => {
        setIsLoadingData(true);
        const data = await getSalaries();
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

        const newSalaries = initialSalaries.map(salary => {
            if (activeFilter === 'all_time') {
                return salary;
            }

            const salaryTransactions = allTransactions.filter(t =>
                (typeof t.person === 'object' ? t.person.id : t.person) === salary.id
            );

            const filteredTransactions = salaryTransactions.filter(t => {
                if (!start || !end) return true;
                const date = new Date(t.create_dt || 0);
                return date >= start && date <= end;
            });

            const sum = filteredTransactions.reduce((acc, t) => acc + parseFloat(t.cash), 0);

            return {
                ...salary,
                total_sum: sum.toString()
            };
        });

        setCalculatedSalaries(newSalaries);

    }, [activeFilter, customDateRange, allTransactions, initialSalaries, isLoadingData]);

    const filteredSalaries = calculatedSalaries.filter(salary => {
        if (searchQuery && !salary.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    }).sort((a, b) => b.id - a.id);

    const handleCreate = async (name: string) => {
        setIsCreating(true);
        const success = await createPerson({
            name,
            type_class: 'salary',
        });

        if (success) {
            setIsCreateModalOpen(false);
            router.refresh();
            fetchTransactions();
        } else {
            alert('Ошибка при создании записи');
        }
        setIsCreating(false);
    };

    const handleCardAdd = (personId: number) => {
        setSelectedPersonId(personId);
        setIsTransactionModalOpen(true);
    };

    const handleCreateTransaction = async (data: { amount: string; comment: string }) => {
        if (!selectedPersonId) return;

        setIsTransactionLoading(true);
        const success = await createSalary({
            cash: data.amount,
            name: data.comment,
            person: selectedPersonId,
        });

        if (success) {
            setIsTransactionModalOpen(false);
            setSelectedPersonId(null);
            router.refresh();
            fetchTransactions();
        } else {
            alert('Ошибка при создании транзакции');
        }
        setIsTransactionLoading(false);
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
                {filteredSalaries.map((salary) => (
                    <Link key={salary.id} href={`/salaries/${salary.id}`} style={{ width: '100%' }}>
                        <SalaryCard
                            name={salary.name}
                            amount={parseFloat(salary.total_sum)}
                            onAdd={() => handleCardAdd(salary.id)}
                        />
                    </Link>
                ))}
                {filteredSalaries.length === 0 && (
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
                title="Новый сотрудник"
                placeholder="Имя сотрудника"
            />

            <CreateTransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onSubmit={handleCreateTransaction}
                type="plus"
                isLoading={isTransactionLoading}
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
