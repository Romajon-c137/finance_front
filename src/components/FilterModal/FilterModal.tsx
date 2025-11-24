'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import styles from './FilterModal.module.css';

export type FilterPeriod = 'this-month' | 'last-month' | 'all-time' | 'custom';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (period: FilterPeriod, customRange?: { start: Date; end: Date }) => void;
    currentPeriod: FilterPeriod;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, currentPeriod }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>(currentPeriod);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    if (!isOpen) return null;

    const handleApply = () => {
        if (selectedPeriod === 'custom') {
            if (startDate && endDate) {
                onApply('custom', { start: new Date(startDate), end: new Date(endDate) });
            }
        } else {
            onApply(selectedPeriod);
        }
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>Фильтр</h3>

                <button
                    className={`${styles.option} ${selectedPeriod === 'this-month' ? styles.active : ''}`}
                    onClick={() => setSelectedPeriod('this-month')}
                >
                    Этот месяц
                </button>

                <button
                    className={`${styles.option} ${selectedPeriod === 'last-month' ? styles.active : ''}`}
                    onClick={() => setSelectedPeriod('last-month')}
                >
                    Прошлый месяц
                </button>

                <button
                    className={`${styles.option} ${selectedPeriod === 'all-time' ? styles.active : ''}`}
                    onClick={() => setSelectedPeriod('all-time')}
                >
                    За всё время
                </button>

                <button
                    className={`${styles.option} ${selectedPeriod === 'custom' ? styles.active : ''}`}
                    onClick={() => setSelectedPeriod('custom')}
                >
                    Выбрать период
                </button>

                {selectedPeriod === 'custom' && (
                    <div className={styles.customPeriod}>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                )}

                <button className={styles.applyButton} onClick={handleApply}>
                    Применить
                </button>
            </div>
        </div>
    );
};

export default FilterModal;
