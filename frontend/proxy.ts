import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { STRAPI_BASE_URL } from './lib/strapi';

const protectedRoutes = ['/dashboard'];

function checkIsProtectedRoute(pathname: string) {
  return protectedRoutes.includes(pathname);
}

export async function proxy(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  const isProtectedRoute = checkIsProtectedRoute(currentPath);

  if (!isProtectedRoute) return NextResponse.next();

  // Is a protected route
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt')?.value;
    if (!jwt) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    const response = await fetch(`${STRAPI_BASE_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });

    const userResponse = await response.json();
    if (!userResponse) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error verifying user authentication:', error);
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/dashboard', '/dashboard/:path*'],
};
