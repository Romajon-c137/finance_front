import React from 'react';
import { Plus, Minus } from 'lucide-react';
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
    onPlus?: () => void;
    onMinus?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onPlus, onMinus }) => {
    return (
        <div className={styles.container}>
            <button className={`${styles.button} ${styles.plus}`} onClick={onPlus}>
                <Plus size={32} strokeWidth={2.5} />
            </button>
            <button className={`${styles.button} ${styles.minus}`} onClick={onMinus}>
                <Minus size={32} strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default ActionButtons;
