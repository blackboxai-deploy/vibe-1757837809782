#!/bin/bash

echo "🧪 Testing Consolidated AI Voice Assistant Webhook System"
echo "🎯 Target: https://consolidated-ai-voice-production.louiewong4.workers.dev"
echo ""

# Test webhook endpoint
echo "📡 Testing webhook endpoint..."
curl -X POST "https://consolidated-ai-voice-production.louiewong4.workers.dev/webhook" \
  -H "Content-Type: application/json" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  -d '{"command":"GENERATE","authority":"SUPREME","source":"test_script","timestamp":"2025-01-14T07:30:00Z"}' \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > webhook_test_result.json

echo "📊 Webhook Result:"
cat webhook_test_result.json
echo ""

# Test revenue endpoint
echo "💰 Testing revenue endpoint..."
curl "https://consolidated-ai-voice-production.louiewong4.workers.dev/revenue" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > revenue_test_result.json

echo "📈 Revenue Result:"
cat revenue_test_result.json
echo ""

# Test orchestration endpoint
echo "🎛️ Testing orchestration endpoint..."
curl -X POST "https://consolidated-ai-voice-production.louiewong4.workers.dev/orchestrate" \
  -H "Content-Type: application/json" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  -d '{"command":"voice_generate_revenue_azure","authority":"SUPREME","source":"test_script","timestamp":"2025-01-14T07:30:00Z"}' \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > orchestration_test_result.json

echo "🎯 Orchestration Result:"
cat orchestration_test_result.json
echo ""

echo "✅ All webhook tests completed!"
echo "📁 Results saved to: webhook_test_result.json, revenue_test_result.json, orchestration_test_result.json"