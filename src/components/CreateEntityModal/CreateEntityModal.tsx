'use client';

import React, { useState } from 'react';
import styles from './CreateEntityModal.module.css';
import { validateName } from '@/lib/validation';

interface CreateEntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    isLoading?: boolean;
    title?: string;
    placeholder?: string;
}

const CreateEntityModal: React.FC<CreateEntityModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    title = 'Новая запись',
    placeholder = 'Введите имя'
}) => {
    const [name, setName] = useState('');
    const [error, setError] = useState<string>('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        const validation = validateName(name);

        if (!validation.isValid) {
            setError(validation.error || '');
            return;
        }

        setError('');
        onSubmit(name);
        setName(''); // Reset after submit
    };

    const handleChange = (value: string) => {
        setName(value);
        if (error) {
            setError(''); // Clear error on change
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>{title}</h3>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Название</label>
                    <input
                        type="text"
                        className={`${styles.input} ${error ? styles.inputError : ''}`}
                        placeholder={placeholder}
                        value={name}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    {error && <span className={styles.errorText}>{error}</span>}
                </div>

                <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Сохранение...' : 'Создать'}
                </button>
            </div>
        </div>
    );
};

export default CreateEntityModal;
