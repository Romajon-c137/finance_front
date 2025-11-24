import SalaryCard from '@/components/SalaryCard/SalaryCard';
import FloatingButton from '@/components/FloatingButton/FloatingButton';

const MOCK_SALARIES = [
    { id: 1, name: 'Bilol', amount: 5000 },
    { id: 2, name: 'Bilol', amount: 5000 },
    { id: 3, name: 'Bilol', amount: 5000 },
    { id: 4, name: 'Bilol', amount: 5000 },
];

import Link from 'next/link';

import SearchBar from '@/components/SearchBar/SearchBar';

export default function SalariesPage() {
    return (
        <main style={{ paddingBottom: '100px' }}>
            <SearchBar />
            {MOCK_SALARIES.map((salary) => (
                <Link key={salary.id} href={`/salaries/${salary.id}`} style={{ width: '100%' }}>
                    <SalaryCard
                        name={salary.name}
                        amount={salary.amount}
                    />
                </Link>
            ))}
            <FloatingButton />
        </main>
    );
}
