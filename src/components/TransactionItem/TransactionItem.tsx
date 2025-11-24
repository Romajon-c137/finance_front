import React from 'react';
import styles from './TransactionItem.module.css';

interface TransactionItemProps {
    date: string;
    amount: number;
    time: string;
    currency?: string;
    showSign?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ date, amount, time, currency = 'с', showSign = true }) => {
    const formattedAmount = amount.toLocaleString('ru-RU').replace(',', '.');
    const sign = showSign ? (amount > 0 ? '+' : '') : '';

    return (
        <div className={styles.item}>
            <div className={styles.left}>
                <span className={styles.date}>{date}</span>
                <span className={styles.amount}>{sign}{formattedAmount} {currency}</span>
            </div>
            <span className={styles.time}>{time}</span>
        </div>
    );
};

export default TransactionItem;
