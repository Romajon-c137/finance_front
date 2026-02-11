/**
 * Validation utilities for forms
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate name field (for persons, categories, etc.)
 */
export function validateName(name: string): ValidationResult {
    const trimmed = name.trim();

    if (!trimmed) {
        return {
            isValid: false,
            error: 'Имя обязательно для заполнения',
        };
    }

    if (trimmed.length < 2) {
        return {
            isValid: false,
            error: 'Имя должно содержать минимум 2 символа',
        };
    }

    return { isValid: true };
}

/**
 * Validate amount field (for transactions)
 */
export function validateAmount(amount: string): ValidationResult {
    const trimmed = amount.trim();

    if (!trimmed) {
        return {
            isValid: false,
            error: 'Сумма обязательна для заполнения',
        };
    }

    const numValue = parseFloat(trimmed);

    if (isNaN(numValue)) {
        return {
            isValid: false,
            error: 'Сумма должна быть числом',
        };
    }

    if (numValue <= 0) {
        return {
            isValid: false,
            error: 'Сумма должна быть больше нуля',
        };
    }

    return { isValid: true };
}

/**
 * Validate comment field
 */
export function validateComment(comment: string): ValidationResult {
    const trimmed = comment.trim();

    if (!trimmed) {
        return {
            isValid: false,
            error: 'Комментарий обязателен для заполнения',
        };
    }

    if (trimmed.length < 2) {
        return {
            isValid: false,
            error: 'Комментарий должен содержать минимум 2 символа',
        };
    }

    return { isValid: true };
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationResult {
    const trimmed = username.trim();

    if (!trimmed) {
        return {
            isValid: false,
            error: 'Имя пользователя обязательно',
        };
    }

    if (trimmed.length < 3) {
        return {
            isValid: false,
            error: 'Имя пользователя должно содержать минимум 3 символа',
        };
    }

    return { isValid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
    if (!password) {
        return {
            isValid: false,
            error: 'Пароль обязателен',
        };
    }

    if (password.length < 4) {
        return {
            isValid: false,
            error: 'Пароль должен содержать минимум 4 символа',
        };
    }

    return { isValid: true };
}
