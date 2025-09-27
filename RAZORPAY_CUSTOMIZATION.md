# Razorpay Checkout Customization Guide

This guide explains how to customize the appearance of the Razorpay payment checkout modal.

## Current Configuration

The Razorpay checkout options are configured in `src/services/paymentService.ts` in the `initializeRazorpayPayment` method.

## Customization Options

### 1. Logo/Image

The logo appears at the top of the checkout modal.

```typescript
image: 'https://your-logo-url.com/logo.png',
// or for local files in public directory
image: '/logo.png',
```

**Requirements:**
- Recommended size: 128x128px minimum
- Supported formats: PNG, JPG, SVG
- Must be HTTPS URL or relative path

### 2. Brand Name

```typescript
name: 'CyberCop Safe Space',
```

This appears as the merchant name in the checkout.

### 3. Theme Color

```typescript
theme: {
  color: '#3b82f6'  // Your brand color in hex
}
```

This colors the buttons and highlights in the checkout modal.

### 4. Description

```typescript
description: `${plan.name} - ${options.billingCycle} subscription`,
```

Brief description of what the customer is paying for.

## How to Change the Logo

### Option 1: Use External URL (Recommended)

1. Host your logo on a CDN or image hosting service
2. Update the image URL in `paymentService.ts`:

```typescript
image: 'https://your-cdn.com/your-logo.png',
```

### Option 2: Use Local File

1. Add your logo to the `public` directory:
   ```
   public/
   └── logo.png  (your logo file)
   ```

2. Update the image path:
   ```typescript
   image: '/logo.png',
   ```

### Option 3: Use Base64 Encoded Image

1. Convert your image to base64
2. Use it directly:
   ```typescript
   image: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
   ```

## Complete Customization Example

```typescript
const razorpayOptions = {
  key: this.razorpayKeyId,
  amount: amountInPaise,
  currency: 'INR',
  name: 'CyberCop Safe Space',
  description: `${plan.name} - ${options.billingCycle} subscription`,
  image: 'https://your-domain.com/logo.png',
  prefill: {
    name: userName,
    email: userEmail,
    contact: userPhone  // Optional
  },
  theme: {
    color: '#3b82f6',
    backdrop_color: 'rgba(0, 0, 0, 0.8)'  // Modal backdrop
  },
  notes: {  // Additional metadata
    plan_id: plan.id,
    billing_cycle: options.billingCycle
  },
  modal: {
    ondismiss: () => {
      // Handle modal close
    },
    animation: true,  // Enable/disable animations
    confirm_close: true  // Ask confirmation before closing
  }
};
```

## Additional Customization Options

### 1. Prefill Customer Information
```typescript
prefill: {
  name: 'John Doe',
  email: 'john@example.com',
  contact: '+919999999999'
}
```

### 2. Payment Methods
```typescript
config: {
  display: {
    blocks: {
      banks: {
        name: 'Most Used Methods',
        instruments: [
          { method: 'wallet', wallets: ['freecharge'] },
          { method: 'upi' }
        ]
      }
    },
    sequence: ['block.banks'],
    preferences: {
      show_default_blocks: true
    }
  }
}
```

### 3. Remember Customer
```typescript
remember_customer: true  // Save customer details for future
```

## Testing Your Changes

1. Make changes to `src/services/paymentService.ts`
2. Save the file
3. Test the payment flow at `/subscription-test`
4. The checkout modal should show your customizations

## Best Practices

1. **Logo Quality**: Use high-resolution logos (at least 128x128px)
2. **Brand Colors**: Use your brand's primary color for the theme
3. **Clear Description**: Make it clear what the customer is paying for
4. **Test Thoroughly**: Always test with test cards before production

## Troubleshooting

### Logo Not Showing
- Ensure the URL is accessible (HTTPS required)
- Check browser console for 404 errors
- Verify image format is supported

### Theme Color Not Applied
- Use valid hex color codes
- Some elements may not be customizable

### Checkout Not Opening
- Check browser console for errors
- Verify Razorpay script is loaded
- Ensure API key is correct

## Resources

- [Razorpay Checkout Options](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration#12-checkout-options)
- [Razorpay Branding Guidelines](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/checkout-options/)
- [Image Optimization Tools](https://tinypng.com/) for logo compression
