'use client';

import React, { useState } from 'react';
import styles from './CreateDebtModal.module.css';

interface CreateDebtModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; amount: string; type: 'plus' | 'minus' }) => void;
    isLoading?: boolean;
}

const CreateDebtModal: React.FC<CreateDebtModalProps> = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'plus' | 'minus'>('minus');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name || !amount) return;
        onSubmit({ name, amount, type });
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>Новая запись</h3>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Имя</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Введите имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Сумма</label>
                    <input
                        type="number"
                        className={styles.input}
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Тип операции</label>
                    <div className={styles.typeButtons}>
                        <button
                            className={`${styles.typeButton} ${type === 'plus' ? styles.activePlus : ''}`}
                            onClick={() => setType('plus')}
                        >
                            Принять +
                        </button>
                        <button
                            className={`${styles.typeButton} ${type === 'minus' ? styles.activeMinus : ''}`}
                            onClick={() => setType('minus')}
                        >
                            Отдать -
                        </button>
                    </div>
                </div>

                <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={isLoading || !name || !amount}
                >
                    {isLoading ? 'Сохранение...' : 'Создать'}
                </button>
            </div>
        </div>
    );
};

export default CreateDebtModal;
