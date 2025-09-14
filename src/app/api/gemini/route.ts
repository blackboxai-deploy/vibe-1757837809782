import { NextRequest, NextResponse } from 'next/server';
import { GeminiClient } from '@/lib/gemini-client';
import { GeminiRequest } from '@/types/webhook';

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      apiKey, 
      projectId, 
      temperature, 
      maxOutputTokens, 
      model,
      action 
    }: GeminiRequest & { 
      apiKey: string; 
      projectId: string; 
      action?: 'generate' | 'webhook_payload' | 'curl_command' | 'blackbox_prompt';
    } = await request.json();

    if (!apiKey || !projectId) {
      return NextResponse.json(
        { 
          error: 'Missing credentials', 
          message: 'API key and project ID are required' 
        },
        { status: 400 }
      );
    }

    const geminiClient = new GeminiClient(apiKey, projectId);

    let result;
    
    switch (action) {
      case 'webhook_payload':
        result = await geminiClient.generateWebhookPayload(prompt);
        break;
      case 'curl_command':
        const webhookUrl = 'https://consolidated-ai-voice-production.louiewong4.workers.dev';
        result = await geminiClient.generateCurlCommand(webhookUrl, prompt);
        break;
      case 'blackbox_prompt':
        const workerUrl = 'https://consolidated-ai-voice-production.louiewong4.workers.dev';
        result = await geminiClient.generateBlackBoxPrompt(workerUrl, prompt);
        break;
      case 'generate':
      default:
        result = await geminiClient.generateContent({
          prompt,
          temperature,
          maxOutputTokens,
          model,
        });
        break;
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    
    return NextResponse.json(
      {
        error: 'Gemini API failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return setup instructions and available actions
  const geminiClient = new GeminiClient();
  
  return NextResponse.json({
    message: 'Gemini API integration ready',
    available_actions: [
      'generate - General content generation',
      'webhook_payload - Generate webhook JSON payload',
      'curl_command - Generate curl command for webhooks',
      'blackbox_prompt - Generate BlackBox AI prompts'
    ],
    setup_instructions: geminiClient.getAuthSetupInstructions(),
    worker_url: 'https://consolidated-ai-voice-production.louiewong4.workers.dev',
    timestamp: new Date().toISOString(),
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}