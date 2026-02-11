import Link from 'next/link';
import Card from '@/components/Card/Card';

export default function Home() {
  return (
    <main>
      <Link href="/debts" style={{ width: '100%' }}>
        <Card
          title="долги, задолженности"
          variant="debts"
          iconSrc="/card_user.svg"
        />
      </Link>
      <Link href="/expenses" style={{ width: '100%' }}>
        <Card
          title="Расходы"
          variant="expenses"
          iconSrc="/solar_box-bold.svg"
        />
      </Link>
      <Link href="/salaries" style={{ width: '100%' }}>
        <Card
          title="Зарплаты сотрудникам"
          variant="salaries"
          iconSrc="/mdi_users.svg"
        />
      </Link>
    </main>
  );
}
