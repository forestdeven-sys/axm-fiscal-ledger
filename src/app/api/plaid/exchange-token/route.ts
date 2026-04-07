import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { plaidClient, isPlaidConfigured } from '@/lib/plaid';
import { db } from '@/lib/db';

/**
 * POST /api/plaid/exchange-token
 * 
 * Exchanges a public token from Plaid Link for an access token
 * and creates a PlaidItem in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authUser = await getAuthUser();
    if (!authUser?.email) {
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
    const { publicToken, metadata } = body;

    if (!publicToken) {
      return NextResponse.json({ error: 'Public token required' }, { status: 400 });
    }

    // Exchange public token for access token
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get institution info
    let institutionName = 'Unknown Bank';
    let institutionId = metadata?.institution?.id;
    
    if (institutionId) {
      try {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: ['US'],
        });
        institutionName = instResponse.data.institution?.name || 'Unknown Bank';
      } catch (e) {
        console.warn('Could not fetch institution name:', e);
      }
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: authUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create PlaidItem in database
    const plaidItem = await db.plaidItem.create({
      data: {
        userId: user.id,
        itemId: itemId,
        accessToken: accessToken, // In production, encrypt this!
        institutionId: institutionId || null,
        institutionName: institutionName,
        status: 'active',
      },
    });

    // Fetch and save accounts
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    // Create LinkedAccount records
    for (const account of accountsResponse.data.accounts) {
      await db.linkedAccount.create({
        data: {
          plaidItemId: plaidItem.id,
          accountId: account.account_id,
          plaidAccountType: account.type || undefined,
          plaidSubtype: account.subtype || undefined,
          name: account.name,
          officialName: account.official_name || undefined,
          mask: account.mask || undefined,
          currentBalance: account.balances.current || undefined,
          availableBalance: account.balances.available || undefined,
          currency: account.balances.iso_currency_code || 'USD',
          lastUpdated: new Date(),
          status: 'active',
        },
      });
    }

    return NextResponse.json({
      success: true,
      item_id: itemId,
      institution_name: institutionName,
      accounts_count: accountsResponse.data.accounts.length,
    });
  } catch (error: any) {
    console.error('Error exchanging token:', error);
    
    if (error.response?.data?.error_code) {
      return NextResponse.json({
        error: error.response.data.error_code,
        message: error.response.data.error_message,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Failed to exchange token',
      message: error.message,
    }, { status: 500 });
  }
}
