# Migration: Remove Unused Transaction Columns

## Description
This migration removes two unused columns from the `gift_transactions` table:
- `external_transaction_id`
- `payment_url`

These columns were not being used in the application and are being removed to clean up the database schema.

## Files Changed
- `supabase/remove-unused-transaction-columns.sql` - Migration script
- `supabase/crowdfunding-schema.sql` - Updated schema definition
- `supabase/sample-crowdfunding-data.sql` - Updated sample data comments

## How to Apply

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste the contents of `supabase/remove-unused-transaction-columns.sql`
6. Click **Run**

### Option 2: Using Supabase CLI
```bash
supabase db push
```

If you don't have the CLI installed, install it first:
```bash
npm install -g supabase
```

## After Migration
Once the migration is applied, regenerate the TypeScript types:
```bash
npm run generate-types
```

This will update `lib/database.types.ts` to remove the unused columns from the type definitions.

## Rollback (if needed)
If you need to revert this change, you can add the columns back:
```sql
ALTER TABLE gift_transactions 
ADD COLUMN external_transaction_id TEXT,
ADD COLUMN payment_url TEXT;

CREATE INDEX idx_gift_transactions_external_id ON gift_transactions(external_transaction_id);
```
