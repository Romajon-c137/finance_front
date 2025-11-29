import SalaryDetailContent from '@/components/SalaryDetailContent/SalaryDetailContent';

export default async function SalaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <SalaryDetailContent personId={id} />;
}
