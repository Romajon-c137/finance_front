'use client'
import React from 'react';
import styles from './LoadingSkeleton.module.css';

interface LoadingSkeletonProps {
    count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 5 }) => {
    return (
        <div className={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={styles.skeletonCard}>
                    <div className={styles.skeletonHeader}>
                        <div className={styles.skeletonTitle}></div>
                        <div className={styles.skeletonAmount}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LoadingSkeleton;
