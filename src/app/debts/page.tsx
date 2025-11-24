"use client"
import { useState } from 'react';
import DebtCard from '@/components/DebtCard/DebtCard';
import FloatingButton from '@/components/FloatingButton/FloatingButton';
import Link from 'next/link';
import { subMonths } from 'date-fns';

// Mock data with dates for filtering
const MOCK_DEBTS = [
    { id: 1, name: 'Рустамжон', amount: -150000, date: new Date() }, // Сегодня (Этот месяц)
    { id: 2, name: 'Алишер', amount: 50000, date: subMonths(new Date(), 1) }, // Прошлый месяц
    { id: 3, name: 'Малик', amount: -25000, date: new Date() }, // Сегодня (Этот месяц)
    { id: 4, name: 'Сардор', amount: 120000, date: subMonths(new Date(), 1) }, // Прошлый месяц
    { id: 5, name: 'Фарход', amount: -10000, date: subMonths(new Date(), 2) }, // 2 месяца назад (За все время)
    { id: 6, name: 'Джамшед', amount: -5000, date: new Date() }, // Сегодня (Этот месяц)
];

export default function DebtsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDebts = MOCK_DEBTS.filter(debt => {
        // Filter by search query
        if (searchQuery && !debt.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });

    return (
        <main style={{ paddingBottom: '100px' }}>
         

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {filteredDebts.map((debt) => (
                    <Link key={debt.id} href={`/debts/${debt.id}`} style={{ width: '100%' }}>
                        <DebtCard
                            name={debt.name}
                            amount={debt.amount}
                        />
                    </Link>
                ))}
                {filteredDebts.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '32px' }}>
                        Ничего не найдено
                    </div>
                )}
            </div>

            <FloatingButton />
        </main>
    );
}
