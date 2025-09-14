import { NextRequest, NextResponse } from 'next/server';
import { WebhookPayload } from '@/types/webhook';

const WORKER_BASE_URL = 'https://consolidated-ai-voice-production.louiewong4.workers.dev';

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();
    
    // Add timestamp if not provided
    if (!payload.timestamp) {
      payload.timestamp = new Date().toISOString();
    }

    // Proxy request to the actual Worker orchestration endpoint
    const response = await fetch(`${WORKER_BASE_URL}/orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Webhook-Orchestrator/1.0',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    // Add CORS headers for frontend access
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json(
      {
        ...responseData,
        proxy_timestamp: new Date().toISOString(),
        proxy_status: 'success',
      },
      { 
        status: response.status,
        headers 
      }
    );
  } catch (error) {
    console.error('Orchestration proxy error:', error);
    
    return NextResponse.json(
      {
        error: 'Orchestration proxy failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        proxy_timestamp: new Date().toISOString(),
        proxy_status: 'error',
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}