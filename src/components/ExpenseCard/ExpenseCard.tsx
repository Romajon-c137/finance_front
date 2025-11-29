import React from 'react';
import { Package, Plus } from 'lucide-react';
import styles from './ExpenseCard.module.css';

import Link from 'next/link';
import { Url } from 'next/dist/shared/lib/router/router';

interface ExpenseCardProps {
    title: string;
    amount: number;
    currency?: string;
    href?: Url;
    onAdd?: () => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ title, amount, currency = 'с', href, onAdd }) => {
    const formattedAmount = amount.toLocaleString('ru-RU').replace(',', '.');

    const Content = () => (
        <div className={styles.left}>
            <div className={styles.iconWrapper}>
                <Package size={24} />
            </div>
            <div className={styles.info}>
                <span className={styles.title}>{title}</span>
                <span className={styles.amount}>{formattedAmount} {currency}</span>
            </div>
        </div>
    );

    return (
        <div className={styles.card}>
            {href ? (
                <Link href={href} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
                    <Content />
                </Link>
            ) : (
                <div style={{ flex: 1 }}>
                    <Content />
                </div>
            )}
            <button
                className={styles.addButton}
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd?.();
                }}
            >
                <Plus size={24} strokeWidth={3} />
            </button>
        </div>
    );
};

export default ExpenseCard;
