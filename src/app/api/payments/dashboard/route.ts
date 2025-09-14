import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/payments/dashboard
 * Comprehensive dashboard data combining Stripe and Empire metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Initialize response data
    let dashboardData = {
      metrics: {
        totalRevenue: 0,
        monthlyRecurringRevenue: 0,
        activeSubscriptions: 0
      },
      recentPayments: [] as any[],
      subscriptions: []
    };
    
    // Try Stripe worker first
    const stripeWorkerUrl = process.env.STRIPE_WORKER_URL;
    if (stripeWorkerUrl) {
      try {
        const stripeUrl = new URL(`${stripeWorkerUrl}/dashboard/data`);
        if (userId) stripeUrl.searchParams.set('userId', userId);
        
        const stripeResponse = await fetch(stripeUrl.toString(), {
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_WORKER_API_KEY || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (stripeResponse.ok) {
          const stripeData = await stripeResponse.json();
          dashboardData = stripeData.data;
          
          return NextResponse.json({
            success: true,
            data: dashboardData,
            source: 'stripe_live'
          });
        }
      } catch (stripeError) {
        console.warn('Stripe dashboard data not available:', stripeError);
      }
    }
    
    // Fallback to empire analytics
    try {
      const empireUrl = process.env.EMPIRE_WORKER_URL || 'https://consolidated-ai-voice-production.louiewong4.workers.dev';
      const [analyticsResponse, revenueResponse] = await Promise.all([
        fetch(`${empireUrl}/analytics`),
        fetch(`${empireUrl}/revenue`)
      ]);
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        const revenueTracking = analyticsData.data?.revenue_tracking;
        const empireMetrics = analyticsData.data?.empire_metrics;
        
        if (revenueTracking) {
          // Transform empire data to dashboard format
          dashboardData.metrics.totalRevenue = parseFloat(revenueTracking.total_revenue?.replace('$', '') || '0');
          dashboardData.metrics.monthlyRecurringRevenue = parseFloat(revenueTracking.monthly_projection?.replace('$', '') || '0');
          dashboardData.metrics.activeSubscriptions = empireMetrics?.active_sessions || 0;
          
          // Create simulated recent payments from empire metrics
          if (revenueTracking.daily_revenue) {
            const dailyAmount = parseFloat(revenueTracking.daily_revenue.replace('$', ''));
            dashboardData.recentPayments = [
              {
                id: `empire_daily_${Date.now()}`,
                amount: dailyAmount * 100, // Convert to cents
                currency: 'usd',
                description: 'Empire AI Daily Revenue',
                created: Date.now() - 86400000, // 24 hours ago
                status: 'succeeded'
              }
            ];
          }
        }
      }
      
      // Also try to get additional revenue data
      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        if (revenueData.empire_revenue) {
          dashboardData.metrics.monthlyRecurringRevenue = parseFloat(revenueData.empire_revenue.maximum_per_command) * 30 || dashboardData.metrics.monthlyRecurringRevenue;
        }
      }
      
    } catch (empireError) {
      console.warn('Empire analytics not available:', empireError);
    }
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      source: 'empire_fallback'
    });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      data: {
        metrics: { totalRevenue: 0, monthlyRecurringRevenue: 0, activeSubscriptions: 0 },
        recentPayments: [],
        subscriptions: []
      }
    }, { status: 500 });
  }
}