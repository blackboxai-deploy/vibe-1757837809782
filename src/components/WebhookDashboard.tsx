"use client";

import { useState, useEffect } from "react";
import { WebhookClient } from "@/lib/webhook-client";
import { WebhookPayload, WebhookLog, RevenueData } from "@/types/webhook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebhookDashboardProps {
  client: WebhookClient;
}

export function WebhookDashboard({ client }: WebhookDashboardProps) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(client.getStats());

  const refreshData = () => {
    setLogs(client.getLogs());
    setStats(client.getStats());
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  const executeQuickWebhook = async (command: string, authority: 'STANDARD' | 'ABSOLUTE' | 'SUPREME') => {
    setIsLoading(true);
    try {
      const payload: WebhookPayload = {
        command,
        authority,
        source: 'dashboard',
        timestamp: new Date().toISOString(),
      };

      await client.executeWebhook(payload);
      refreshData();
    } catch (error) {
      console.error('Webhook execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuickOrchestration = async (command: string) => {
    setIsLoading(true);
    try {
      const payload: WebhookPayload = {
        command,
        authority: 'SUPREME',
        source: 'dashboard',
        timestamp: new Date().toISOString(),
      };

      await client.executeOrchestration(payload);
      refreshData();
    } catch (error) {
      console.error('Orchestration execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRevenue = async () => {
    setIsLoading(true);
    try {
      const { response } = await client.getRevenue();
      setRevenue(response);
      refreshData();
    } catch (error) {
      console.error('Revenue fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    client.clearLogs();
    refreshData();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (duration?: number) => {
    return duration ? `${duration}ms` : 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/60 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-300">{stats.totalCalls}</div>
            <p className="text-sm text-purple-400">Total Calls</p>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-green-500/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-300">{stats.successCalls}</div>
            <p className="text-sm text-green-400">Successful</p>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-red-500/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-300">{stats.errorCalls}</div>
            <p className="text-sm text-red-400">Errors</p>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-300">{stats.avgDuration}ms</div>
            <p className="text-sm text-blue-400">Avg Response</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300">Quick Actions</CardTitle>
          <CardDescription className="text-purple-400">
            Execute common webhook operations with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="webhook" className="space-y-4">
            <TabsList className="bg-black/40">
              <TabsTrigger value="webhook">Webhook Commands</TabsTrigger>
              <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>

            <TabsContent value="webhook" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => executeQuickWebhook('GENERATE', 'SUPREME')}
                  disabled={isLoading}
                  className="bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/50"
                  variant="outline"
                >
                  Generate (Supreme)
                </Button>
                <Button
                  onClick={() => executeQuickWebhook('EXPAND_EMPIRE', 'ABSOLUTE')}
                  disabled={isLoading}
                  className="bg-pink-600/20 hover:bg-pink-600/30 border-pink-500/50"
                  variant="outline"
                >
                  Expand Empire
                </Button>
                <Button
                  onClick={() => executeQuickWebhook('MAXIMIZE_REVENUE', 'SUPREME')}
                  disabled={isLoading}
                  className="bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
                  variant="outline"
                >
                  Maximize Revenue
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="orchestration" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={() => executeQuickOrchestration('voice_generate_revenue_azure')}
                  disabled={isLoading}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50"
                  variant="outline"
                >
                  Voice + Revenue + Azure
                </Button>
                <Button
                  onClick={() => executeQuickOrchestration('full_empire_orchestration')}
                  disabled={isLoading}
                  className="bg-orange-600/20 hover:bg-orange-600/30 border-orange-500/50"
                  variant="outline"
                >
                  Full Empire Orchestration
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="flex space-x-3">
                <Button
                  onClick={fetchRevenue}
                  disabled={isLoading}
                  className="bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
                  variant="outline"
                >
                  Fetch Current Revenue
                </Button>
                {revenue && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-green-400/50 text-green-400">
                      Total: ${revenue.total}
                    </Badge>
                    <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                      Transactions: {revenue.transactions.length}
                    </Badge>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Logs Section */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-purple-300">Execution Logs</CardTitle>
            <CardDescription className="text-purple-400">
              Real-time webhook execution history and results
            </CardDescription>
          </div>
          <Button 
            onClick={clearLogs}
            size="sm"
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-600/20"
          >
            Clear Logs
          </Button>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <Alert className="bg-black/40 border-purple-500/30">
              <AlertDescription className="text-purple-300">
                No webhook executions yet. Use the quick actions above to start.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-96 w-full">
              <div className="space-y-3">
                {logs.map((log) => (
                  <Card key={log.id} className="bg-black/40 border-purple-500/20">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={log.status === 'success' ? 'default' : 'destructive'}
                              className={
                                log.status === 'success' 
                                  ? 'bg-green-600/20 text-green-400 border-green-500/50'
                                  : log.status === 'error'
                                  ? 'bg-red-600/20 text-red-400 border-red-500/50'
                                  : 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50'
                              }
                            >
                              {log.status.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-purple-300 font-mono">
                              {log.method} {log.endpoint}
                            </span>
                            <span className="text-xs text-purple-400">
                              {formatDuration(log.duration)}
                            </span>
                          </div>
                          <div className="text-xs text-purple-400">
                            {formatTimestamp(log.timestamp)}
                          </div>
                          {log.error && (
                            <div className="text-xs text-red-400 mt-2">
                              Error: {log.error}
                            </div>
                          )}
                        </div>
                        {log.response ? (
                          <Badge variant="outline" className="border-purple-400/50 text-purple-400 text-xs">
                            {(log.response as any)?.revenue_generated ? `${(log.response as any).revenue_generated}` : 'Response OK'}
                          </Badge>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}