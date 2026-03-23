import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { plaidClient, PLAID_PRODUCTS, PLAID_COUNTRY_CODES, isPlaidConfigured } from '@/lib/plaid';

/**
 * POST /api/plaid/create-link-token
 * 
 * Creates a Plaid Link token for initializing the Plaid Link component
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Plaid is configured
    if (!isPlaidConfigured()) {
      return NextResponse.json({ 
        error: 'Plaid not configured',
        message: 'Please add your Plaid API keys to .env file'
      }, { status: 400 });
    }

    const body = await request.json();
    const { redirectUri } = body;

    // Create link token request
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: (session.user as any).id || session.user.email || 'anonymous',
      },
      client_name: 'Axiom Finance',
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
      redirect_uri: redirectUri,
    });

    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    });
  } catch (error: any) {
    console.error('Error creating link token:', error);
    
    if (error.response?.data?.error_code) {
      return NextResponse.json({
        error: error.response.data.error_code,
        message: error.response.data.error_message,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Failed to create link token',
      message: error.message,
    }, { status: 500 });
  }
}
