import React from 'react';
import { Package, Plus } from 'lucide-react';
import styles from './ExpenseCard.module.css';

interface ExpenseCardProps {
    title: string;
    amount: number;
    currency?: string;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ title, amount, currency = 'с' }) => {
    const formattedAmount = amount.toLocaleString('ru-RU').replace(',', '.');

    return (
        <div className={styles.card}>
            <div className={styles.left}>
                <div className={styles.iconWrapper}>
                    <Package size={24} />
                </div>
                <div className={styles.info}>
                    <span className={styles.title}>{title}</span>
                    <span className={styles.amount}>{formattedAmount} {currency}</span>
                </div>
            </div>
            <button className={styles.addButton}>
                <Plus size={24} strokeWidth={3} />
            </button>
        </div>
    );
};

export default ExpenseCard;
