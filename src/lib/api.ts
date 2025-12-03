const API_BASE_URL = 'http://finance.smarthouse.website/api/v1';

// Token Management
// Client-side cookie management
export const setTokenClient = (token: string) => {
    if (typeof window !== 'undefined') {
        const Cookies = require('js-cookie');
        Cookies.set('auth_token', token, { expires: 7 }); // 7 days
    }
};

export const getTokenClient = (): string | null => {
    if (typeof window !== 'undefined') {
        const Cookies = require('js-cookie');
        return Cookies.get('auth_token') || null;
    }
    return null;
};

export const removeTokenClient = () => {
    if (typeof window !== 'undefined') {
        const Cookies = require('js-cookie');
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
        // Use API proxy to avoid CORS and CSRF issues
        const res = await fetch('/api/v1/auth/login/', {
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

    return {
        'Authorization': token ? `Token ${token}` : '',
        'Content-Type': 'application/json',
    };
};

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

export async function getFinances(): Promise<Finance[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/finances/`, {
            headers: await getHeaders(),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch finances: ${res.statusText}`);
        }

        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching finances:', error);
        return [];
    }
}

export async function getPersonTransactions(id: string): Promise<Finance[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/persons/${id}/transactions/`, {
            headers: await getHeaders(),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch person transactions: ${res.statusText}`);
        }

        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error(`Error fetching transactions for person ${id}:`, error);
        return [];
    }
}

export async function getPerson(id: string): Promise<Debt | null> {
    try {
        // Direct endpoint /persons/finance/{id}/ does not exist (404).
        // We fetch the list of all persons and find the matching ID.
        const all = await getPersons('finance');
        const found = all.find(p => p.id === parseInt(id));
        return found || null;
    } catch (error) {
        console.error(`Error finding person ${id}:`, error);
        return null;
    }
}

export async function getExpense(id: string): Promise<Debt | null> {
    try {
        const all = await getPersons('consumption');
        const found = all.find(p => p.id === parseInt(id));
        return found || null;
    } catch (error) {
        console.error(`Error finding expense ${id}:`, error);
        return null;
    }
}

export async function getSalaryPerson(id: string): Promise<Debt | null> {
    try {
        const all = await getPersons('salary');
        const found = all.find(p => p.id === parseInt(id));
        return found || null;
    } catch (error) {
        console.error(`Error finding salary person ${id}:`, error);
        return null;
    }
}

export async function getPersons(type: 'finance' | 'consumption' | 'salary'): Promise<Debt[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/persons/${type}/`, {
            headers: await getHeaders(),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch ${type}: ${res.statusText}`);
        }

        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return [];
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

export async function getConsumptions(): Promise<Finance[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/consumptions/`, {
            headers: await getHeaders(),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch consumptions: ${res.statusText}`);
        }

        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching consumptions:', error);
        return [];
    }
}

export async function getSalaries(): Promise<Finance[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/salaries/`, {
            headers: await getHeaders(),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch salaries: ${res.statusText}`);
        }

        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching salaries:', error);
        return [];
    }
}
