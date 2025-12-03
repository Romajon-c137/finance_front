import { getDebts } from '@/lib/api';
import DebtsContent from '@/components/DebtsContent/DebtsContent';

export default async function DebtsPage() {
    console.log('[DebtsPage] Fetching debts...');
    const debts = await getDebts();
    console.log('[DebtsPage] Fetched debts:', debts);
    console.log('[DebtsPage] Debts count:', debts.length);

    return <DebtsContent initialDebts={debts} />;
}
