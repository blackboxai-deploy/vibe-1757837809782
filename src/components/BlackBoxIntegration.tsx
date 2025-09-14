"use client";

import { useState } from "react";
import { WebhookClient } from "@/lib/webhook-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BlackBoxIntegrationProps {
  client: WebhookClient;
}

export function BlackBoxIntegration({ client }: BlackBoxIntegrationProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [pythonScript, setPythonScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBlackBoxPrompt = () => {
    setIsGenerating(true);
    const prompt = client.generateBlackBoxPrompt();
    setGeneratedPrompt(prompt);
    setIsGenerating(false);
  };

  const generatePythonScript = () => {
    setIsGenerating(true);
    const script = `# BlackBox AI Python Script for Consolidated AI Voice Assistant
import requests
import json
from datetime import datetime

BASE_URL = "https://consolidated-ai-voice-production.louiewong4.workers.dev"

def execute_webhook(command, authority="SUPREME"):
    payload = {
        "command": command,
        "authority": authority,
        "source": "blackbox_python",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    response = requests.post(f"{BASE_URL}/webhook", json=payload)
    return response.json()

def execute_orchestration(command, authority="SUPREME"):
    payload = {
        "command": command,
        "authority": authority,
        "source": "blackbox_python", 
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    response = requests.post(f"{BASE_URL}/orchestrate", json=payload)
    return response.json()

def get_revenue():
    response = requests.get(f"{BASE_URL}/revenue")
    return response.json()

# Quick test
print("Testing webhook...")
result = execute_webhook("GENERATE", "SUPREME")
print(json.dumps(result, indent=2))

print("Getting revenue...")
revenue = get_revenue()
print(json.dumps(revenue, indent=2))

print("Full orchestration...")
orchestration = execute_orchestration("voice_generate_revenue_azure", "SUPREME")
print(json.dumps(orchestration, indent=2))
`;

    setPythonScript(script);
    setIsGenerating(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateQuickCommands = () => {
    const commands = `# BlackBox AI Quick Commands for Consolidated AI Voice Assistant

## 1. Install Dependencies (if needed)
pip install requests

## 2. Quick Test Commands
curl -X POST https://consolidated-ai-voice-production.louiewong4.workers.dev/webhook \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \\
  -d '{"command":"GENERATE","authority":"SUPREME","source":"blackbox","timestamp":"${new Date().toISOString()}"}'

## 3. Revenue Check
curl https://consolidated-ai-voice-production.louiewong4.workers.dev/revenue \\
  -H "User-Agent: BlackBox-Curl-Commander/1.0"

## 4. Full Orchestration
curl -X POST https://consolidated-ai-voice-production.louiewong4.workers.dev/orchestrate \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \\
  -d '{"command":"voice_generate_revenue_azure","authority":"SUPREME","source":"blackbox","timestamp":"${new Date().toISOString()}"}'

## 5. One-liner Python Test
python -c "import requests; print(requests.post('https://consolidated-ai-voice-production.louiewong4.workers.dev/webhook', json={'command':'GENERATE','authority':'SUPREME','source':'blackbox_oneliner','timestamp':'${new Date().toISOString()}'}, headers={'User-Agent':'BlackBox-Curl-Commander/1.0'}).json())"

## 6. Expected Results
# Revenue should increase to approximately $2.25 after execution
# Check with: curl https://consolidated-ai-voice-production.louiewong4.workers.dev/revenue
`;

    setGeneratedPrompt(commands);
  };

  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={generateBlackBoxPrompt}
          disabled={isGenerating}
          className="bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/50"
          variant="outline"
        >
          Generate BlackBox Prompt
        </Button>
        <Button
          onClick={generatePythonScript}
          disabled={isGenerating}
          className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50"
          variant="outline"
        >
          Generate Python Script
        </Button>
        <Button
          onClick={generateQuickCommands}
          disabled={isGenerating}
          className="bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
          variant="outline"
        >
          Quick Commands
        </Button>
      </div>

      {/* Usage Instructions */}
      <Alert className="bg-black/40 border-purple-500/30">
        <AlertDescription className="text-purple-300">
          <div className="space-y-2">
            <p><strong>BlackBox AI Usage:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Copy the generated prompt/script to BlackBox AI chat interface</li>
              <li>BlackBox will execute the code in its virtual machine</li>
              <li>Monitor outputs for webhook execution results</li>
              <li>Check for revenue generation and empire status updates</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="output" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-purple-500/30">
          <TabsTrigger value="output">Generated Output</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="output" className="space-y-4">
          {(generatedPrompt || pythonScript) && (
            <Card className="bg-black/60 border-purple-500/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-purple-300">
                    {pythonScript ? 'Python Script' : 'BlackBox Prompt'}
                  </CardTitle>
                  <CardDescription className="text-purple-400">
                    {pythonScript 
                      ? 'Complete Python script for webhook orchestration'
                      : 'Ready-to-use prompt for BlackBox AI'
                    }
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="border-green-400/50 text-green-400">
                    Ready to Use
                  </Badge>
                  <Button
                    onClick={() => copyToClipboard(pythonScript || generatedPrompt)}
                    size="sm"
                    className="bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
                    variant="outline"
                  >
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={pythonScript || generatedPrompt}
                  readOnly
                  rows={20}
                  className="bg-black/60 border-purple-500/20 text-purple-100 font-mono text-sm"
                />
              </CardContent>
            </Card>
          )}

          {!generatedPrompt && !pythonScript && (
            <Card className="bg-black/60 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="text-center text-purple-400">
                  Click one of the buttons above to generate BlackBox AI content
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <Card className="bg-black/60 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">How to Use with BlackBox AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 text-purple-300">
                <div>
                  <h4 className="font-semibold text-purple-200">Step 1: Access BlackBox AI</h4>
                  <p className="text-sm text-purple-400">Go to blackbox.ai and sign in to access the IDE</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-purple-200">Step 2: Create New Project</h4>
                  <p className="text-sm text-purple-400">Create a new Python project or use the chat interface</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-purple-200">Step 3: Copy Generated Content</h4>
                  <p className="text-sm text-purple-400">Paste the generated prompt or script into BlackBox</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-purple-200">Step 4: Execute</h4>
                  <p className="text-sm text-purple-400">Run the code in BlackBox's VM environment</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-purple-200">Step 5: Monitor Results</h4>
                  <p className="text-sm text-purple-400">Watch for webhook responses and revenue updates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card className="bg-black/60 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Example Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-purple-500/20 rounded p-3">
                  <h4 className="font-semibold text-purple-200 mb-2">Quick Test</h4>
                  <p className="text-sm text-purple-400 mb-2">
                    Generate a simple test prompt to verify webhook connectivity
                  </p>
                  <Badge variant="outline" className="border-blue-400/50 text-blue-400 text-xs">
                    Expected: Revenue increase to ~$2.25
                  </Badge>
                </div>
                
                <div className="border border-purple-500/20 rounded p-3">
                  <h4 className="font-semibold text-purple-200 mb-2">Full Orchestration</h4>
                  <p className="text-sm text-purple-400 mb-2">
                    Complete empire orchestration with voice, revenue, and Azure integration
                  </p>
                  <Badge variant="outline" className="border-green-400/50 text-green-400 text-xs">
                    Expected: Multiple revenue transactions
                  </Badge>
                </div>
                
                <div className="border border-purple-500/20 rounded p-3">
                  <h4 className="font-semibold text-purple-200 mb-2">Continuous Monitoring</h4>
                  <p className="text-sm text-purple-400 mb-2">
                    Automated monitoring with periodic webhook execution
                  </p>
                  <Badge variant="outline" className="border-orange-400/50 text-orange-400 text-xs">
                    Expected: Continuous revenue growth
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}