import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/payments/balance
 * Bridge endpoint to fetch live Stripe balance
 * Falls back to empire data if Stripe integration not available
 */
export async function GET() {
  try {
    // First, try to get balance from deployed Stripe worker
    const stripeWorkerUrl = process.env.STRIPE_WORKER_URL;
    
    if (stripeWorkerUrl) {
      try {
        const stripeResponse = await fetch(`${stripeWorkerUrl}/dashboard/balance`, {
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_WORKER_API_KEY || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (stripeResponse.ok) {
          const stripeData = await stripeResponse.json();
          return NextResponse.json({
            success: true,
            balance: stripeData.balance,
            source: 'stripe_live'
          });
        }
      } catch (stripeError) {
        console.warn('Stripe worker not available:', stripeError);
      }
    }
    
    // Fallback to existing empire endpoints
    try {
      const empireUrl = process.env.EMPIRE_WORKER_URL || 'https://consolidated-ai-voice-production.louiewong4.workers.dev';
      const empireResponse = await fetch(`${empireUrl}/analytics`);
      
      if (empireResponse.ok) {
        const empireData = await empireResponse.json();
        const revenueData = empireData.data?.revenue_tracking;
        
        if (revenueData) {
          // Convert empire revenue format to Stripe balance format
          const totalRevenue = parseFloat(revenueData.total_revenue?.replace('$', '') || '0');
          const dailyRevenue = parseFloat(revenueData.daily_revenue?.replace('$', '') || '0');
          
          return NextResponse.json({
            success: true,
            balance: {
              available: [{
                amount: Math.round(totalRevenue * 100), // Convert to cents
                currency: 'usd'
              }],
              pending: [{
                amount: Math.round(dailyRevenue * 100), // Pending daily revenue
                currency: 'usd'
              }]
            },
            source: 'empire_fallback'
          });
        }
      }
    } catch (empireError) {
      console.warn('Empire endpoint not available:', empireError);
    }
    
    // Final fallback - return zero balance
    return NextResponse.json({
      success: true,
      balance: {
        available: [{ amount: 0, currency: 'usd' }],
        pending: [{ amount: 0, currency: 'usd' }]
      },
      source: 'fallback_default'
    });
    
  } catch (error) {
    console.error('Balance API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch balance data',
      balance: {
        available: [{ amount: 0, currency: 'usd' }],
        pending: [{ amount: 0, currency: 'usd' }]
      }
    }, { status: 500 });
  }
}