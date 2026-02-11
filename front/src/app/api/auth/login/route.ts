import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const targetUrl = 'http://finance.smarthouse.website/api/v1/auth/login/';
        console.log('[Login Proxy] Forwarding request to:', targetUrl);
        console.log('[Login Proxy] Request body:', body);

        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: 'Login failed' },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
