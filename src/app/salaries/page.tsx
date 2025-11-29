import { getPersons } from '@/lib/api';
import SalariesContent from '@/components/SalariesContent/SalariesContent';

export default async function SalariesPage() {
    const salaries = await getPersons('salary');

    return <SalariesContent initialSalaries={salaries} />;
}
