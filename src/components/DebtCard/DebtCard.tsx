import React from 'react';
import { User } from 'lucide-react';
import styles from './DebtCard.module.css';

interface DebtCardProps {
    name: string;
    amount: number;
    currency?: string;
    showActions?: boolean;
}

const DebtCard: React.FC<DebtCardProps> = ({ name, amount, currency = 'с', showActions = true }) => {
    // Format amount with spaces (e.g., -157 500)
    const formattedAmount = amount.toLocaleString('ru-RU').replace(',', '.');

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.info}>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.amount}>{amount > 0 ? '+' : ''}{formattedAmount} {currency}</span>
                </div>
                <div className={styles.avatar}>
                    <User size={32} />
                </div>
            </div>
            {showActions && (
                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.take}`}>Принять +</button>
                    <button className={`${styles.button} ${styles.give}`}>Отдать -</button>
                </div>
            )}
        </div>
    );
};

export default DebtCard;
