import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = 'http://finance.smarthouse.website/api/v1';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type } = await params;

        const res = await fetch(`${API_BASE_URL}/persons/${type}/`, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching persons:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
