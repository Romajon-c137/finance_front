import DebtCard from '@/components/DebtCard/DebtCard';
import TransactionItem from '@/components/TransactionItem/TransactionItem';
import FloatingButton from '@/components/FloatingButton/FloatingButton';

// Mock data for history
const MOCK_HISTORY = [
    { id: 1, date: '18 нояб 2025', amount: 1500, time: '12:00' },
    { id: 2, date: '18 нояб 2025', amount: 1500, time: '12:00' },
    { id: 3, date: '18 нояб 2025', amount: 1500, time: '12:00' },
    { id: 4, date: '18 нояб 2025', amount: 1500, time: '12:00' },
    { id: 5, date: '18 нояб 2025', amount: 1500, time: '12:00' },
    { id: 6, date: '18 нояб 2025', amount: 1500, time: '12:00' },
    { id: 7, date: '18 нояб 2025', amount: 1500, time: '12:00' },
];

export default function SalaryDetailPage({ params }: { params: { id: string } }) {
    // In a real app, we would fetch data based on params.id
    const personName = 'bilol';
    const totalAmount = 157500;

    return (
        <main style={{ paddingBottom: '100px' }}>
            <DebtCard
                name={personName}
                amount={totalAmount}
                showActions={false}
            />

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column' }}>
                {MOCK_HISTORY.map((item) => (
                    <TransactionItem
                        key={item.id}
                        date={item.date}
                        amount={item.amount}
                        time={item.time}
                        showSign={false}
                    />
                ))}
            </div>

            <FloatingButton />
        </main>
    );
}
