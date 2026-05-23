# Razorpay Payment Integration Setup Guide

## Steps to Enable Razorpay Payments

### 1. Create a Razorpay Account (FREE)
- Visit: https://razorpay.com
- Sign up for a FREE account
- Verify your email and phone

### 2. Get Your Test Keys
- Log in to your Razorpay Dashboard: https://dashboard.razorpay.com
- Click on "Settings" → "API Keys"
- You'll see two tabs: **Test** and **Live**
- Make sure you're on the **TEST** tab
- Copy your **Key ID** (starts with `rzp_test_`)

### 3. Configure Your Local Environment
1. Open the file: `e-comm-project/.env.local`
2. Replace `your_test_key_id_here` with your actual Razorpay Test Key ID
   ```
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_HERE
   ```
3. Save the file

### 4. Restart Your React Application
- Stop the React dev server (Ctrl+C)
- Run: `npm start`
- Wait for it to recompile

### 5. Test the Payment Flow

#### Using Test Card Details:
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: 12/25 (or any future date)
- **CVV**: 123 (any 3 digits)
- **Name**: Any name
- **Email**: Any email

#### Test Payment Results:
- **Successful Payment**: Complete the OTP
- **Failed Payment**: Use card 4000 0000 0000 0002
- **3D Secure**: Use card 4366 2050 3010 7005

### 6. After Payment
- You should see "PAYMENT SUCCESSFUL" page with:
  - Payment ID
  - Order ID
  - Amount Paid

## Troubleshooting

### Error: "Razorpay is not configured"
- Make sure `.env.local` file exists in the `e-comm-project` directory
- Verify the key starts with `rzp_test_`
- Restart the React app after making changes

### Error: "401 Unauthorized"
- Your Key ID is invalid or incorrect
- Double-check you copied the entire Key ID
- Make sure you're using TEST keys (not LIVE)

### Payment Modal Not Opening
- Check browser console for errors
- Ensure JavaScript is enabled
- Try a different browser or incognito mode

## Production Setup (DO NOT USE YET)

When you're ready for production:
1. Get LIVE keys from the LIVE tab in Razorpay Dashboard
2. Update environment variables with LIVE keys
3. Setup backend payment verification (for security)
4. Update Razorpay webhook configuration

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env.local` to git
- Only expose the Key ID (public key) in frontend code
- Never expose the Secret Key (private key) in frontend
- For production, implement backend payment verification

## Support

For more help:
- Razorpay Docs: https://razorpay.com/docs
- Razorpay Support: https://razorpay.com/support
