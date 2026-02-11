import ExpenseDetailContent from '@/components/ExpenseDetailContent/ExpenseDetailContent';

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ExpenseDetailContent expenseId={id} />;
}
