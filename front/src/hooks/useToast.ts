import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        const toast: ToastMessage = { id, message, type };

        setToasts((prev) => [...prev, toast]);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
        success: useCallback((message: string) => showToast(message, 'success'), [showToast]),
        error: useCallback((message: string) => showToast(message, 'error'), [showToast]),
        info: useCallback((message: string) => showToast(message, 'info'), [showToast]),
    };
}
