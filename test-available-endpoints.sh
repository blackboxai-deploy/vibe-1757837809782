#!/bin/bash

echo "🧪 Testing Available Consolidated AI Voice Assistant Endpoints"
echo "🎯 Target: https://consolidated-ai-voice-production.louiewong4.workers.dev"
echo ""

# Test empire status endpoint
echo "🏰 Testing /empire/status endpoint..."
curl "https://consolidated-ai-voice-production.louiewong4.workers.dev/empire/status" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > empire_status_result.json

echo "📊 Empire Status Result:"
cat empire_status_result.json
echo ""

# Test voice command endpoint
echo "🎙️ Testing /voice/command endpoint..."
curl -X POST "https://consolidated-ai-voice-production.louiewong4.workers.dev/voice/command" \
  -H "Content-Type: application/json" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  -d '{"command":"GENERATE","authority":"SUPREME","source":"test_script","timestamp":"2025-01-14T07:30:00Z"}' \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > voice_command_result.json

echo "🎯 Voice Command Result:"
cat voice_command_result.json
echo ""

# Test webhook automation endpoint
echo "🔄 Testing /webhook/automation endpoint..."
curl -X POST "https://consolidated-ai-voice-production.louiewong4.workers.dev/webhook/automation" \
  -H "Content-Type: application/json" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  -d '{"command":"GENERATE","authority":"SUPREME","source":"test_script","timestamp":"2025-01-14T07:30:00Z"}' \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > webhook_automation_result.json

echo "⚙️ Webhook Automation Result:"
cat webhook_automation_result.json
echo ""

# Test metrics endpoint
echo "📈 Testing /metrics endpoint..."
curl "https://consolidated-ai-voice-production.louiewong4.workers.dev/metrics" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > metrics_result.json

echo "📊 Metrics Result:"
cat metrics_result.json
echo ""

echo "✅ All available endpoint tests completed!"
echo "📁 Results saved to corresponding JSON files"