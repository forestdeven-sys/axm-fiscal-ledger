import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

/**
 * Plaid Client Configuration
 * 
 * Uses environment variables:
 * - PLAID_CLIENT_ID
 * - PLAID_SECRET
 * - PLAID_ENV (sandbox, development, production)
 */

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Default products to request
export const PLAID_PRODUCTS: Products[] = [
  Products.Transactions,
];

// Default country codes
export const PLAID_COUNTRY_CODES: CountryCode[] = [
  CountryCode.Us,
];

// Check if Plaid is configured
export function isPlaidConfigured(): boolean {
  return !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
}
