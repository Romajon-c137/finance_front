'use client'
import React from 'react';
import { ToastMessage } from '@/hooks/useToast';
import styles from './Toast.module.css';

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    return (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
            <div className={styles.content}>
                <span className={styles.message}>{toast.message}</span>
                <button
                    className={styles.closeButton}
                    onClick={() => onClose(toast.id)}
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Toast;
