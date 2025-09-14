#!/usr/bin/env python3
"""
CONSOLIDATED AI VOICE ASSISTANT - WEBHOOK COMMANDER
Enhanced Python script for webhook orchestration and empire testing
"""

import requests
import json
import time
from datetime import datetime
import sys

class WebhookCommander:
    def __init__(self):
        # Primary Worker URL
        self.primary_url = "https://consolidated-ai-voice-production.louiewong4.workers.dev"
        # Secondary Worker URL (from deployment script)
        self.secondary_url = "https://azure-hybrid-orchestrator.louiewong4.workers.dev"
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'BlackBox-Sandbox-Commander/1.0',
            'Content-Type': 'application/json'
        })
        
        self.log_file = f"webhook_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
    def log(self, message):
        """Log message to both console and file"""
        timestamp = datetime.now().isoformat()
        log_entry = f"[{timestamp}] {message}"
        print(log_entry)
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry + '\n')
    
    def test_worker_connection(self, url):
        """Test if worker is accessible"""
        try:
            response = self.session.get(url, timeout=10)
            self.log(f"✅ Worker {url} - Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.log(f"   Response: {json.dumps(data, indent=2)}")
                return True
            return False
        except Exception as e:
            self.log(f"❌ Worker {url} - Connection failed: {str(e)}")
            return False
    
    def execute_webhook(self, base_url, endpoint, payload=None, method='GET'):
        """Execute webhook command"""
        url = f"{base_url}{endpoint}"
        
        try:
            self.log(f"🔄 Executing {method} {url}")
            if payload:
                self.log(f"   Payload: {json.dumps(payload, indent=2)}")
            
            start_time = time.time()
            
            if method == 'POST':
                response = self.session.post(url, json=payload, timeout=15)
            else:
                response = self.session.get(url, timeout=15)
            
            duration = time.time() - start_time
            
            self.log(f"   Status: {response.status_code} | Duration: {duration:.2f}s")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    self.log(f"   ✅ Success Response:")
                    self.log(f"   {json.dumps(data, indent=4)}")
                    return data
                except json.JSONDecodeError:
                    self.log(f"   ✅ Success (Non-JSON): {response.text}")
                    return response.text
            else:
                self.log(f"   ❌ Error {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            self.log(f"   ❌ Exception: {str(e)}")
            return None
    
    def run_empire_test_suite(self, base_url):
        """Run complete empire test suite"""
        self.log(f"🏛️ STARTING EMPIRE TEST SUITE for {base_url}")
        self.log("=" * 60)
        
        results = {}
        
        # Test 1: Root endpoint
        self.log("📡 Test 1: Root Endpoint")
        results['root'] = self.execute_webhook(base_url, "/")
        time.sleep(1)
        
        # Test 2: Status endpoint
        self.log("\n📊 Test 2: Status Endpoint")
        results['status'] = self.execute_webhook(base_url, "/status")
        time.sleep(1)
        
        # Test 3: Webhook revenue generation (SUPREME authority)
        self.log("\n💰 Test 3: Webhook Revenue Generation (SUPREME)")
        webhook_payload = {
            "command": "GENERATE-EMPIRE-REVENUE",
            "authority": "SUPREME",
            "source": "sandbox-commander",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        results['webhook_supreme'] = self.execute_webhook(base_url, "/webhook", webhook_payload, 'POST')
        time.sleep(1)
        
        # Test 4: Orchestration command
        self.log("\n🎭 Test 4: Orchestration Command")
        orchestrate_payload = {
            "command": "voice_generate_revenue_azure",
            "authority": "SUPREME",
            "source": "sandbox-commander",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        results['orchestrate'] = self.execute_webhook(base_url, "/orchestrate", orchestrate_payload, 'POST')
        time.sleep(1)
        
        # Test 5: Revenue status
        self.log("\n📈 Test 5: Revenue Status")
        results['revenue'] = self.execute_webhook(base_url, "/revenue")
        time.sleep(1)
        
        # Test 6: Empire status
        self.log("\n🌍 Test 6: Empire Status")
        results['empire'] = self.execute_webhook(base_url, "/empire")
        time.sleep(1)
        
        # Test 7: Metrics
        self.log("\n📊 Test 7: Metrics")
        results['metrics'] = self.execute_webhook(base_url, "/metrics")
        
        return results
    
    def generate_blackbox_prompt(self):
        """Generate BlackBox AI prompt for execution"""
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        prompt = f"""BlackBox AI, use sandbox sbx_7UHMLfBG8XFGokPC7MU96TlE6Qi4 to orchestrate webhook POST requests for the Consolidated AI Voice Assistant. Execute these commands in your terminal to verify empire operation:

## PRIMARY WORKER TESTING
export PRIMARY_URL="{self.primary_url}"

# Test connection
curl -s "$PRIMARY_URL" | jq .

# Generate revenue (SUPREME authority)
curl -X POST "$PRIMARY_URL/webhook" \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: BlackBox-Sandbox-Commander/1.0" \\
  -d '{{"command": "GENERATE-EMPIRE-REVENUE", "authority": "SUPREME", "source": "blackbox-sandbox", "timestamp": "{timestamp}"}}' | jq .

# Check revenue
curl -s "$PRIMARY_URL/revenue" | jq .

## SECONDARY WORKER TESTING  
export SECONDARY_URL="{self.secondary_url}"

# Test secondary worker
curl -s "$SECONDARY_URL" | jq .

# Generate money on secondary
curl -X POST "$SECONDARY_URL/webhook" \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: BlackBox-Sandbox-Commander/1.0" \\
  -d '{{"command": "DEPLOY-EMPIRE-DOMINATION", "authority": "SUPREME", "source": "blackbox-sandbox", "timestamp": "{timestamp}"}}' | jq .

# Check empire status
curl -s "$SECONDARY_URL/empire" | jq .

## PYTHON ALTERNATIVE
pip install requests
python3 << 'PYTHON_SCRIPT'
{self.generate_python_script()}
PYTHON_SCRIPT

Execute these commands and report:
1. HTTP status codes for all endpoints
2. Revenue amounts generated (expect 2.25+ per SUPREME command)
3. Empire status and operational confirmations
4. Any error messages or connection issues
5. Timestamps matching {timestamp}

Expected results: Empire fully operational, revenue generation active, both workers responding correctly.
"""
        return prompt
    
    def generate_python_script(self):
        """Generate embedded Python script for BlackBox"""
        return f'''
import requests
import json
from datetime import datetime

def test_webhook_empire():
    urls = [
        "{self.primary_url}",
        "{self.secondary_url}"
    ]
    
    headers = {{
        'User-Agent': 'BlackBox-Sandbox-Commander/1.0',
        'Content-Type': 'application/json'
    }}
    
    for base_url in urls:
        print(f"\\n{'='*50}")
        print(f"Testing: {{base_url}}")
        print('='*50)
        
        # Test webhook money generation
        payload = {{
            "command": "BLACKBOX-EMPIRE-MONEY",
            "authority": "SUPREME",
            "source": "blackbox-python",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }}
        
        try:
            # Test webhook
            response = requests.post(f"{{base_url}}/webhook", json=payload, headers=headers, timeout=10)
            print(f"Webhook Status: {{response.status_code}}")
            print(f"Response: {{response.json()}}")
            
            # Test revenue
            revenue_response = requests.get(f"{{base_url}}/revenue", headers=headers, timeout=10)
            print(f"\\nRevenue Status: {{revenue_response.status_code}}")
            print(f"Revenue Data: {{revenue_response.json()}}")
            
        except Exception as e:
            print(f"Error: {{str(e)}}")

test_webhook_empire()
'''
    
    def run_complete_empire_validation(self):
        """Run complete empire validation across all workers"""
        self.log("🚀 CONSOLIDATED AI VOICE ASSISTANT - EMPIRE VALIDATION")
        self.log("=" * 70)
        
        workers_to_test = [
            ("PRIMARY", self.primary_url),
            ("SECONDARY", self.secondary_url)
        ]
        
        all_results = {}
        
        for worker_name, worker_url in workers_to_test:
            self.log(f"\n🏛️ TESTING {worker_name} WORKER: {worker_url}")
            self.log("-" * 50)
            
            if self.test_worker_connection(worker_url):
                results = self.run_empire_test_suite(worker_url)
                all_results[worker_name] = results
                
                # Extract revenue information if available
                if results.get('webhook_supreme') and isinstance(results['webhook_supreme'], dict):
                    revenue = results['webhook_supreme'].get('revenue_generated', 'N/A')
                    self.log(f"💰 Revenue Generated: {revenue}")
                
            else:
                self.log(f"❌ {worker_name} worker not accessible")
                all_results[worker_name] = None
        
        # Generate summary
        self.log("\n" + "=" * 70)
        self.log("📊 EMPIRE VALIDATION SUMMARY")
        self.log("=" * 70)
        
        for worker_name, results in all_results.items():
            if results:
                self.log(f"✅ {worker_name} Worker: OPERATIONAL")
                if results.get('webhook_supreme'):
                    self.log(f"   💰 Revenue Generation: ACTIVE")
                if results.get('empire'):
                    self.log(f"   🌍 Empire Status: READY")
            else:
                self.log(f"❌ {worker_name} Worker: NOT ACCESSIBLE")
        
        self.log(f"\n📝 Detailed logs saved to: {self.log_file}")
        
        return all_results

def main():
    commander = WebhookCommander()
    
    print("🎯 CONSOLIDATED AI VOICE ASSISTANT - WEBHOOK COMMANDER")
    print("=" * 60)
    
    try:
        # Run complete validation
        results = commander.run_complete_empire_validation()
        
        print(f"\n🎉 Empire validation completed!")
        print(f"📋 Check {commander.log_file} for detailed logs")
        
        # Generate BlackBox prompt
        print("\n🤖 BlackBox AI Prompt Generated:")
        print("-" * 40)
        prompt = commander.generate_blackbox_prompt()
        
        # Save prompt to file
        prompt_file = f"blackbox_prompt_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(prompt_file, 'w') as f:
            f.write(prompt)
        
        print(f"📝 BlackBox prompt saved to: {prompt_file}")
        print("\n✅ Ready for BlackBox AI execution!")
        
        return 0
        
    except KeyboardInterrupt:
        print("\n⚠️ Operation cancelled by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())