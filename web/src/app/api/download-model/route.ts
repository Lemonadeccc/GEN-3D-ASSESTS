// API route to proxy model downloads with proper authorization
import { NextRequest, NextResponse } from 'next/server';

const MESHY_API_KEY = process.env.NEXT_PUBLIC_MESHY_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modelUrl = searchParams.get('url');

  if (!modelUrl) {
    return NextResponse.json({ error: 'Missing model URL' }, { status: 400 });
  }

  if (!MESHY_API_KEY) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
  }

  try {
    console.log('Proxying download for URL:', modelUrl);

    const response = await fetch(modelUrl, {
      headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
        'User-Agent': 'NextJS-Proxy/1.0',
      },
    });

    if (!response.ok) {
      console.error(
        'Proxy download failed:',
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: `Download failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    console.log(
      'Proxy download successful, content-type:',
      contentType,
      'length:',
      contentLength
    );

    // Stream the response
    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength || blob.size.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
