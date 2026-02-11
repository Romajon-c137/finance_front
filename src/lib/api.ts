const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://finance.smarthouse.website/api/v1';

import Cookies from 'js-cookie';

// Token Management
// Client-side cookie management
export const setTokenClient = (token: string) => {
    if (typeof window !== 'undefined') {
        Cookies.set('auth_token', token, { expires: 7 }); // 7 days
    }
};

export const getTokenClient = (): string | null => {
    if (typeof window !== 'undefined') {
        return Cookies.get('auth_token') || null;
    }
    return null;
};

export const removeTokenClient = () => {
    if (typeof window !== 'undefined') {
        Cookies.remove('auth_token');
    }
};

// Server-side cookie management
export const getTokenServer = async (): Promise<string | null> => {
    try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        return cookieStore.get('auth_token')?.value || null;
    } catch {
        return null;
    }
};

// Auth API
export interface LoginResponse {
    token: string;
    role: boolean;
}

export async function login(username: string, password: string): Promise<LoginResponse | null> {
    try {
        // Direct request to backend API
        const res = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('Login failed:', res.statusText, errorData);
            return null;
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

// Helper to get headers - works in both client and server
const getHeaders = async () => {
    let token: string | null = null;

    // Try server-side first
    if (typeof window === 'undefined') {
        token = await getTokenServer();
    } else {
        // Client-side
        token = getTokenClient();
    }

    console.log('[getHeaders] Token present:', !!token, 'Type:', typeof window === 'undefined' ? 'server' : 'client');

    return {
        'Authorization': token ? `Token ${token}` : '',
        'Content-Type': 'application/json',
        'accept': 'application/json',
    };
};

// Pagination Support
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface Debt {
    id: number;
    name: string;
    total_sum: string;
    content_type: number;
}

export interface Finance {
    id: number;
    name: string;
    cash: string;
    type_finance: 'plus' | 'minus';
    return_cash: boolean;
    person: Debt; // Nested person object
    create_dt?: string; // Creation date from API
}

export async function getFinances(page: number = 1): Promise<PaginatedResponse<Finance>> {
    try {
        const res = await fetch(`${API_BASE_URL}/finances/?page=${page}`, {
            headers: await getHeaders(),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch finances: ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching finances:', error);
        return { count: 0, next: null, previous: null, results: [] };
    }
}

export async function getPersonTransactions(id: string, page: number = 1): Promise<PaginatedResponse<Finance>> {
    try {
        const res = await fetch(`${API_BASE_URL}/persons/${id}/transactions/?page=${page}`, {
            headers: await getHeaders(),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch person transactions: ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`Error fetching transactions for person ${id}:`, error);
        return { count: 0, next: null, previous: null, results: [] };
    }
}

export async function getPerson(id: string): Promise<Debt | null> {
    try {
        // Direct endpoint /persons/finance/{id}/ does not exist (404).
        // We fetch the list of all persons and find the matching ID.
        const all = await getAllPersons('finance');
        const found = all.find(p => p.id === parseInt(id));
        return found || null;
    } catch (error) {
        console.error(`Error finding person ${id}:`, error);
        return null;
    }
}

// Helper functions to fetch all pages (for backward compatibility and filtering)
export async function getAllPersons(type: 'finance' | 'consumption' | 'salary'): Promise<Debt[]> {
    const allResults: Debt[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await getPersons(type, page);
        allResults.push(...response.results);
        hasMore = response.next !== null;
        page++;
    }

    return allResults;
}

export async function getAllTransactions(fetchFn: (page: number) => Promise<PaginatedResponse<Finance>>): Promise<Finance[]> {
    const allResults: Finance[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await fetchFn(page);
        allResults.push(...response.results);
        hasMore = response.next !== null;
        page++;
    }

    return allResults;
}

export async function getExpense(id: string): Promise<Debt | null> {
    try {
        const all = await getAllPersons('consumption');
        const found = all.find(p => p.id === parseInt(id));
        return found || null;
    } catch (error) {
        console.error(`Error finding expense ${id}:`, error);
        return null;
    }
}

export async function getSalaryPerson(id: string): Promise<Debt | null> {
    try {
        const all = await getAllPersons('salary');
        const found = all.find(p => p.id === parseInt(id));
        return found || null;
    } catch (error) {
        console.error(`Error finding salary person ${id}:`, error);
        return null;
    }
}

export async function getPersons(type: 'finance' | 'consumption' | 'salary', page: number = 1): Promise<PaginatedResponse<Debt>> {
    try {
        const res = await fetch(`${API_BASE_URL}/persons/${type}/?page=${page}`, {
            headers: await getHeaders(),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch ${type}: ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return { count: 0, next: null, previous: null, results: [] };
    }
}

// Alias for compatibility if needed, or just replace usages
export const getDebts = () => getPersons('finance');

export interface CreatePersonPayload {
    name: string;
    type_class: 'finance' | 'consumption' | 'salary';
}

export async function createPerson(payload: CreatePersonPayload): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE_URL}/persons/`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('Failed to create person:', errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error creating person:', error);
        return false;
    }
}

export interface CreateFinancePayload {
    cash: string;
    name: string;
    person: number;
    type_finance: 'plus' | 'minus';
    return_cash: boolean;
}

export async function createFinance(payload: CreateFinancePayload): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE_URL}/finances/`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('Failed to create finance:', errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error creating finance:', error);
        return false;
    }
}
export interface CreateConsumptionPayload {
    name: string;
    cash: string;
    person: number;
}

export async function createConsumption(payload: CreateConsumptionPayload): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE_URL}/consumptions/`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('Failed to create consumption:', errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error creating consumption:', error);
        return false;
    }
}

export interface CreateSalaryPayload {
    cash: string;
    person: number;
    name: string;
    // type_finance: 'plus' | 'minus'; // Removed as it's not in the original payload
}

export async function createSalary(payload: CreateSalaryPayload): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE_URL}/salaries/`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('Failed to create salary:', errorData);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error creating salary:', error);
        return false;
    }
}

export async function getConsumptions(page: number = 1): Promise<PaginatedResponse<Finance>> {
    try {
        const res = await fetch(`${API_BASE_URL}/consumptions/?page=${page}`, {
            headers: await getHeaders(),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch consumptions: ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching consumptions:', error);
        return { count: 0, next: null, previous: null, results: [] };
    }
}

export async function getSalaries(page: number = 1): Promise<PaginatedResponse<Finance>> {
    try {
        const res = await fetch(`${API_BASE_URL}/salaries/?page=${page}`, {
            headers: await getHeaders(),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch salaries: ${res.statusText}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching salaries:', error);
        return { count: 0, next: null, previous: null, results: [] };
    }
}
