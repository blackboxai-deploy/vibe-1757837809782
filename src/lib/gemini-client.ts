// Gemini API client for enhanced webhook payload generation

import { GeminiRequest, GeminiResponse } from '@/types/webhook';

export class GeminiClient {
  private apiKey: string;
  private projectId: string;
  private location: string;

  constructor(apiKey: string = '', projectId: string = '', location: string = 'us-central1') {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.location = location;
  }

  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    if (!this.apiKey || !this.projectId) {
      throw new Error('Gemini API key and project ID are required');
    }

    const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${request.model || 'gemini-pro'}:predict`;

    const payload = {
      instances: [
        {
          content: request.prompt
        }
      ],
      parameters: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxOutputTokens || 256,
        topP: 0.8,
        topK: 40
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract response from Vertex AI format
      const prediction = data.predictions?.[0];
      if (!prediction) {
        throw new Error('No predictions returned from Gemini API');
      }

      return {
        content: prediction.content || prediction.text || '',
        finishReason: prediction.finishReason || 'STOP',
        usage: {
          promptTokens: prediction.usage?.promptTokens || 0,
          outputTokens: prediction.usage?.outputTokens || 0,
          totalTokens: prediction.usage?.totalTokens || 0,
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  generateWebhookPayload(context: string): Promise<GeminiResponse> {
    const prompt = `Generate a webhook payload for the Consolidated AI Voice Assistant based on this context: ${context}

The payload should be a JSON object with these properties:
- command: A descriptive command name
- authority: One of "STANDARD", "ABSOLUTE", or "SUPREME"
- source: "gemini_generated"
- timestamp: Current ISO timestamp

Context: ${context}

Respond with only the JSON object, no additional text.`;

    return this.generateContent({
      prompt,
      temperature: 0.3,
      maxOutputTokens: 200,
    });
  }

  generateCurlCommand(webhookUrl: string, context: string): Promise<GeminiResponse> {
    const prompt = `Generate a curl command to call a webhook at ${webhookUrl} for this context: ${context}

The command should:
- Use POST method
- Include proper headers (Content-Type: application/json, User-Agent: BlackBox-Curl-Commander/1.0)
- Include a JSON payload with command, authority level, source, and timestamp
- Be properly formatted for terminal execution

Context: ${context}

Provide only the curl command, properly formatted with line continuations.`;

    return this.generateContent({
      prompt,
      temperature: 0.2,
      maxOutputTokens: 300,
    });
  }

  generateBlackBoxPrompt(webhookUrl: string, context: string): Promise<GeminiResponse> {
    const prompt = `Generate a BlackBox AI prompt for webhook orchestration at ${webhookUrl} with this context: ${context}

The prompt should:
- Ask BlackBox AI to create and execute webhook commands
- Include specific curl commands or Python scripts
- Request simulation in BlackBox's VM environment
- Include error handling and debugging steps
- Be comprehensive and actionable

Context: ${context}

Generate a detailed prompt that BlackBox AI can execute effectively.`;

    return this.generateContent({
      prompt,
      temperature: 0.4,
      maxOutputTokens: 800,
    });
  }

  // Utility method to validate API credentials
  async validateCredentials(): Promise<boolean> {
    try {
      await this.generateContent({
        prompt: 'Hello',
        maxOutputTokens: 10,
      });
      return true;
    } catch {
      return false;
    }
  }

  // Generate authentication setup instructions
  getAuthSetupInstructions(): string {
    return `# Gemini API Setup Instructions

## 1. Get Google Cloud Project ID
- Go to Google Cloud Console
- Create or select a project
- Note your Project ID

## 2. Enable Vertex AI API
\`\`\`bash
gcloud services enable aiplatform.googleapis.com
\`\`\`

## 3. Create Service Account and Get API Key
\`\`\`bash
# Create service account
gcloud iam service-accounts create webhook-orchestrator

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \\
    --member="serviceAccount:webhook-orchestrator@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
    --role="roles/aiplatform.user"

# Create and download key
gcloud iam service-accounts keys create key.json \\
    --iam-account=webhook-orchestrator@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Get access token (expires in 1 hour)
gcloud auth activate-service-account --key-file=key.json
gcloud auth print-access-token
\`\`\`

## 4. Alternative: Use Application Default Credentials
\`\`\`bash
gcloud auth application-default login
gcloud auth application-default print-access-token
\`\`\`

## 5. Test with curl
\`\`\`bash
curl -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/gemini-pro:predict" \\
-H "Authorization: Bearer YOUR_TOKEN" \\
-H "Content-Type: application/json" \\
-d '{"instances": [{"content": "Hello"}], "parameters": {"temperature": 0.7, "maxOutputTokens": 50}}'
\`\`\`

Replace YOUR_PROJECT and YOUR_TOKEN with actual values.`;
  }
}