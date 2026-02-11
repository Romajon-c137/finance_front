'use client'
import React, { Component, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.errorContainer}>
                    <div className={styles.errorContent}>
                        <h1 className={styles.errorTitle}>Что-то пошло не так</h1>
                        <p className={styles.errorMessage}>
                            Произошла ошибка при загрузке страницы.
                        </p>
                        <button
                            className={styles.reloadButton}
                            onClick={() => window.location.reload()}
                        >
                            Перезагрузить страницу
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
