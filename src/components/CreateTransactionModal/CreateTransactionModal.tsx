'use client';

import React, { useState, useEffect } from 'react';
import styles from './CreateTransactionModal.module.css';
import { validateAmount, validateComment } from '@/lib/validation';

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
    const [amountError, setAmountError] = useState<string>('');
    const [commentError, setCommentError] = useState<string>('');

    // Reset fields when modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setComment('');
            setAmountError('');
            setCommentError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            setAmount('');
            if (amountError) setAmountError('');
            return;
        }
        const formatted = parseInt(value).toLocaleString('ru-RU');
        setAmount(formatted);
        if (amountError) setAmountError('');
    };

    const handleCommentChange = (value: string) => {
        setComment(value);
        if (commentError) setCommentError('');
    };

    const handleSubmit = () => {
        // Remove spaces for validation
        const cleanAmount = amount.replace(/\s/g, '');

        const amountValidation = validateAmount(cleanAmount);
        const commentValidation = validateComment(comment);

        let hasError = false;

        if (!amountValidation.isValid) {
            setAmountError(amountValidation.error || '');
            hasError = true;
        }

        if (!commentValidation.isValid) {
            setCommentError(commentValidation.error || '');
            hasError = true;
        }

        if (hasError) return;

        setAmountError('');
        setCommentError('');
        onSubmit({ amount: cleanAmount, comment: comment.trim() });
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
                        className={`${styles.input} ${amountError ? styles.inputError : ''}`}
                        placeholder="0"
                        value={amount}
                        onChange={handleAmountChange}
                    />
                    {amountError && <span className={styles.errorText}>{amountError}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Комментарий</label>
                    <input
                        type="text"
                        className={`${styles.input} ${commentError ? styles.inputError : ''}`}
                        placeholder="Введите комментарий"
                        value={comment}
                        onChange={(e) => handleCommentChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    {commentError && <span className={styles.errorText}>{commentError}</span>}
                </div>

                <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Сохранение...' : 'Подтвердить'}
                </button>
            </div>
        </div>
    );
};

export default CreateTransactionModal;
