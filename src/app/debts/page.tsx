import { getDebts } from '@/lib/api';
import DebtsContent from '@/components/DebtsContent/DebtsContent';

export default async function DebtsPage() {
    const debts = await getDebts();

    return <DebtsContent initialDebts={debts} />;
}
