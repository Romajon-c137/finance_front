import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = 'http://finance.smarthouse.website/api/v1';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        console.log('[API] Creating person, token:', token ? 'present' : 'missing');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('[API] Request body:', body);

        const res = await fetch(`${API_BASE_URL}/persons/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        console.log('[API] Backend response status:', res.status);
        console.log('[API] Backend response data:', data);

        if (!res.ok) {
            console.error('[API] Failed to create person:', data);
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] Error creating person:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
