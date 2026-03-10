# Resume Builder

## Current State
Fully functional resume builder with Stripe checkout integration. The backend has `setStripeConfiguration` (admin-only) and `createCheckoutSession` / `getStripeSessionStatus` endpoints. The frontend has an UpgradeDialog that launches Stripe checkout at $9.99 one-time. There is no UI for the admin to enter their Stripe secret key.

## Requested Changes (Diff)

### Add
- Admin Settings page accessible from the header when user is an admin
- Settings form with fields: Stripe Secret Key (password input) and Allowed Countries (comma-separated, default "US")
- Save button that calls `setStripeConfiguration`
- Shows current Stripe configured status (calls `isStripeConfigured`)
- Route `/settings` added to App.tsx

### Modify
- Header: add a Settings link/icon that only appears when the logged-in user `isCallerAdmin` returns true
- App.tsx: add `settings` view to AppView type and route parsing

### Remove
- Nothing

## Implementation Plan
1. Add `settings` to `AppView` type in App.tsx and route parsing for `#/settings`
2. Create `src/frontend/src/pages/Settings.tsx` with the admin settings form
3. Update `Header.tsx` to check `isCallerAdmin` and show a Settings icon/link for admins
4. Wire up `Settings` page in `App.tsx`
