"use client";

import { useState, useEffect } from "react";
import { WebhookDashboard } from "@/components/WebhookDashboard";
import { CurlCommander } from "@/components/CurlCommander";
import { BlackBoxIntegration } from "@/components/BlackBoxIntegration";
import { RevenueTracker } from "@/components/RevenueTracker";
import { AutomationScheduler } from "@/components/AutomationScheduler";
import { LiveRevenueCard } from "@/components/LiveRevenueCard";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebhookClient } from "@/lib/webhook-client";

export default function Home() {
  const [webhookClient] = useState(() => new WebhookClient());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Checking connection...");

  useEffect(() => {
    // Test connection to the Worker on component mount
    const testConnection = async () => {
      try {
        await webhookClient.getRevenue();
        setIsConnected(true);
        setConnectionStatus("Connected to Consolidated AI Voice Assistant Worker");
      } catch (error) {
        setIsConnected(false);
        setConnectionStatus(error instanceof Error ? error.message : "Connection failed");
      }
    };

    testConnection();
  }, [webhookClient]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          Webhook Orchestration Command Center
        </h1>
        <p className="text-xl text-purple-300 max-w-3xl mx-auto">
          Advanced webhook orchestration system for the Consolidated AI Voice Assistant empire
        </p>
        
        {/* Connection Status */}
        <Card className="bg-black/40 border-purple-500/30 max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {connectionStatus}
              </span>
            </div>
            {isConnected && (
              <div className="mt-3 text-center">
                <Badge variant="outline" className="border-green-400/50 text-green-400">
                  Worker: consolidated-ai-voice-production.louiewong4.workers.dev
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-black/50 border border-purple-500/30">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600/20">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="live-revenue" className="data-[state=active]:bg-purple-600/20">
            Live Revenue
          </TabsTrigger>
          <TabsTrigger value="curl" className="data-[state=active]:bg-purple-600/20">
            Curl Commander
          </TabsTrigger>
          <TabsTrigger value="blackbox" className="data-[state=active]:bg-purple-600/20">
            BlackBox AI
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-purple-600/20">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-purple-600/20">
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Revenue Card - Featured */}
            <div className="lg:col-span-1">
              <LiveRevenueCard className="h-full bg-black/40 border-purple-500/30 text-white" />
            </div>
            
            {/* Main Webhook Dashboard */}
            <div className="lg:col-span-2">
              <Card className="bg-black/40 border-purple-500/30 h-full">
                <CardHeader>
                  <CardTitle className="text-purple-300">Webhook Dashboard</CardTitle>
                  <CardDescription className="text-purple-400">
                    Monitor and execute webhook operations for the Voice Assistant empire
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WebhookDashboard client={webhookClient} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="live-revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Revenue Details */}
            <div>
              <LiveRevenueCard className="h-full bg-black/40 border-purple-500/30 text-white" />
            </div>
            
            {/* Subscription Management */}
            <div>
              <SubscriptionManager 
                userEmail="admin@empire.ai"
                className="h-full bg-black/40 border-purple-500/30 text-white"
              />
            </div>
          </div>
          
          {/* Stripe Integration Status */}
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">💳 Real Payment System Integration</CardTitle>
              <CardDescription className="text-purple-400">
                Transform your empire from simulation to real money generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-purple-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">$0 → $5,000+</div>
                  <div className="text-sm text-purple-300">Monthly Revenue Potential</div>
                </div>
                <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">$29-99</div>
                  <div className="text-sm text-purple-300">Subscription Plans</div>
                </div>
                <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">$0.05</div>
                  <div className="text-sm text-purple-300">Per Voice AI Call</div>
                </div>
                <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-pink-400">2-7 Days</div>
                  <div className="text-sm text-purple-300">Bank Payout Time</div>
                </div>
              </div>
              
              <div className="text-sm text-purple-300 space-y-2">
                <p>🔗 <strong>Integration Status:</strong> Ready to deploy Stripe payment system</p>
                <p>💳 <strong>Payment Processing:</strong> PCI DSS compliant, secure card handling</p>
                <p>🏦 <strong>Bank Integration:</strong> Direct payouts to your account via Stripe</p>
                <p>📊 <strong>Revenue Tracking:</strong> Real-time balance updates and transaction history</p>
                <p>🔄 <strong>Migration Ready:</strong> Seamless transition from simulation to live payments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curl" className="space-y-6">
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Curl Command Generator</CardTitle>
              <CardDescription className="text-purple-400">
                Generate and execute curl commands for webhook orchestration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CurlCommander client={webhookClient} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blackbox" className="space-y-6">
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">BlackBox AI Integration</CardTitle>
              <CardDescription className="text-purple-400">
                Generate BlackBox AI prompts and code for webhook automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlackBoxIntegration client={webhookClient} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Revenue Tracker</CardTitle>
              <CardDescription className="text-purple-400">
                Monitor revenue generation from webhook operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueTracker client={webhookClient} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Automation Scheduler</CardTitle>
              <CardDescription className="text-purple-400">
                Schedule periodic webhook execution for continuous empire expansion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomationScheduler client={webhookClient} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-purple-400/60 text-sm border-t border-purple-500/20 pt-6">
        <p>Consolidated AI Voice Assistant - Webhook Orchestration System v1.0</p>
        <p className="text-xs mt-1">Empire Status: Active • BlackBox Integration: Ready • Gemini API: Available</p>
      </div>
    </div>
  );
}