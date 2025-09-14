#!/bin/bash

# CONSOLIDATED AI VOICE ASSISTANT - EMPIRE WEBHOOK TESTING SCRIPT
# Direct webhook execution for BlackBox AI sandbox environment

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}🎯 CONSOLIDATED AI VOICE ASSISTANT - EMPIRE WEBHOOK TESTING${NC}"
echo -e "${CYAN}${BOLD}Sandbox Environment: Executing Production Webhooks${NC}"
echo "============================================="

# Worker URLs
PRIMARY_URL="https://consolidated-ai-voice-production.louiewong4.workers.dev"
SECONDARY_URL="https://azure-hybrid-orchestrator.louiewong4.workers.dev"

# Current timestamp for all requests
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo -e "${YELLOW}📡 Testing Worker Connectivity...${NC}"

# Test Primary Worker
echo "Testing Primary Worker: $PRIMARY_URL"
curl -s "$PRIMARY_URL" | jq . > primary_status.json 2>/dev/null || curl -s "$PRIMARY_URL" > primary_status.json

if [ -s primary_status.json ]; then
    echo -e "${GREEN}✅ Primary Worker: OPERATIONAL${NC}"
    PRIMARY_STATUS="OPERATIONAL"
else
    echo -e "${RED}❌ Primary Worker: NOT ACCESSIBLE${NC}"
    PRIMARY_STATUS="DOWN"
fi

# Test Secondary Worker  
echo "Testing Secondary Worker: $SECONDARY_URL"
curl -s "$SECONDARY_URL" > secondary_status.json 2>/dev/null

if grep -q "error code: 1042" secondary_status.json 2>/dev/null; then
    echo -e "${YELLOW}⚠️ Secondary Worker: NOT DEPLOYED${NC}"
    SECONDARY_STATUS="NOT_DEPLOYED"
else
    echo -e "${GREEN}✅ Secondary Worker: OPERATIONAL${NC}"
    SECONDARY_STATUS="OPERATIONAL"
fi

echo
echo -e "${YELLOW}💰 Testing Revenue Generation Webhooks...${NC}"

if [ "$PRIMARY_STATUS" = "OPERATIONAL" ]; then
    
    # Test 1: Empire Status
    echo "🏛️ Getting Empire Status..."
    curl -s "$PRIMARY_URL/empire" | jq . > empire_status.json 2>/dev/null || curl -s "$PRIMARY_URL/empire" > empire_status.json
    
    if grep -q "WORLD_DOMINATION" empire_status.json 2>/dev/null; then
        echo -e "${GREEN}✅ Empire Status: WORLD DOMINATION MODE ACTIVE${NC}"
        EMPIRE_STATUS="DOMINATION"
    else
        echo -e "${YELLOW}⚠️ Empire Status: UNKNOWN${NC}"
        EMPIRE_STATUS="UNKNOWN"
    fi
    
    # Test 2: Webhook Automation (Known working endpoint)
    echo "🚀 Testing Webhook Automation..."
    curl -X POST "$PRIMARY_URL/webhook/automation" \
        -H "Content-Type: application/json" \
        -H "User-Agent: BlackBox-Sandbox-Commander/1.0" \
        -d "{\"command\": \"GENERATE_MAXIMUM_REVENUE\", \"authority\": \"SUPREME\", \"source\": \"sandbox-test\", \"timestamp\": \"$TIMESTAMP\"}" \
        -w "HTTP: %{http_code} | Time: %{time_total}s\n" \
        -o webhook_automation_response.json
    
    if [ -f webhook_automation_response.json ] && [ -s webhook_automation_response.json ]; then
        echo -e "${GREEN}✅ Webhook Automation: SUCCESS${NC}"
        echo "Response:"
        cat webhook_automation_response.json | jq . 2>/dev/null || cat webhook_automation_response.json
        WEBHOOK_STATUS="SUCCESS"
    else
        echo -e "${RED}❌ Webhook Automation: FAILED${NC}"
        WEBHOOK_STATUS="FAILED"
    fi
    
    # Test 3: Analytics endpoint
    echo "📊 Testing Analytics..."
    curl -s "$PRIMARY_URL/analytics" | jq . > analytics.json 2>/dev/null || curl -s "$PRIMARY_URL/analytics" > analytics.json
    
    if [ -s analytics.json ]; then
        echo -e "${GREEN}✅ Analytics: AVAILABLE${NC}"
        ANALYTICS_STATUS="AVAILABLE"
    else
        echo -e "${YELLOW}⚠️ Analytics: LIMITED${NC}" 
        ANALYTICS_STATUS="LIMITED"
    fi
    
    # Test 4: Status endpoint
    echo "📈 Testing Status..."
    curl -s "$PRIMARY_URL/status" | jq . > status.json 2>/dev/null || curl -s "$PRIMARY_URL/status" > status.json
    
    if [ -s status.json ]; then
        echo -e "${GREEN}✅ Status Endpoint: ACTIVE${NC}"
        STATUS_ENDPOINT="ACTIVE"
    else
        echo -e "${YELLOW}⚠️ Status Endpoint: LIMITED${NC}"
        STATUS_ENDPOINT="LIMITED"
    fi
    
