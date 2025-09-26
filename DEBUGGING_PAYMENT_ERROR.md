# 🔍 Debugging Payment Error - Step by Step Guide

The payment is still failing. Let's debug this systematically:

## 🔧 **Step 1: Check Browser Console**

Open your browser at `http://localhost:8082/subscription` and:

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Try to make a payment**
4. **Look for error messages** in the console

**Look for these specific errors:**
- `Subscription creation error:` - Database table issues
- `User not authenticated` - Authentication problems
- `Failed to create subscription` - General subscription errors
- Network errors (4xx, 5xx status codes)

## 🔧 **Step 2: Verify Database Tables Exist**

Go to your **Supabase Dashboard** → **Table Editor** and verify these tables exist:

✅ `subscription_plans`
✅ `user_subscriptions` 
✅ `payment_transactions`
✅ `feature_usage`
✅ `extension_licenses`

**If any are missing:**
1. Go to **SQL Editor**
2. Run the migration files I provided
3. Refresh the page

## 🔧 **Step 3: Check User Authentication**

In the browser console, run:
```javascript
// Check if user is signed in
console.log('User:', await window.supabase?.auth.getUser());
```

**If user is null:**
- Click "Sign In" in the top right
- Create an account or sign in
- Try payment again

## 🔧 **Step 4: Check Subscription Plans Loading**

In browser console:
```javascript
// Check if plans are loaded
console.log('Plans loaded:', window.subscriptionPlans);
```

**If plans are empty/null:**
- Database tables might not exist
- RLS policies might be blocking access

## 🔧 **Step 5: Test Direct Database Access**

In **Supabase Dashboard** → **SQL Editor**, run:
```sql
-- Check if subscription plans exist
SELECT * FROM public.subscription_plans;

-- Check if user_subscriptions table exists
SELECT * FROM public.user_subscriptions LIMIT 1;
```

**If these fail:**
- Tables don't exist - run the migration
- RLS is blocking - check policies

## 🔧 **Step 6: Check Environment Variables**

Verify these are set in your `.env` file:
```
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Check in browser console:**
```javascript
console.log('Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
```

## 🔧 **Step 7: Manual Migration (If Needed)**

If the migration didn't run, manually create the tables in **SQL Editor**:

```sql
-- First run: supabase/migrations/20250126000000_create_subscription_system.sql
-- Then run: supabase/migrations/20250126200000_create_extension_licenses_table.sql
```

## 📋 **Common Issues & Solutions:**

### Issue 1: "Table doesn't exist"
**Solution:** Run the database migrations in Supabase SQL Editor

### Issue 2: "User not authenticated" 
**Solution:** Sign in to the app before trying to pay

### Issue 3: "RLS policy violation"
**Solution:** Check if RLS policies were created correctly

### Issue 4: "Failed to create subscription"
**Solution:** Check browser console for detailed error message

### Issue 5: Razorpay not loading
**Solution:** Verify `VITE_RAZORPAY_KEY_ID` is set correctly

## 🎯 **Quick Test Steps:**

1. **Open browser console**
2. **Go to** `http://localhost:8082/subscription`
3. **Sign in** (if not already)
4. **Click "Upgrade to Pro"**
5. **Check console** for error messages
6. **Report the exact error** you see

---

**Tell me what specific error you see in the browser console, and I'll fix it immediately! 🔧**
