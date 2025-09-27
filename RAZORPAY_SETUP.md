# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment integration for the CyberCop Safe Space subscription system.

## Prerequisites

1. A Razorpay account (sign up at https://razorpay.com/)
2. Access to the Razorpay Dashboard

## Setup Steps

### 1. Get Your Test API Keys

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **API Keys**
3. Switch to **Test Mode** (toggle at the top of the page)
4. Generate test API keys if you haven't already
5. You'll get:
   - **Key ID**: Starts with `rzp_test_`
   - **Key Secret**: Keep this secure

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env` if you haven't already:
   ```bash
   cp .env.example .env
   ```

2. Add your Razorpay test keys to `.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key_here
   VITE_RAZORPAY_KEY_SECRET=your_secret_key_here
   ```

   > ⚠️ **Important**: Never commit your `.env` file to version control!

### 3. Database Setup

Run the SQL script to ensure all subscription tables are created:

```sql
-- Run this in your Supabase SQL editor
-- The script is available in: check_subscription_system.sql
```

### 4. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the subscription test page:
   ```
   http://localhost:5173/subscription-test
   ```

3. Follow the on-screen instructions to test:
   - Free subscription creation
   - Razorpay payment flow (Pro plan)

## Test Cards for Razorpay

Use these test cards in test mode:

### Successful Payment
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name

### Failed Payment
- **Card Number**: 4111 1111 1111 1234
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Other Test Cards
- **Visa**: 4012 8888 8888 1881
- **Mastercard**: 5267 3181 8797 5449

## Integration Flow

1. **User clicks upgrade** → Initiates subscription upgrade
2. **Razorpay modal opens** → User enters payment details
3. **Payment processed** → Razorpay returns payment ID
4. **Subscription created** → Database record created
5. **User redirected** → Pro dashboard access granted

## Troubleshooting

### Common Issues

1. **"Razorpay is not defined"**
   - Ensure the Razorpay script is loaded
   - Check browser console for errors

2. **"Invalid API Key"**
   - Verify your key starts with `rzp_test_` for test mode
   - Check for typos in the environment variable

3. **Payment fails**
   - Ensure you're using test cards in test mode
   - Check Razorpay dashboard for error details

4. **Subscription not created after payment**
   - Check Supabase logs for errors
   - Verify database permissions (RLS policies)

### Debugging Steps

1. Check browser console for JavaScript errors
2. Check network tab for failed API calls
3. Review Supabase logs for database errors
4. Check Razorpay dashboard for payment logs

## Production Deployment

Before going to production:

1. Switch to live API keys in Razorpay dashboard
2. Update environment variables with live keys
3. Test with small amounts first
4. Implement webhook handling for payment verification
5. Add proper error handling and logging

## Security Considerations

1. **Never expose secret keys** in client-side code
2. **Verify payments** on the server side
3. **Implement webhooks** for payment confirmation
4. **Use HTTPS** in production
5. **Enable 2FA** on your Razorpay account

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/
- Test Payment Flow: https://razorpay.com/docs/payments/test-card-details/

## Next Steps

1. Test the complete subscription flow
2. Implement webhook handlers for production
3. Add subscription management features (cancel, upgrade, downgrade)
4. Implement usage tracking for feature limits
