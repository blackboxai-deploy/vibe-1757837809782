// TypeScript interfaces for webhook orchestration system

export interface WebhookPayload {
  command: string;
  authority: 'STANDARD' | 'ABSOLUTE' | 'SUPREME';
  source: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface WebhookResponse {
  status: string;
  command: string;
  authority_level: string;
  premium_command: boolean;
  revenue_generated: number;
  comprehensive_token_bonus: string;
  empire_expanding: boolean;
  blackbox_active: boolean;
  timestamp: string;
}

export interface OrchestrationResponse {
  success: boolean;
  orchestration_id: string;
  command: string;
  voice: {
    session_id: string;
    voice_enabled: boolean;
    coordinator_status: string;
    timestamp: string;
  };
  revenue: {
    success: boolean;
    updated_total: number;
  };
  automation: {
    empire_status: string;
    active_commands: number;
    last_update: string;
  };
  azure: {
    status: string;
  };
  timestamp: string;
}

export interface RevenueData {
  total: number;
  transactions: Array<{
    amount: number;
    timestamp: string;
    source: string;
  }>;
  tracking_active: boolean;
  last_updated: string;
  empire_revenue: {
    base_rate: string;
    authority_multipliers: {
      STANDARD: string;
      ABSOLUTE: string;
      SUPREME: string;
    };
    premium_multiplier: string;
    comprehensive_token_bonus: string;
    maximum_per_command: string;
    status: string;
    api_permissions: string;
  };
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  payload: WebhookPayload;
  response?: unknown;
  status: 'pending' | 'success' | 'error';
  duration?: number;
  error?: string;
}

export interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
}

export interface GeminiResponse {
  content: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface AutomationSchedule {
  id: string;
  name: string;
  enabled: boolean;
  interval: number; // minutes
  webhook_endpoint: string;
  payload: WebhookPayload;
  last_run?: string;
  next_run: string;
  success_count: number;
  error_count: number;
}

export interface CurlCommand {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: string;
  created_at: string;
  last_used?: string;
}