import React from 'react';
import Image from 'next/image';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  variant: 'debts' | 'expenses' | 'salaries';
  iconSrc: string;
}

const Card: React.FC<CardProps> = ({ title, variant, iconSrc }) => {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.iconWrapper}>
        <Image
          src={iconSrc}
          alt={title}
          width={120}
          height={120}
          className={styles.icon}
          style={{
            zIndex: 1,
          }}
        />
      </div>
      <span className={styles.title}>{title}</span>
    </div>
  );
};

export default Card;
