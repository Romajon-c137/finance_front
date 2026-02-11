'use client'
import React, { createContext, useContext } from 'react';
import { useToast as useToastHook } from '@/hooks/useToast';
import Toast from './Toast';
import styles from './ToastContainer.module.css';

interface ToastContextType {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toasts, removeToast, success, error, info } = useToastHook();

    return (
        <ToastContext.Provider value={{ success, error, info }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onClose={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
