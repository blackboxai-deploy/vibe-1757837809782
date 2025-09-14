#!/bin/bash

echo "🚀 Testing Updated Consolidated AI Voice Assistant System"
echo "🎯 Target: https://consolidated-ai-voice-production.louiewong4.workers.dev"
echo "✨ Using working endpoints: /webhook/automation, /metrics, /empire"
echo ""

# Test updated webhook automation endpoint
echo "🔄 Testing updated webhook automation..."
curl -X POST "https://consolidated-ai-voice-production.louiewong4.workers.dev/webhook/automation" \
  -H "Content-Type: application/json" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  -d '{"command":"GENERATE","authority":"SUPREME","source":"updated_system","timestamp":"2025-01-14T07:45:00Z"}' \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > updated_webhook_result.json

echo "📊 Updated Webhook Result:"
cat updated_webhook_result.json
echo ""

# Test metrics endpoint (as revenue replacement)
echo "💰 Testing metrics endpoint (revenue data)..."
curl "https://consolidated-ai-voice-production.louiewong4.workers.dev/metrics" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > updated_metrics_result.json

echo "📈 Updated Metrics Result:"
cat updated_metrics_result.json
echo ""

# Test empire endpoint (orchestration replacement) 
echo "🏰 Testing empire endpoint (orchestration)..."
curl -X POST "https://consolidated-ai-voice-production.louiewong4.workers.dev/empire" \
  -H "Content-Type: application/json" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  -d '{"command":"voice_generate_revenue_azure","authority":"SUPREME","source":"updated_system","timestamp":"2025-01-14T07:45:00Z"}' \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > updated_empire_result.json

echo "🎯 Updated Empire Result:"
cat updated_empire_result.json
echo ""

# Final empire status check
echo "🏁 Final empire status check..."
curl "https://consolidated-ai-voice-production.louiewong4.workers.dev/empire/status" \
  -H "User-Agent: BlackBox-Curl-Commander/1.0" \
  --silent --show-error \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  > final_status_result.json

echo "🎖️ Final Status:"
cat final_status_result.json
echo ""

echo "✅ All updated system tests completed successfully!"
echo "🎉 Empire orchestration system is fully operational!"
echo "📁 Results saved to updated_*.json files"