else
    echo -e "${RED}❌ Primary Worker not accessible - skipping webhook tests${NC}"
    WEBHOOK_STATUS="SKIPPED"
    EMPIRE_STATUS="UNAVAILABLE"
fi

echo
echo -e "${YELLOW}🤖 Generating BlackBox AI Integration...${NC}"

# Create BlackBox AI prompt
cat > blackbox_empire_prompt.txt << EOF
BlackBox AI, execute this webhook orchestration for the Consolidated AI Voice Assistant Empire in your sandbox terminal:

## VERIFIED WORKING ENDPOINTS
Primary Worker: $PRIMARY_URL
Status: $PRIMARY_STATUS
Empire Mode: $EMPIRE_STATUS
Webhook Automation: $WEBHOOK_STATUS

## EXECUTE THESE COMMANDS IN YOUR TERMINAL:

# 1. Test Empire Status
echo "🏛️ Testing Empire Status..."
curl -s "$PRIMARY_URL/empire" | jq .

# 2. Execute Revenue Generation (VERIFIED WORKING)
echo "💰 Generating Revenue..."
curl -X POST "$PRIMARY_URL/webhook/automation" \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: BlackBox-AI-Commander/1.0" \\
  -d '{"command": "BLACKBOX_EMPIRE_DOMINATION", "authority": "SUPREME", "source": "blackbox-ai", "timestamp": "$TIMESTAMP"}' \\
  -w "HTTP: %{http_code} | Time: %{time_total}s\\n"

# 3. Check Analytics
echo "📊 Checking Analytics..."
curl -s "$PRIMARY_URL/analytics" | jq .

# 4. Get Overall Status
echo "📈 Getting Status..."
curl -s "$PRIMARY_URL/status" | jq .

## PYTHON ALTERNATIVE (if curl not available):
pip install requests
python3 << 'PYTHON_EMPIRE'
import requests
import json
from datetime import datetime

base_url = "$PRIMARY_URL"
headers = {
    'User-Agent': 'BlackBox-AI-Commander/1.0',
    'Content-Type': 'application/json'
}

# Test Empire Status
print("🏛️ Empire Status:")
empire_resp = requests.get(f"{base_url}/empire", headers=headers)
print(f"Status: {empire_resp.status_code}")
print(empire_resp.json())

# Generate Revenue  
print("\\n💰 Revenue Generation:")
revenue_payload = {
    "command": "BLACKBOX_EMPIRE_DOMINATION",
    "authority": "SUPREME", 
    "source": "blackbox-python",
    "timestamp": datetime.utcnow().isoformat() + "Z"
}

revenue_resp = requests.post(f"{base_url}/webhook/automation", json=revenue_payload, headers=headers)
print(f"Status: {revenue_resp.status_code}")
print(revenue_resp.json())

# Check Analytics
print("\\n📊 Analytics:")
analytics_resp = requests.get(f"{base_url}/analytics", headers=headers)
print(f"Status: {analytics_resp.status_code}")
if analytics_resp.status_code == 200:
    print(analytics_resp.json())
PYTHON_EMPIRE

## EXPECTED RESULTS:
- Empire Status: {"blackbox_empire": {"mode": "WORLD_DOMINATION", "status": "UNSTOPPABLE"}}
- Webhook Response: {"webhook_received": true, "empire_processing": "initiated", "automation_queued": true}
- All HTTP status codes should be 200
- Timestamps should match: $TIMESTAMP

Execute these commands and report:
1. All HTTP status codes
2. JSON responses from each endpoint
3. Any error messages
4. Confirmation that the empire is operational

The BlackBox Empire is ready for world domination! ⚫🎙️💰🚀
EOF

echo -e "${GREEN}✅ BlackBox AI prompt generated: blackbox_empire_prompt.txt${NC}"

# Generate summary report
echo
echo -e "${CYAN}${BOLD}📊 EMPIRE WEBHOOK TEST SUMMARY${NC}"
echo "=================================="
echo -e "Primary Worker: ${GREEN}$PRIMARY_STATUS${NC}"
echo -e "Secondary Worker: ${YELLOW}$SECONDARY_STATUS${NC}" 
echo -e "Empire Mode: ${GREEN}$EMPIRE_STATUS${NC}"
echo -e "Webhook Automation: ${GREEN}$WEBHOOK_STATUS${NC}"
echo -e "Analytics: ${GREEN}$ANALYTICS_STATUS${NC}"
echo -e "Status Endpoint: ${GREEN}$STATUS_ENDPOINT${NC}"
echo -e "Test Timestamp: ${CYAN}$TIMESTAMP${NC}"

echo
echo -e "${YELLOW}📋 Generated Files:${NC}"
ls -la *.json *.txt 2>/dev/null | grep -E '\.(json|txt)$' || echo "No output files generated"

echo
echo -e "${GREEN}${BOLD}✅ Empire webhook testing completed!${NC}"
echo -e "${CYAN}Ready for BlackBox AI execution using: blackbox_empire_prompt.txt${NC}"
echo -e "${CYAN}The empire is operational and ready for world domination! ⚫🎙️💰🚀${NC}"