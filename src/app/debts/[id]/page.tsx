import DebtDetailContent from '@/components/DebtDetailContent/DebtDetailContent';

export default async function DebtDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DebtDetailContent personId={id} />;
}
