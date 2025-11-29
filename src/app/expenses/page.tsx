import { getPersons } from '@/lib/api';
import ExpensesContent from '@/components/ExpensesContent/ExpensesContent';

export default async function ExpensesPage() {
    const expenses = await getPersons('consumption');

    return <ExpensesContent initialExpenses={expenses} />;
}
