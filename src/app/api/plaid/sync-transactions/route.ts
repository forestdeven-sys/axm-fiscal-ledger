import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { plaidClient, isPlaidConfigured } from '@/lib/plaid';
import { db } from '@/lib/db';

/**
 * POST /api/plaid/sync-transactions
 * 
 * Fetches new transactions from Plaid and imports them into the database
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

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: authUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all PlaidItems for the user
    const plaidItems = await db.plaidItem.findMany({
      where: { userId: user.id, status: 'active' },
      include: {
        accounts: true,
      },
    });

    if (plaidItems.length === 0) {
      return NextResponse.json({ 
        message: 'No linked accounts found',
        transactions_imported: 0,
      });
    }

    let totalImported = 0;
    let totalSkipped = 0;

    // Sync transactions for each PlaidItem
    for (const item of plaidItems) {
      try {
        // Get transactions since last cursor (or last 30 days)
        const cursor = item.cursor || undefined;
        
        const response = await plaidClient.transactionsSync({
          access_token: item.accessToken,
          cursor: cursor,
        });

        const added = response.data.added;
        const modified = response.data.modified;
        const removed = response.data.removed;
        const nextCursor = response.data.next_cursor;
        const hasMore = response.data.has_more;

        // Process added transactions
        for (const txn of added) {
          // Find matching linked account
          const linkedAccount = item.accounts.find(
            acc => acc.accountId === txn.account_id
          );

          if (!linkedAccount) continue;

          // Generate unique external ID for deduplication
          const externalId = `${txn.transaction_id}-${txn.date}`;

          // Check if transaction already exists
          const existing = await db.transaction.findUnique({
            where: { externalId },
          });

          if (existing) {
            totalSkipped++;
            continue;
          }

          // Determine transaction type
          let type = 'Purchase';
          if (txn.amount < 0) {
            type = 'Refund';
          } else if (txn.pending) {
            type = 'Pending';
          }

          // Create transaction in database
          await db.transaction.create({
            data: {
              userId: user.id,
              transactionDate: new Date(txn.date),
              description: txn.name,
              merchant: txn.merchant_name || txn.name,
              category: txn.category?.[0] || 'Uncategorized',
              type,
              amount: Math.abs(txn.amount),
              currency: txn.iso_currency_code || 'USD',
              source: 'plaid',
              sourceFile: linkedAccount.name,
              externalId,
              notes: `Imported from ${linkedAccount.name} (${linkedAccount.mask || 'unknown'})`,
            },
          });

          totalImported++;
        }

        // Update cursor for next sync
        await db.plaidItem.update({
          where: { id: item.id },
          data: {
            cursor: nextCursor,
            statusLastCheck: new Date(),
          },
        });

      } catch (itemError: any) {
        console.error(`Error syncing item ${item.id}:`, itemError);
        
        // If token is invalid, mark item as error
        if (itemError.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
          await db.plaidItem.update({
            where: { id: item.id },
            data: { status: 'error' },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      transactions_imported: totalImported,
      transactions_skipped: totalSkipped,
    });
  } catch (error: any) {
    console.error('Error syncing transactions:', error);
    return NextResponse.json({
      error: 'Failed to sync transactions',
      message: error.message,
    }, { status: 500 });
  }
}
