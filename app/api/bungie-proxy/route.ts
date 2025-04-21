import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';

const BUNGIE_API_BASE = 'https://www.bungie.net';
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const pbAuthCookie = cookieStore.get('pb_auth');
    
    if (!pbAuthCookie) {
      return NextResponse.json({ error: 'Unauthorized - No auth cookie found' }, { status: 401 });
    }

    try {
      // Load the auth store data from the cookie
      pb.authStore.loadFromCookie(pbAuthCookie.value);
      
      // Verify the token is still valid
      if (!pb.authStore.isValid) {
        return NextResponse.json({ error: 'Unauthorized - Invalid or expired token' }, { status: 401 });
      }
    } catch (authError) {
      console.error('Auth validation error:', authError);
      return NextResponse.json({ error: 'Unauthorized - Invalid authentication' }, { status: 401 });
    }

    // Get the path parameter from the URL
    const path = request.nextUrl.searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }

    // Check if this is a deepsight proxy request
    if (path.startsWith('/deepsight-proxy')) {
      const url = new URL(path, request.nextUrl.origin);
      const targetUrl = url.searchParams.get('url');
      
      if (!targetUrl) {
        return NextResponse.json({ error: 'No URL provided for deepsight proxy' }, { status: 400 });
      }
      
      // Forward the request to the deepsight URL
      const response = await fetch(targetUrl);
      
      if (!response.ok) {
        return NextResponse.json(
          { error: `Deepsight request failed with status: ${response.status}` },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    }
    
    // Regular Bungie API request
    const apiUrl = `${BUNGIE_API_BASE}${path}`;
    
    // Forward the request to Bungie API
    const response = await fetch(apiUrl, {
      headers: {
        'X-API-Key': process.env.DESTINY_API_KEY || '',
      },
    });
    
    // Forward the response back to the client
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying API request:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
} 