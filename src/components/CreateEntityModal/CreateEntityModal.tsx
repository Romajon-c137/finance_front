'use client';

import React, { useState } from 'react';
import styles from './CreateEntityModal.module.css';

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

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name) return;
        onSubmit(name);
        setName(''); // Reset after submit
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>{title}</h3>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Название</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder={placeholder}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={isLoading || !name}
                >
                    {isLoading ? 'Сохранение...' : 'Создать'}
                </button>
            </div>
        </div>
    );
};

export default CreateEntityModal;
