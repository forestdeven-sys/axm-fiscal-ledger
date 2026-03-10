import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/plaid/accounts
 * 
 * Returns all linked bank accounts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all PlaidItems with their accounts
    const plaidItems = await db.plaidItem.findMany({
      where: { userId: user.id },
      include: {
        accounts: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response
    const accounts = plaidItems.map(item => ({
      id: item.id,
      institution_name: item.institutionName,
      institution_id: item.institutionId,
      status: item.status,
      created_at: item.createdAt,
      accounts: item.accounts.map(acc => ({
        account_id: acc.id,
        plaid_account_id: acc.accountId,
        name: acc.name,
        official_name: acc.officialName,
        mask: acc.mask,
        type: acc.plaidAccountType,
        subtype: acc.plaidSubtype,
        current_balance: acc.currentBalance,
        available_balance: acc.availableBalance,
        currency: acc.currency,
        status: acc.status,
      })),
    }));

    return NextResponse.json({
      items: plaidItems.length,
      accounts,
    });
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({
      error: 'Failed to fetch accounts',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * DELETE /api/plaid/accounts
 * 
 * Removes a linked bank account (and optionally the Plaid item)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, accountId } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const plaidItem = await db.plaidItem.findFirst({
      where: {
        id: itemId,
        userId: user.id,
      },
      include: {
        accounts: true,
      },
    });

    if (!plaidItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // If specific accountId provided, only remove that account
    if (accountId) {
      await db.linkedAccount.delete({
        where: { id: accountId },
      });
    } else {
      // Remove all accounts and the item
      await db.linkedAccount.deleteMany({
        where: { plaidItemId: itemId },
      });
      await db.plaidItem.delete({
        where: { id: itemId },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Error removing account:', error);
    return NextResponse.json({
      error: 'Failed to remove account',
      message: error.message,
    }, { status: 500 });
  }
}
