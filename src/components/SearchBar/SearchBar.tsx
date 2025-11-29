'use client';

import React from 'react';
import Image from 'next/image';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onSearch?: (query: string) => void;
    onFilterClick?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onFilterClick }) => {
    return (
        <div className={styles.container}>
            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    placeholder="ПОИСК"
                    className={styles.input}
                    onChange={(e) => onSearch?.(e.target.value)}
                />
            </div>

            {onFilterClick && (
                <button className={styles.button} onClick={onFilterClick}>
                    <Image
                        src="/iconoir_filter.svg"
                        alt="Filter"
                        width={24}
                        height={24}
                        className={styles.icon}
                    />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
