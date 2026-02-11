"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, setTokenClient } from '@/lib/api';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [isTokenMode, setIsTokenMode] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isTokenMode) {
            if (token.trim()) {
                setTokenClient(token.trim());
                router.push('/');
            } else {
                setError('Введите токен');
            }
            setIsLoading(false);
            return;
        }

        const response = await login(username, password);

        if (response && response.token) {
            setTokenClient(response.token);
            router.push('/');
        } else {
            setError('Неверный логин или пароль');
        }
        setIsLoading(false);
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>{isTokenMode ? 'Говарю же токен не нужен деп' : 'Вход'}</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isTokenMode ? (
                        <>
                            <div className={styles.inputGroup}>
                                <label htmlFor="username" className={styles.label}>Логин</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={styles.input}
                                    placeholder="Введите логин"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="password" className={styles.label}>Пароль</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="Введите пароль"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <div className={styles.inputGroup}>
                           ...
                        </div>
                    )}

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>

                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => {
                            setIsTokenMode(!isTokenMode);
                            setError('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            marginTop: '1rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            textDecoration: 'underline',
                            width: '100%'
                        }}
                    >
                        {isTokenMode ? 'Войти по логину/паролю' : 'Никому не сдалься ваш токен'}
                    </button>
                </form>
            </div>
        </main>
    );
}
