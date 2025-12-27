# Email Setup Guide

⚠️ **This guide is outdated. Please use [EMAIL_SETUP_NODEMAILER.md](./EMAIL_SETUP_NODEMAILER.md) instead.**

The application now uses **Nodemailer** instead of Resend. Nodemailer works with any SMTP server (Gmail, Outlook, SendGrid, etc.) and doesn't require domain verification.

## Quick Start

See [EMAIL_SETUP_NODEMAILER.md](./EMAIL_SETUP_NODEMAILER.md) for the complete setup guide.

---

## Old Resend Guide (Deprecated)

<details>
<summary>Click to view old Resend documentation</summary>

This guide explains how to set up email functionality for sending beautiful Tarot reading emails.

## Overview

The application uses [Resend](https://resend.com) to send beautifully formatted HTML emails containing Tarot readings. Users can send their readings to any email address from the reading detail pages.

## Setup Steps

### 1. Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key

1. Navigate to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "Oracle App")
4. Copy the API key (starts with `re_`)

### 3. Verify Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Follow the DNS setup instructions
4. Once verified, you can use emails like `noreply@yourdomain.com`

For development, you can use the default `onboarding@resend.dev` domain.

### 4. Add Environment Variables

Add these variables to your `.env` file (or Vercel environment variables):

```bash
# Resend API Key (required)
RESEND_API_KEY=re_your_api_key_here

# From email address (optional, defaults to onboarding@resend.dev)
# Use your verified domain for production
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 5. Vercel Setup

If deploying to Vercel:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - `RESEND_API_KEY` = your Resend API key
   - `RESEND_FROM_EMAIL` = your verified email (optional)

### 6. Test Email Sending

1. Start your development server: `pnpm dev`
2. Navigate to any reading detail page (`/readings/[id]` or `/readings/share/[token]`)
3. Enter an email address in the email form
4. Click "Send"
5. Check the recipient's inbox for the beautiful HTML email

## Email Features

- **Beautiful HTML Template**: Responsive design with mystical theme
- **Text Fallback**: Plain text version for email clients that don't support HTML
- **Localized Content**: Supports Russian and English
- **Card Information**: Includes selected Tarot cards if available
- **Share Link**: Includes shareable link if reading has a share token
- **Reader Information**: Shows which Tarot reader performed the reading

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Ensure `RESEND_API_KEY` is set correctly
2. **Check Console**: Look for error messages in server logs
3. **Resend Dashboard**: Check the Resend dashboard for delivery status
4. **Rate Limits**: Free tier has limits (100 emails/day)

### Email Goes to Spam

1. **Verify Domain**: Use a verified domain instead of `onboarding@resend.dev`
2. **SPF/DKIM**: Ensure DNS records are set up correctly
3. **Content**: Avoid spam trigger words in subject/content

### Development Testing

For development, you can:

- Use `onboarding@resend.dev` as the from address
- Send to your own email for testing
- Check Resend dashboard for delivery logs

## API Endpoints

- `POST /api/readings/[id]/email` - Send reading by ID (requires authentication)
- `POST /api/readings/share/[token]/email` - Send shared reading by token (public)

Both endpoints accept:

```json
{
  "email": "recipient@example.com",
  "locale": "ru" // or "en"
}
```

## Cost

- **Free Tier**: 100 emails/day, 3,000 emails/month
- **Pro Tier**: Starts at $20/month for higher limits
- See [Resend Pricing](https://resend.com/pricing) for details
