# Transactions Admin Module

Complete admin interface for managing and reviewing gift transactions for the wedding registry.

## Features

### Transaction Dashboard
- **Real-time transaction feed** with automatic updates
- **Search functionality** to find transactions by guest name or gift name
- **Filter tabs**: All, Approved, Manual Review, Rejected
- **Visual status indicators** with color-coded badges
- **Time-ago formatting** for transaction timestamps
- **Payment method icons** (PayPhone, Bank Transfer Ecuador, Bank Transfer Mexico)

### Transaction Detail Modal
#### For Pending/Manual Review Transactions:
- **Receipt image viewer** with zoom/lightbox functionality
- **Editable amount** field for corrections
- **Transaction details**:
  - Guest name
  - Country/Currency
  - Payment method
  - Gift name
  - Guest message
- **Action buttons**:
  - ✅ Approve Transaction (green #4a5951)
  - ❌ Reject Transaction (malva #996678)
  - 🗑️ Delete Transaction

#### For Approved Transactions:
- Read-only view of all transaction details
- Approved status badge
- Delete option only

### Automatic Gift Updates
When a transaction is approved:
1. Transaction status changes to `APPROVED`
2. Gift's `collected_amount` increases by transaction amount
3. If `collected_amount >= total_amount`, gift status changes to `COMPLETED`
4. Otherwise, gift remains `AVAILABLE`

When a transaction is deleted:
1. If transaction was `APPROVED`, gift's `collected_amount` is decreased
2. Gift status is recalculated based on new collected amount

## Database Schema

The module uses the existing `gift_transactions` table with these key fields:

```sql
CREATE TABLE gift_transactions (
  id UUID PRIMARY KEY,
  gift_id UUID REFERENCES gifts(id),
  donor_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status transaction_status, -- 'PENDING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW'
  payment_method TEXT, -- 'payphone' | 'transfer_ec' | 'transfer_mx'
  country TEXT, -- 'EC' | 'MX'
  receipt_url TEXT, -- URL to receipt image
  message TEXT, -- Optional message from donor
  created_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
)
```

## Color Palette

Following the strict design guidelines:

- **Background**: `#fbf8f0` (Cream)
- **Primary/Approved**: `#4a5951` (Dark Green)
- **Pending/Review**: `#d3c3db` (Lavender)
- **Rejected/Error**: `#996678` (Malva)
- **Secondary Text**: `#807d7c` (Warm Gray)
- **Dark Text**: `#131514` (Almost Black)

## Components

### `/app/admin/transactions/page.tsx`
Main dashboard component with:
- Transaction list with cards
- Search bar
- Filter tabs
- Loading states
- Empty states

### `/components/admin/transactions/TransactionDetailSheet.tsx`
Bottom sheet modal for transaction details with:
- Receipt image viewer with zoom
- Form fields (editable for pending, read-only for approved)
- Action buttons (approve/reject for pending)
- Delete confirmation modal
- Automatic gift amount updates

## Usage

### Reviewing a Transaction
1. Open `/admin/transactions` in the admin panel
2. Transactions in "Revisión Manual" tab require review
3. Click on a transaction card to open details
4. Review the receipt image (zoom if needed)
5. Verify/edit the amount if necessary
6. Click "Aprobar Transacción" to approve or "Rechazar" to reject

### Searching Transactions
- Use the search bar to filter by guest name or gift name
- Search works across all filter tabs

### Managing Transactions
- **Approve**: Adds amount to gift's collected_amount
- **Reject**: Marks transaction as rejected (no gift update)
- **Delete**: Permanently removes transaction, reverses gift updates if approved

## Mobile-First Design

The module follows mobile-first principles:
- **Bottom sheet modals** for transaction details (iOS style)
- **Fixed header** with backdrop blur
- **Card-based layout** optimized for touch
- **Large tap targets** for buttons (h-14 = 56px)
- **Responsive typography** (text-xs to text-2xl)
- **Safe area handling** with pb-24 for bottom nav clearance

## Desktop Adaptations

While mobile-first, the design adapts gracefully to larger screens:
- Cards remain readable and touch-friendly
- Modal centers with max width
- Typography scales appropriately
- All interactions remain touch/mouse compatible

## Integration with Bottom Navigation

The transactions route is integrated into the admin bottom navigation:
- Icon: `receipt_long` (Material Symbols Outlined)
- Label: "Transacciones"
- Active state: Primary color (#4a5951)
- Inactive state: Gray (#807d7c)

## Error Handling

- **Network errors**: Caught and logged to console
- **Missing data**: Fallback to "Sin regalo" for missing gift names
- **Type safety**: TypeScript interfaces for all data structures
- **Supabase errors**: Proper error handling with user feedback

## Performance Considerations

- **Optimistic UI**: Transactions are fetched once and filtered client-side
- **Image optimization**: Next.js Image component for receipt display
- **Lazy loading**: Modal only renders when transaction is selected
- **Callback optimization**: useCallback for fetchTransactions and filterTransactions

## Notes for Future Enhancements

1. **Real-time updates**: Add Supabase real-time subscriptions for live transaction updates
2. **Bulk operations**: Add ability to approve/reject multiple transactions
3. **Export functionality**: Add CSV/PDF export of transactions
4. **Analytics**: Add transaction statistics and charts
5. **Email notifications**: Notify guests when their transaction is approved/rejected
6. **Receipt validation**: Integrate Gemini AI for automatic receipt validation
7. **Currency conversion**: Show amounts in multiple currencies
8. **Transaction history**: Add detailed audit log for each transaction

## Testing Checklist

- [ ] Can view all transactions
- [ ] Search filters transactions correctly
- [ ] Filter tabs work (All, Approved, Pending, Rejected)
- [ ] Can open transaction detail modal
- [ ] Receipt image displays correctly
- [ ] Zoom/lightbox works for receipt images
- [ ] Can approve pending transaction
- [ ] Gift amount updates after approval
- [ ] Can reject pending transaction
- [ ] Can delete transaction
- [ ] Delete reverses gift amount if approved
- [ ] Mobile responsive (iPhone, Android)
- [ ] Desktop responsive (laptop, desktop)
- [ ] Bottom navigation highlights correct tab
- [ ] Loading states display correctly
- [ ] Empty states display correctly
- [ ] Error states handled gracefully
