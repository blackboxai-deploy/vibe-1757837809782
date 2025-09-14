"use client";

import { useState, useRef } from "react";
import { WebhookClient } from "@/lib/webhook-client";
import { WebhookPayload, CurlCommand } from "@/types/webhook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CurlCommanderProps {
  client: WebhookClient;
}

export function CurlCommander({ client }: CurlCommanderProps) {
  const [command, setCommand] = useState('GENERATE');
  const [authority, setAuthority] = useState<'STANDARD' | 'ABSOLUTE' | 'SUPREME'>('SUPREME');
  const [source, setSource] = useState('curl_commander');
  const [customPayload, setCustomPayload] = useState('');
  const [generatedCurl, setGeneratedCurl] = useState('');
  const [savedCommands, setSavedCommands] = useState<CurlCommand[]>([]);
  const [commandName, setCommandName] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generateWebhookCurl = () => {
    const payload: WebhookPayload = {
      command,
      authority,
      source,
      timestamp: new Date().toISOString(),
    };

    const curlCommand = client.generateCurlCommand('/webhook', payload);
    setGeneratedCurl(curlCommand);
  };

  const generateOrchestrateCurl = () => {
    const payload: WebhookPayload = {
      command: 'voice_generate_revenue_azure',
      authority,
      source,
      timestamp: new Date().toISOString(),
    };

    const curlCommand = client.generateCurlCommand('/orchestrate', payload);
    setGeneratedCurl(curlCommand);
  };

  const generateRevenueCurl = () => {
    const curlCommand = client.generateCurlCommand('/revenue');
    setGeneratedCurl(curlCommand);
  };

  const generateCustomCurl = () => {
    try {
      const payload = JSON.parse(customPayload);
      const curlCommand = client.generateCurlCommand('/webhook', payload);
      setGeneratedCurl(curlCommand);
    } catch (error) {
      setGeneratedCurl(`# Error: Invalid JSON payload\n# ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCurl);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const saveCommand = () => {
    if (!commandName || !generatedCurl) return;

    const newCommand: CurlCommand = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: commandName,
      url: 'https://consolidated-ai-voice-production.louiewong4.workers.dev',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BlackBox-Curl-Commander/1.0',
      },
      body: customPayload || JSON.stringify({
        command,
        authority,
        source,
        timestamp: new Date().toISOString(),
      }, null, 2),
      created_at: new Date().toISOString(),
    };

    setSavedCommands([newCommand, ...savedCommands]);
    setCommandName('');
  };

  const loadSavedCommand = (savedCommand: CurlCommand) => {
    try {
      const payload = JSON.parse(savedCommand.body || '{}');
      setCommand(payload.command || 'GENERATE');
      setAuthority(payload.authority || 'SUPREME');
      setSource(payload.source || 'curl_commander');
      setCustomPayload(savedCommand.body || '');
      
      const curlCommand = client.generateCurlCommand('/webhook', payload);
      setGeneratedCurl(curlCommand);
    } catch (error) {
      console.error('Failed to load saved command:', error);
    }
  };

  const generateAzureScript = () => {
    const script = `#!/bin/bash
# Azure Cloud Shell Script for Webhook Orchestration
# Consolidated AI Voice Assistant - Empire Control

set -e

BASE_URL="https://consolidated-ai-voice-production.louiewong4.workers.dev"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "🚀 Starting Consolidated AI Voice Assistant Webhook Orchestration"
echo "📡 Target: $BASE_URL"
echo "⏰ Timestamp: $TIMESTAMP"

# Function to execute webhook with logging
execute_webhook() {
    local endpoint="$1"
    local payload="$2"
    local log_file="webhook_\${endpoint//\\//_}_$(date +%s).log"
    
    echo "📋 Executing: $endpoint"
    curl -X POST "$BASE_URL$endpoint" \\
        -H "Content-Type: application/json" \\
        -H "User-Agent: BlackBox-Curl-Commander/1.0" \\
        -d "$payload" \\
        -w "\\nHTTP: %{http_code}\\nTime: %{time_total}s\\nSize: %{size_download} bytes\\n" \\
        -o "$log_file" \\
        --silent --show-error
        
    echo "📄 Response saved to: $log_file"
    echo "📊 Response content:"
    cat "$log_file" | head -20
    echo ""
}

# Execute webhook commands
WEBHOOK_PAYLOAD='{"command":"GENERATE","authority":"SUPREME","source":"azure_script","timestamp":"'$TIMESTAMP'"}'
execute_webhook "/webhook" "$WEBHOOK_PAYLOAD"

ORCHESTRATE_PAYLOAD='{"command":"voice_generate_revenue_azure","authority":"SUPREME","source":"azure_script","timestamp":"'$TIMESTAMP'"}'
execute_webhook "/orchestrate" "$ORCHESTRATE_PAYLOAD"

# Get revenue data
echo "💰 Fetching revenue data..."
curl "$BASE_URL/revenue" \\
    -H "User-Agent: BlackBox-Curl-Commander/1.0" \\
    -w "\\nHTTP: %{http_code}\\nTime: %{time_total}s\\n" \\
    -o "revenue_$(date +%s).log"

echo "✅ Orchestration complete!"
echo "📁 Check log files for detailed results"
`;

    setGeneratedCurl(script);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-purple-500/30">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <Card className="bg-black/60 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Quick Curl Generator</CardTitle>
              <CardDescription className="text-purple-400">
                Generate curl commands for common webhook operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="command" className="text-purple-300">Command</Label>
                  <Input
                    id="command"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="GENERATE"
                    className="bg-black/40 border-purple-500/30 text-purple-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authority" className="text-purple-300">Authority</Label>
                  <Select value={authority} onValueChange={(value) => setAuthority(value as any)}>
                    <SelectTrigger className="bg-black/40 border-purple-500/30 text-purple-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-purple-500/30">
                      <SelectItem value="STANDARD">STANDARD</SelectItem>
                      <SelectItem value="ABSOLUTE">ABSOLUTE</SelectItem>
                      <SelectItem value="SUPREME">SUPREME</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source" className="text-purple-300">Source</Label>
                  <Input
                    id="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="curl_commander"
                    className="bg-black/40 border-purple-500/30 text-purple-100"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={generateWebhookCurl}
                  className="bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/50"
                  variant="outline"
                >
                  Generate Webhook Curl
                </Button>
                <Button
                  onClick={generateOrchestrateCurl}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50"
                  variant="outline"
                >
                  Generate Orchestrate Curl
                </Button>
                <Button
                  onClick={generateRevenueCurl}
                  className="bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
                  variant="outline"
                >
                  Generate Revenue Curl
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card className="bg-black/60 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Custom Payload</CardTitle>
              <CardDescription className="text-purple-400">
                Create curl commands with custom JSON payloads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-payload" className="text-purple-300">JSON Payload</Label>
                <Textarea
                  id="custom-payload"
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  placeholder={JSON.stringify({
                    command: "CUSTOM_COMMAND",
                    authority: "SUPREME",
                    source: "custom",
                    timestamp: new Date().toISOString(),
                    custom_field: "value"
                  }, null, 2)}
                  rows={8}
                  className="bg-black/40 border-purple-500/30 text-purple-100 font-mono"
                />
              </div>
              <Button
                onClick={generateCustomCurl}
                className="bg-orange-600/20 hover:bg-orange-600/30 border-orange-500/50"
                variant="outline"
              >
                Generate Custom Curl
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card className="bg-black/60 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Saved Commands</CardTitle>
              <CardDescription className="text-purple-400">
                Save and reuse your curl commands
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={commandName}
                  onChange={(e) => setCommandName(e.target.value)}
                  placeholder="Command name..."
                  className="bg-black/40 border-purple-500/30 text-purple-100"
                />
                <Button
                  onClick={saveCommand}
                  disabled={!commandName || !generatedCurl}
                  className="bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
                  variant="outline"
                >
                  Save Current
                </Button>
              </div>

              {savedCommands.length > 0 && (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {savedCommands.map((cmd) => (
                      <Card key={cmd.id} className="bg-black/40 border-purple-500/20">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-purple-300">{cmd.name}</h4>
                              <p className="text-xs text-purple-400">{new Date(cmd.created_at).toLocaleDateString()}</p>
                            </div>
                            <Button
                              onClick={() => loadSavedCommand(cmd)}
                              size="sm"
                              className="bg-purple-600/20 hover:bg-purple-600/30"
                              variant="outline"
                            >
                              Load
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-4">
          <Card className="bg-black/60 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Ready-to-Use Scripts</CardTitle>
              <CardDescription className="text-purple-400">
                Generate complete scripts for different environments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={generateAzureScript}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50"
                  variant="outline"
                >
                  Generate Azure Script
                </Button>
                <Button
                  onClick={() => setGeneratedCurl(client.generateBlackBoxPrompt())}
                  className="bg-black-600/20 hover:bg-gray-600/30 border-gray-500/50"
                  variant="outline"
                >
                  Generate BlackBox Prompt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Output Section */}
      {generatedCurl && (
        <Card className="bg-black/60 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-purple-300">Generated Command</CardTitle>
              <CardDescription className="text-purple-400">
                Copy and execute in your terminal or environment
              </CardDescription>
            </div>
            <Button
              onClick={copyToClipboard}
              size="sm"
              className="bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
              variant="outline"
            >
              Copy
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              ref={textareaRef}
              value={generatedCurl}
              readOnly
              rows={generatedCurl.split('\n').length}
              className="bg-black/60 border-purple-500/20 text-purple-100 font-mono text-sm"
            />
            <div className="mt-2 text-xs text-purple-400">
              Ready for execution in Azure Cloud Shell, terminal, or BlackBox IDE
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}