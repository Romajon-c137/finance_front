"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getTokenClient, removeTokenClient } from '@/lib/api';
import { LogOut } from 'lucide-react';

export default function MiniProfile() {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check token on mount and when path changes
        const token = getTokenClient();
        setIsAuthenticated(!!token);
    }, [pathname]);

    const handleLogout = () => {
        // Ask for confirmation
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            removeTokenClient();
            setIsAuthenticated(false);
            router.push('/login');
        }
    };

    // Only show on home page
    if (pathname !== '/') return null;

    if (!isAuthenticated) return null;

    return (
        <button
            onClick={handleLogout}
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px 24px',
                borderRadius: '12px',
                backgroundColor: '#fee2e2',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#ef4444',
                fontWeight: '600',
                fontSize: '14px',
                zIndex: 50,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            title="Выйти"
        >
            <LogOut size={20} />
            Выйти
        </button>
    );
}
