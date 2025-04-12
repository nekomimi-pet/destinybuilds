import { NextRequest, NextResponse } from 'next/server';
import { isTokenExpired } from 'pocketbase';

export default async function middleware(request: NextRequest) {
    const protectedPaths = ["/admin"]
    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    const authPaths = ["/login"];
    const isAuthPath = authPaths.some(
        (path) => request.nextUrl.pathname === path
    );

    const authCookie = request.cookies.get("pb_auth");
    const token = authCookie?.value ? JSON.parse(authCookie.value).token : null;
    const isAuthenticated = token && !isTokenExpired(token);

    if (isAuthPath && isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (isProtectedPath && !isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
}