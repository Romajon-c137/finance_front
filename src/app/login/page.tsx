"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setTokenClient } from '@/lib/api';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (token.trim()) {
            setTokenClient(token.trim());
            router.push('/');
        } else {
            setError('Введите токен');
        }
        setIsLoading(false);
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Вход по токену</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="token" className={styles.label}>Токен авторизации</label>
                        <input
                            id="token"
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className={styles.input}
                            placeholder="Введите токен"
                            required
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
            </div>
        </main>
    );
}
