import { NextResponse } from 'next/server';

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // Add cache-busting headers
  const response = NextResponse.json({
    version: '2.3.0',
    buildTime: new Date().toISOString(),
    buildTimestamp: Date.now(),
    environment: process.env.NODE_ENV,
  });
  
  // Prevent all caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}
