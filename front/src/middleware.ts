import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // If trying to access login page with a token, redirect to home
    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If trying to access protected pages without a token, redirect to login
    if (!pathname.startsWith('/login') && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)'],
};
