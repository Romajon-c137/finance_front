import DebtCard from '@/components/DebtCard/DebtCard';
import TransactionItem from '@/components/TransactionItem/TransactionItem';
import ActionButtons from '@/components/ActionButtons/ActionButtons';

export default function DebtDetailPage({ params }: { params: { id: string } }) {
    // Mock data logic based on ID
    const id = Number(params.id);
    let personName = 'Рустамжон';
    let totalAmount = -150000;
    let history = [
        { id: 1, date: '18 нояб 2025', amount: -50000, time: '12:00' },
        { id: 2, date: '18 нояб 2025', amount: -50000, time: '12:00' },
        { id: 3, date: '18 нояб 2025', amount: -50000, time: '12:00' },
    ];

    if (id === 2) { // Alisher
        personName = 'Алишер';
        totalAmount = 30000;
        history = [
            { id: 1, date: '18 нояб 2025', amount: -30000, time: '12:00' },
            { id: 2, date: '18 нояб 2025', amount: -20000, time: '12:00' },
            { id: 3, date: '18 нояб 2025', amount: 80000, time: '12:00' }, // +80k to result in +30k total (-50 + 80 = 30)
        ];
    } else if (id > 2) {
        // Generic data for others
        personName = 'Сотрудник ' + id;
        totalAmount = -10000;
        history = [
            { id: 1, date: '18 нояб 2025', amount: -10000, time: '12:00' },
        ];
    }

    return (
        <main style={{ paddingBottom: '100px' }}>
            <DebtCard
                name={personName}
                amount={totalAmount}
                showActions={false}
            />

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column' }}>
                {history.map((item) => (
                    <TransactionItem
                        key={item.id}
                        date={item.date}
                        amount={item.amount}
                        time={item.time}
                    />
                ))}
            </div>

            <ActionButtons />
        </main>
    );
}
