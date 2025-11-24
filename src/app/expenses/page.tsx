import ExpenseCard from '@/components/ExpenseCard/ExpenseCard';
import FloatingButton from '@/components/FloatingButton/FloatingButton';
import Link from 'next/link';

const MOCK_EXPENSES = [
    { id: 1, title: 'Обед', amount: 157500 },
    { id: 2, title: 'Обед', amount: 157500 },
    { id: 3, title: 'Обед', amount: 157500 },
    { id: 4, title: 'Обед', amount: 157500 },
];

import SearchBar from '@/components/SearchBar/SearchBar';

export default function ExpensesPage() {
    return (
        <main style={{ paddingBottom: '100px' }}>
            <SearchBar />
            {MOCK_EXPENSES.map((expense) => (
                <Link key={expense.id} href={`/expenses/${expense.id}`} style={{ width: '100%' }}>
                    <ExpenseCard
                        title={expense.title}
                        amount={expense.amount}
                    />
                </Link>
            ))}
            <FloatingButton />
        </main>
    );
}
