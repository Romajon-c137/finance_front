import React from 'react';
import { User, Plus } from 'lucide-react';
import styles from './SalaryCard.module.css';

interface SalaryCardProps {
    name: string;
    amount: number;
    currency?: string;
}

const SalaryCard: React.FC<SalaryCardProps> = ({ name, amount, currency = '' }) => {
    // Format amount with spaces (e.g., 5 000)
    const formattedAmount = amount.toLocaleString('ru-RU').replace(',', '.');

    return (
        <div className={styles.card}>
            <div className={styles.leftSection}>
                <div className={styles.avatar}>
                    <User size={28} />
                </div>
                <div className={styles.info}>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.amount}>{formattedAmount} {currency}</span>
                </div>
            </div>
            <button className={styles.addButton}>
                <Plus size={24} strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default SalaryCard;
