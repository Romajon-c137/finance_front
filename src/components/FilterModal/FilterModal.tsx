"use client";
import React, { useState } from 'react';
import styles from './FilterModal.module.css';

export type FilterPeriod = 'this_month' | 'last_month' | 'all_time' | 'custom';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeFilter: FilterPeriod;
    onApply: (filter: FilterPeriod, customStart?: Date, customEnd?: Date) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, activeFilter, onApply }) => {
    const [selectedFilter, setSelectedFilter] = useState<FilterPeriod>(activeFilter);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    if (!isOpen) return null;

    const handleApply = () => {
        if (selectedFilter === 'custom') {
            if (startDate && endDate) {
                onApply(selectedFilter, new Date(startDate), new Date(endDate));
            }
        } else {
            onApply(selectedFilter);
        }
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>Фильтр</h3>

                <div className={styles.options}>
                    <button
                        className={`${styles.optionButton} ${selectedFilter === 'this_month' ? styles.active : ''}`}
                        onClick={() => setSelectedFilter('this_month')}
                    >
                        Этот месяц
                    </button>
                    <button
                        className={`${styles.optionButton} ${selectedFilter === 'last_month' ? styles.active : ''}`}
                        onClick={() => setSelectedFilter('last_month')}
                    >
                        Прошлый месяц
                    </button>
                    <button
                        className={`${styles.optionButton} ${selectedFilter === 'all_time' ? styles.active : ''}`}
                        onClick={() => setSelectedFilter('all_time')}
                    >
                        За все время
                    </button>
                    <button
                        className={`${styles.optionButton} ${selectedFilter === 'custom' ? styles.active : ''}`}
                        onClick={() => setSelectedFilter('custom')}
                    >
                        Выбрать период
                    </button>
                </div>

                {selectedFilter === 'custom' && (
                    <div className={styles.customDateContainer}>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="От"
                        />
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="До"
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
