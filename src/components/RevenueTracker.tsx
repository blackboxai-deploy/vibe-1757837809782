"use client";

import { useState, useEffect } from "react";
import { WebhookClient } from "@/lib/webhook-client";
import { RevenueData } from "@/types/webhook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RevenueTrackerProps {
  client: WebhookClient;
}

export function RevenueTracker({ client }: RevenueTrackerProps) {
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchRevenue = async () => {
    setIsLoading(true);
    try {
      const { response } = await client.getRevenue();
      setRevenue(response);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Revenue fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchRevenue();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchRevenue, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready_for_maximum_profit':
        return 'text-green-400 border-green-400/50';
      case 'active':
        return 'text-blue-400 border-blue-400/50';
      default:
        return 'text-purple-400 border-purple-400/50';
    }
  };

  if (!revenue) {
    return (
      <div className="flex items-center justify-center p-8">
        <Button
          onClick={fetchRevenue}
          disabled={isLoading}
          className="bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
          variant="outline"
        >
          {isLoading ? 'Loading...' : 'Fetch Revenue Data'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            onClick={fetchRevenue}
            disabled={isLoading}
            className="bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
            variant="outline"
            size="sm"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh 
              ? "bg-red-600/20 hover:bg-red-600/30 border-red-500/50"
              : "bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50"
            }
            variant="outline"
            size="sm"
          >
            {autoRefresh ? 'Stop Auto-Refresh' : 'Start Auto-Refresh'}
          </Button>
        </div>
        {lastUpdated && (
          <div className="text-xs text-purple-400">
            Last updated: {formatTimestamp(lastUpdated)}
          </div>
        )}
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/60 border-green-500/30">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-300">
              {formatCurrency(revenue.total)}
            </div>
            <p className="text-sm text-green-400">Total Revenue</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${revenue.tracking_active ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-xs text-green-400">
                {revenue.tracking_active ? 'Tracking Active' : 'Tracking Inactive'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-300">
              {revenue.transactions.length}
            </div>
            <p className="text-sm text-blue-400">Total Transactions</p>
            <div className="text-xs text-blue-400 mt-2">
              Updated: {formatTimestamp(revenue.last_updated)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-300">
              {revenue.empire_revenue?.maximum_per_command || 'N/A'}
            </div>
            <p className="text-sm text-purple-400">Max Per Command</p>
            <Badge 
              variant="outline" 
              className={`mt-2 text-xs ${getStatusColor(revenue.empire_revenue?.status || 'unknown')}`}
            >
              {revenue.empire_revenue?.status?.replace(/_/g, ' ') || 'Unknown'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Empire Revenue Configuration */}
      {revenue.empire_revenue && (
        <Card className="bg-black/60 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-300">Empire Revenue Configuration</CardTitle>
            <CardDescription className="text-purple-400">
              Current revenue multipliers and system status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-purple-200">Authority Multipliers</h4>
                <div className="space-y-2">
                  {Object.entries(revenue.empire_revenue.authority_multipliers).map(([authority, multiplier]) => (
                    <div key={authority} className="flex justify-between items-center">
                      <span className="text-sm text-purple-300">{authority}</span>
                      <Badge variant="outline" className="border-purple-400/50 text-purple-400 text-xs">
                        {multiplier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-purple-200">Revenue Settings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-300">Base Rate:</span>
                    <span className="text-purple-400">${revenue.empire_revenue.base_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Premium Multiplier:</span>
                    <span className="text-purple-400">{revenue.empire_revenue.premium_multiplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Token Bonus:</span>
                    <span className="text-purple-400">{revenue.empire_revenue.comprehensive_token_bonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">API Permissions:</span>
                    <span className="text-purple-400">{revenue.empire_revenue.api_permissions}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300">Transaction History</CardTitle>
          <CardDescription className="text-purple-400">
            Recent revenue transactions and their sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revenue.transactions.length === 0 ? (
            <Alert className="bg-black/40 border-purple-500/30">
              <AlertDescription className="text-purple-300">
                No transactions recorded yet. Execute webhooks to generate revenue.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-64 w-full">
              <div className="space-y-3">
                {revenue.transactions
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((transaction, index) => (
                    <Card key={index} className="bg-black/40 border-purple-500/20">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-semibold text-green-400">
                                {formatCurrency(transaction.amount)}
                              </span>
                              <Badge variant="outline" className="border-blue-400/50 text-blue-400 text-xs">
                                {transaction.source}
                              </Badge>
                            </div>
                            <div className="text-xs text-purple-400">
                              {formatTimestamp(transaction.timestamp)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Revenue Analytics */}
      <Card className="bg-black/60 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300">Revenue Analytics</CardTitle>
          <CardDescription className="text-purple-400">
            Revenue performance metrics and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-300">
                {revenue.transactions.length > 0 
                  ? formatCurrency(revenue.total / revenue.transactions.length)
                  : formatCurrency(0)
                }
              </div>
              <p className="text-sm text-purple-400">Average per Transaction</p>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-300">
                {revenue.transactions.length > 0 
                  ? Math.max(...revenue.transactions.map(t => t.amount)).toFixed(2)
                  : '0.00'
                }
              </div>
              <p className="text-sm text-purple-400">Highest Transaction</p>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-300">
                {revenue.transactions.length > 0 
                  ? new Set(revenue.transactions.map(t => t.source)).size
                  : 0
                }
              </div>
              <p className="text-sm text-purple-400">Unique Sources</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}