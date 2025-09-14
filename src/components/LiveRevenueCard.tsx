"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EmpireStripeClient } from '@/lib/stripe-integration';

interface LiveRevenueCardProps {
  userId?: string;
  className?: string;
}

export function LiveRevenueCard({ userId, className }: LiveRevenueCardProps) {
  const [balance, setBalance] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [integrationStatus, setIntegrationStatus] = useState<{ available: boolean; message: string }>({
    available: false,
    message: 'Checking integration...'
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const stripeClient = new EmpireStripeClient();

  useEffect(() => {
    checkIntegration();
    loadRevenueData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadRevenueData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const checkIntegration = async () => {
    try {
      const status = await stripeClient.checkIntegrationStatus();
      setIntegrationStatus(status);
    } catch (error) {
      setIntegrationStatus({
        available: false,
        message: 'Integration check failed'
      });
    }
  };

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      
      // Load balance and metrics in parallel
      const [balanceData, metricsData] = await Promise.all([
        stripeClient.getLiveBalance(),
        stripeClient.getDashboardMetrics(userId)
      ]);

      setBalance(balanceData);
      setMetrics(metricsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !balance) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>💰 Live Revenue</CardTitle>
          <CardDescription>Loading real-time financial data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableBalance = balance?.available?.[0];
  const pendingBalance = balance?.pending?.[0];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              💰 Live Revenue
              {integrationStatus.available ? (
                <Badge variant="default" className="bg-green-500">LIVE</Badge>
              ) : (
                <Badge variant="outline">FALLBACK</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {integrationStatus.message}
              {lastUpdated && (
                <span className="block text-xs text-gray-500 mt-1">
                  Updated: {formatDate(lastUpdated)}
                </span>
              )}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadRevenueData}
            disabled={loading}
          >
            {loading ? "..." : "🔄"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Balance */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Available Balance</span>
            <Badge variant={integrationStatus.available ? "default" : "secondary"}>
              {integrationStatus.available ? "Stripe Live" : "Empire Data"}
            </Badge>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {availableBalance ? formatCurrency(availableBalance.amount, availableBalance.currency) : '$0.00'}
          </div>
          <p className="text-sm text-gray-500">
            Ready for payout to your bank account
          </p>
        </div>

        <Separator />

        {/* Pending Balance */}
        <div>
          <div className="text-sm font-medium text-gray-700">Pending Balance</div>
          <div className="text-xl font-semibold text-blue-600">
            {pendingBalance ? formatCurrency(pendingBalance.amount, pendingBalance.currency) : '$0.00'}
          </div>
          <p className="text-xs text-gray-500">
            Processing payments (available in 2-7 days)
          </p>
        </div>

        <Separator />

        {/* Revenue Metrics */}
        {metrics && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-800">Revenue Metrics</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Monthly Recurring</div>
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(metrics.monthlyRecurring * 100)}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500">Active Subscriptions</div>
                <div className="text-lg font-bold text-indigo-600">
                  {metrics.activeSubscriptions}
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500">Total Revenue</div>
              <div className="text-xl font-bold text-gray-800">
                {formatCurrency(metrics.totalRevenue * 100)}
              </div>
            </div>
          </div>
        )}

        {/* Recent Payments */}
        {metrics?.recentPayments && metrics.recentPayments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Recent Payments</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {metrics.recentPayments.slice(0, 3).map((payment: any, index: number) => (
                <div key={payment.id || `payment-${index}`} className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium truncate max-w-32">
                      {payment.description}
                    </div>
                    <div className="text-gray-500">
                      {new Date(payment.created).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(payment.amount * 100, payment.currency)}
                    </div>
                    <Badge 
                      variant={payment.status === 'succeeded' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Integration Actions */}
        <div className="space-y-2">
          {!integrationStatus.available && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              💡 Deploy Stripe integration for live payments
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadRevenueData}>
              Refresh Data
            </Button>
            {integrationStatus.available && (
              <Button variant="default" size="sm" onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
                Stripe Dashboard
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}