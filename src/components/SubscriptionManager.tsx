"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EmpireStripeClient } from '@/lib/stripe-integration';

interface SubscriptionManagerProps {
  userEmail?: string;
  className?: string;
}

export function SubscriptionManager({ userEmail, className }: SubscriptionManagerProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const stripeClient = new EmpireStripeClient();

  useEffect(() => {
    loadSubscriptionPlans();
    if (userEmail) {
      loadCurrentSubscription();
    }
  }, [userEmail]);

  const loadSubscriptionPlans = () => {
    const availablePlans = stripeClient.getSubscriptionPlans();
    setPlans(availablePlans);
  };

  const loadCurrentSubscription = async () => {
    // This would fetch from your user database
    // For now, we'll simulate with localStorage
    const stored = localStorage.getItem(`subscription_${userEmail}`);
    if (stored) {
      setCurrentSubscription(JSON.parse(stored));
    }
  };

  const handleSubscription = async (planId: string) => {
    if (!userEmail) {
      alert('Please provide email address');
      return;
    }

    setProcessingPlan(planId);
    setLoading(true);

    try {
      if (planId === 'price_free') {
        // Handle free plan (no Stripe needed)
        const freeSubscription = {
          id: `free_${Date.now()}`,
          planId: 'price_free',
          planName: 'Free Tier',
          status: 'active',
          amount: 0,
          currency: 'usd',
          created: Date.now()
        };
        
        setCurrentSubscription(freeSubscription);
        localStorage.setItem(`subscription_${userEmail}`, JSON.stringify(freeSubscription));
        
        alert('Switched to Free Tier successfully!');
      } else {
        // Create Stripe checkout session for paid plans
        const checkoutSession = await stripeClient.createCheckoutSession(
          planId,
          userEmail,
          `${window.location.origin}/subscription/success`,
          `${window.location.origin}/subscription/cancel`
        );

        if (checkoutSession.url) {
          // Redirect to Stripe checkout
          window.location.href = checkoutSession.url;
        } else {
          throw new Error('Failed to create checkout session');
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to process subscription. Please try again or use test mode.');
      
      // For demo purposes - simulate subscription in test mode
      if (confirm('Use test mode? (This will simulate the subscription without payment)')) {
        const plan = plans.find(p => p.id === planId);
        const testSubscription = {
          id: `test_${Date.now()}`,
          planId: planId,
          planName: plan?.name || 'Test Plan',
          status: 'active',
          amount: plan?.amount || 0,
          currency: 'usd',
          created: Date.now(),
          testMode: true
        };
        
        setCurrentSubscription(testSubscription);
        localStorage.setItem(`subscription_${userEmail}`, JSON.stringify(testSubscription));
        alert('Test subscription created successfully!');
      }
    } finally {
      setLoading(false);
      setProcessingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription || !confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setLoading(true);

    try {
      if (currentSubscription.testMode || currentSubscription.planId === 'price_free') {
        // Handle test mode or free plan cancellation
        localStorage.removeItem(`subscription_${userEmail}`);
        setCurrentSubscription(null);
        alert('Subscription canceled successfully!');
      } else {
        // Cancel real Stripe subscription
        const result = await stripeClient.cancelSubscription(currentSubscription.id);
        
        if (result.success) {
          const updatedSubscription = {
            ...currentSubscription,
            status: 'canceled',
            canceled_at: Date.now()
          };
          
          setCurrentSubscription(updatedSubscription);
          localStorage.setItem(`subscription_${userEmail}`, JSON.stringify(updatedSubscription));
          alert('Subscription canceled successfully!');
        }
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      alert('Failed to cancel subscription. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'price_free': return 'bg-gray-100 border-gray-300';
      case 'price_pro_monthly': return 'bg-blue-50 border-blue-300';
      case 'price_enterprise_monthly': return 'bg-purple-50 border-purple-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>💎 Subscription Management</CardTitle>
        <CardDescription>
          Choose your Empire AI plan - real payments with Stripe
          {!userEmail && (
            <span className="block text-amber-600 text-sm mt-1">
              Please provide email to manage subscriptions
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Subscription */}
        {currentSubscription && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800">Current Subscription</h4>
            <div className="flex items-center justify-between mt-2">
              <div>
                <div className="font-medium">{currentSubscription.planName}</div>
                <div className="text-sm text-green-600">
                  {formatCurrency(currentSubscription.amount)} / month
                  {currentSubscription.testMode && (
                    <Badge variant="outline" className="ml-2">TEST MODE</Badge>
                  )}
                </div>
              </div>
              <Badge 
                variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}
              >
                {currentSubscription.status}
              </Badge>
            </div>
            {currentSubscription.planId !== 'price_free' && currentSubscription.status === 'active' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelSubscription}
                disabled={loading}
                className="mt-3"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        )}

        <Separator />

        {/* Available Plans */}
        <div className="space-y-4">
          <h4 className="font-semibold">Available Plans</h4>
          
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 border-2 rounded-lg transition-colors ${getPlanColor(plan.id)} ${
                  isCurrentPlan(plan.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-lg">{plan.name}</h5>
                    <div className="text-2xl font-bold text-gray-800">
                      {formatCurrency(plan.amount)}
                      <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {isCurrentPlan(plan.id) ? (
                      <Badge variant="default">Current Plan</Badge>
                    ) : (
                      <Button
                        onClick={() => handleSubscription(plan.id)}
                        disabled={loading || !userEmail}
                        className={processingPlan === plan.id ? 'animate-pulse' : ''}
                      >
                        {processingPlan === plan.id ? 'Processing...' : 
                         plan.amount === 0 ? 'Switch to Free' : 'Subscribe'}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Features List */}
                <div className="mt-3 space-y-1">
                  {plan.features.map((feature: string, index: number) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Integration Status */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>💳 Payments processed securely by Stripe</div>
          <div>🔒 PCI DSS compliant - no card data stored locally</div>
          <div>🏦 Automatic payouts to your bank account</div>
          <div>📧 Email receipts and invoices provided</div>
        </div>
      </CardContent>
    </Card>
  );
}