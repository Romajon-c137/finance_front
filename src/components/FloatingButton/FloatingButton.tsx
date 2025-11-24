import React from 'react';
import { Plus } from 'lucide-react';
import styles from './FloatingButton.module.css';

interface FloatingButtonProps {
    onClick?: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
    return (
        <button className={styles.button} onClick={onClick}>
            <Plus size={32} strokeWidth={2.5} />
        </button>
    );
};

export default FloatingButton;
