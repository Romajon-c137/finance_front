import React from 'react';
import styles from './TransactionItem.module.css';

interface TransactionItemProps {
    name: string;
    date: string;
    amount: number;
    time: string;
    currency?: string;
    showSign?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ name, date, amount, time, currency = 'с', showSign = true }) => {
    const formattedAmount = amount.toLocaleString('ru-RU').replace(',', ' ');
    const sign = showSign ? (amount > 0 ? '+' : '') : '';

    return (
        <div className={styles.item}>
            <div className={styles.row}>
                <span className={styles.name}>{name === '-' ? '' : name}</span>
            </div>
            <div className={styles.row}>
                <span className={styles.amount}>{sign}{formattedAmount} {currency}</span>
                <div className={styles.datetime}>
                    <span className={styles.date}>{date}</span>
                    <span className={styles.time}>{time}</span>
                </div>
            </div>
        </div>
    );
};

export default TransactionItem;
