// Webhook client utilities for Consolidated AI Voice Assistant

import { WebhookPayload, WebhookResponse, OrchestrationResponse, RevenueData, WebhookLog } from '@/types/webhook';

export const WORKER_BASE_URL = 'https://consolidated-ai-voice-production.louiewong4.workers.dev';

export class WebhookClient {
  private baseUrl: string;
  private logs: WebhookLog[] = [];

  constructor(baseUrl: string = WORKER_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLog(endpoint: string, method: string, payload?: WebhookPayload): WebhookLog {
    return {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      payload: payload || {} as WebhookPayload,
      status: 'pending'
    };
  }

  async executeWebhook(payload: WebhookPayload): Promise<{ response: WebhookResponse; log: WebhookLog }> {
    const log = this.createLog('/webhook/automation', 'POST', payload);
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/webhook/automation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BlackBox-Curl-Commander/1.0',
        },
        body: JSON.stringify(payload),
      });

      const responseData: WebhookResponse = await response.json();
      const duration = Date.now() - startTime;

      log.response = responseData;
      log.status = response.ok ? 'success' : 'error';
      log.duration = duration;

      if (!response.ok) {
        log.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      this.logs.unshift(log);
      return { response: responseData, log };
    } catch (error) {
      const duration = Date.now() - startTime;
      log.status = 'error';
      log.duration = duration;
      log.error = error instanceof Error ? error.message : 'Unknown error';
      this.logs.unshift(log);
      throw error;
    }
  }

   async executeOrchestration(payload: WebhookPayload): Promise<{ response: OrchestrationResponse; log: WebhookLog }> {
    const log = this.createLog('/empire', 'POST', payload);
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/empire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BlackBox-Curl-Commander/1.0',
        },
        body: JSON.stringify(payload),
      });

      const responseData: OrchestrationResponse = await response.json();
      const duration = Date.now() - startTime;

      log.response = responseData;
      log.status = response.ok ? 'success' : 'error';
      log.duration = duration;

      if (!response.ok) {
        log.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      this.logs.unshift(log);
      return { response: responseData, log };
    } catch (error) {
      const duration = Date.now() - startTime;
      log.status = 'error';
      log.duration = duration;
      log.error = error instanceof Error ? error.message : 'Unknown error';
      this.logs.unshift(log);
      throw error;
    }
  }

   async getRevenue(): Promise<{ response: RevenueData; log: WebhookLog }> {
    const log = this.createLog('/metrics', 'GET');
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/metrics`, {
        headers: {
          'User-Agent': 'BlackBox-Curl-Commander/1.0',
        },
      });

      const responseData: RevenueData = await response.json();
      const duration = Date.now() - startTime;

      log.response = responseData;
      log.status = response.ok ? 'success' : 'error';
      log.duration = duration;

      if (!response.ok) {
        log.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      this.logs.unshift(log);
      return { response: responseData, log };
    } catch (error) {
      const duration = Date.now() - startTime;
      log.status = 'error';
      log.duration = duration;
      log.error = error instanceof Error ? error.message : 'Unknown error';
      this.logs.unshift(log);
      throw error;
    }
  }

  generateCurlCommand(endpoint: string, payload?: WebhookPayload): string {
    const url = `${this.baseUrl}${endpoint}`;
    
    if (endpoint === '/revenue') {
      return `curl -X GET "${url}" \\
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \\
  -w "\\nHTTP: %{http_code}\\nTime: %{time_total}s\\n"`;
    }

    return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \\
  -d '${JSON.stringify(payload, null, 2)}' \\
  -w "\\nHTTP: %{http_code}\\nTime: %{time_total}s\\n"`;
  }

  generateBlackBoxPrompt(): string {
    return `BlackBox AI, orchestrate webhook POST requests for the Consolidated AI Voice Assistant at ${this.baseUrl} to execute the full empire flow (voice, revenue, automation, Azure). I have limited execution capabilities, so generate and simulate execution of curl commands or a Python script in your IDE VM.

Steps:
1. Verify Worker: Run \`wrangler list | grep "consolidated-ai-voice-production"\`. If missing, execute \`./deploy-debug-consolidated-ai.sh\`. Fix KV ID (\`new-id-here\`) if needed: \`wrangler kv:namespace create BLACKBOX_METADATA; sed -i 's/new-id-here/NEW_ID/' wrangler.toml\`.

2. Generate curl commands:
   ${this.generateCurlCommand('/webhook', {
     command: 'GENERATE',
     authority: 'SUPREME',
     source: 'blackbox',
     timestamp: new Date().toISOString()
   })}

   ${this.generateCurlCommand('/orchestrate', {
     command: 'voice_generate_revenue_azure',
     authority: 'SUPREME',
     source: 'blackbox',
     timestamp: new Date().toISOString()
   })}

   ${this.generateCurlCommand('/revenue')}

3. Alternative: Generate and run a Python script (use requests library, install via \`pip install requests\`):
\`\`\`python
import requests
import json
from datetime import datetime

BASE_URL = "${this.baseUrl}"

def execute_webhook(endpoint, payload=None):
    try:
        if payload:
            response = requests.post(f"{BASE_URL}{endpoint}", json=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'BlackBox-Curl-Commander/1.0'})
        else:
            response = requests.get(f"{BASE_URL}{endpoint}", headers={'User-Agent': 'BlackBox-Curl-Commander/1.0'})
        return response.json()
    except Exception as e:
        return {"error": str(e)}

# Execute webhook commands
payload = {"command": "GENERATE", "authority": "SUPREME", "source": "blackbox", "timestamp": datetime.utcnow().isoformat() + "Z"}
print("Webhook Response:", execute_webhook('/webhook', payload))

orchestrate_payload = {"command": "voice_generate_revenue_azure", **payload}
print("Orchestration Response:", execute_webhook('/orchestrate', orchestrate_payload))

print("Revenue Data:", execute_webhook('/revenue'))
\`\`\`

Simulate execution in your VM, log outputs to webhook_log_*.log.
Verify: Expect revenue total 2.25, timestamp ~${new Date().toISOString()}.
Debug: Parse deploy_debug_*.log for "❌", suggest fixes (e.g., wrangler login).
Automate: Generate a loop for periodic webhook calls (every 2 min).
Provide full output, logs, and confirmation of empire operation with real results.`;
  }

  getLogs(): WebhookLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getStats() {
    const totalCalls = this.logs.length;
    const successCalls = this.logs.filter(log => log.status === 'success').length;
    const errorCalls = this.logs.filter(log => log.status === 'error').length;
    const avgDuration = this.logs.reduce((sum, log) => sum + (log.duration || 0), 0) / totalCalls || 0;

    return {
      totalCalls,
      successCalls,
      errorCalls,
      successRate: totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0,
      avgDuration: Math.round(avgDuration)
    };
  }
}