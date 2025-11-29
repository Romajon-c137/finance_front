'use client';

import React, { useState, useEffect } from 'react';
import styles from './CreateTransactionModal.module.css';

interface CreateTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { amount: string; comment: string }) => void;
    type: 'plus' | 'minus';
    isLoading?: boolean;
}

const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    type,
    isLoading = false
}) => {
    const [amount, setAmount] = useState('');
    const [comment, setComment] = useState('');

    // Reset fields when modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setComment('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            setAmount('');
            return;
        }
        const formatted = parseInt(value).toLocaleString('ru-RU');
        setAmount(formatted);
    };

    const handleSubmit = () => {
        if (!amount) return;
        // Remove spaces before submitting
        const cleanAmount = amount.replace(/\s/g, '');
        // Default comment to '-' if empty
        const finalComment = comment.trim() || '-';
        onSubmit({ amount: cleanAmount, comment: finalComment });
    };

    const title = type === 'plus' ? 'Принять' : 'Отдать';

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>{title}</h3>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Сумма</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        className={styles.input}
                        placeholder="0"
                        value={amount}
                        onChange={handleAmountChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Комментарий</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Введите комментарий"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={isLoading || !amount}
                >
                    {isLoading ? 'Сохранение...' : 'Подтвердить'}
                </button>
            </div>
        </div>
    );
};

export default CreateTransactionModal;
