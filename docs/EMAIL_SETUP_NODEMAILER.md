# Email Setup Guide (Nodemailer)

This guide explains how to set up email functionality using Nodemailer, which works with any SMTP server.

## Overview

The application uses [Nodemailer](https://nodemailer.com/) to send beautifully formatted HTML emails containing Tarot readings. Nodemailer supports any SMTP server, including Gmail, Outlook, SendGrid, Mailgun, and custom SMTP servers.

## Advantages of Nodemailer

- ✅ Works with any SMTP server
- ✅ No domain verification required (depends on SMTP provider)
- ✅ More flexible configuration
- ✅ Free to use (only pay for SMTP service if needed)
- ✅ Better for self-hosted solutions

## Setup Steps

### 1. Choose SMTP Provider

You can use any of these popular options:

#### Option A: Gmail (Free, Easy Setup) ⭐ Recommended for Testing

**Pros:**

- Free
- Easy setup
- Reliable delivery

**Cons:**

- Requires "App Password" (not regular password)
- Daily sending limits (500 emails/day for free accounts)
- Emails show "via gmail.com"

**Setup:**

1. Enable 2-Step Verification in your Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use these settings:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_FROM_NAME=Oracle - Tarot Reading
   ```

#### Option B: Outlook/Hotmail (Free)

**Setup:**

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=your-email@outlook.com
SMTP_FROM_NAME=Oracle - Tarot Reading
```

#### Option C: SendGrid (Free Tier: 100 emails/day)

**Setup:**

1. Sign up at https://sendgrid.com
2. Create API Key
3. Use SMTP settings:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   SMTP_FROM_EMAIL=noreply@yourdomain.com
   SMTP_FROM_NAME=Oracle - Tarot Reading
   ```

#### Option D: Mailgun (Free Tier: 5,000 emails/month)

**Setup:**

1. Sign up at https://mailgun.com
2. Verify domain or use sandbox domain
3. Use SMTP settings:
   ```bash
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-mailgun-smtp-username
   SMTP_PASSWORD=your-mailgun-smtp-password
   SMTP_FROM_EMAIL=noreply@yourdomain.com
   SMTP_FROM_NAME=Oracle - Tarot Reading
   ```

#### Option E: Custom SMTP Server

If you have your own SMTP server:

```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Oracle - Tarot Reading
```

### 2. Add Environment Variables

Add these variables to your `.env` file (or Vercel environment variables):

```bash
# SMTP Configuration (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-or-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Oracle - Tarot Reading
```

**Environment Variables Explained:**

- `SMTP_HOST` - SMTP server hostname (required)
- `SMTP_PORT` - SMTP port (usually 587 for TLS, 465 for SSL) (required)
- `SMTP_SECURE` - Use SSL (true for port 465, false for port 587) (optional, default: false)
- `SMTP_USER` - SMTP username/email (required)
- `SMTP_PASSWORD` - SMTP password or app password (required)
- `SMTP_FROM_EMAIL` - Email address to send from (optional, defaults to SMTP_USER)
- `SMTP_FROM_NAME` - Display name for sender (optional, default: "Oracle - Tarot Reading")

### 3. Vercel Setup

If deploying to Vercel:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add all SMTP variables listed above

### 4. Test Email Sending

1. Start your development server: `pnpm dev`
2. Navigate to any reading detail page (`/readings/[id]` or `/readings/share/[token]`)
3. Enter an email address in the email form
4. Click "Send"
5. Check the recipient's inbox for the beautiful HTML email

## Quick Start: Gmail Setup

**Fastest way to get started:**

1. **Enable 2-Step Verification:**

   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**

   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Oracle App"
   - Copy the 16-character password

3. **Add to `.env`:**

   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_FROM_NAME=Oracle - Tarot Reading
   ```

4. **Restart server and test!**

## Email Features

- **Beautiful HTML Template**: Responsive design with mystical theme
- **Text Fallback**: Plain text version for email clients that don't support HTML
- **Localized Content**: Supports Russian and English
- **Card Information**: Includes selected Tarot cards if available
- **Share Link**: Includes shareable link if reading has a share token
- **Reader Information**: Shows which Tarot reader performed the reading

## Troubleshooting

### Email Not Sending

1. **Check SMTP Settings**: Verify all environment variables are set correctly
2. **Check Console**: Look for error messages in server logs
3. **Test SMTP Connection**: Use a tool like [Mail Tester](https://www.mail-tester.com/)
4. **Gmail App Password**: Make sure you're using App Password, not regular password
5. **Firewall/Network**: Some networks block SMTP ports

### Gmail Specific Issues

**"Less secure app access" error:**

- Use App Password instead of regular password
- Enable 2-Step Verification first

**"Username and Password not accepted":**

- Make sure you're using App Password (16 characters, may have spaces)
- Remove spaces from App Password in `.env` file

### Email Goes to Spam

1. **Use Verified Domain**: Use a custom domain with proper SPF/DKIM records
2. **Content**: Avoid spam trigger words
3. **Sender Reputation**: Use a reputable SMTP provider
4. **Warm Up**: Gradually increase sending volume

### Port Issues

- **Port 587**: Use with `SMTP_SECURE=false` (TLS)
- **Port 465**: Use with `SMTP_SECURE=true` (SSL)
- **Port 25**: Usually blocked by ISPs, not recommended

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

## Cost Comparison

| Provider    | Free Tier           | Paid Plans                |
| ----------- | ------------------- | ------------------------- |
| Gmail       | 500 emails/day      | N/A (personal use)        |
| Outlook     | 300 emails/day      | N/A (personal use)        |
| SendGrid    | 100 emails/day      | $19.95/month (50k emails) |
| Mailgun     | 5,000 emails/month  | $35/month (50k emails)    |
| Custom SMTP | Depends on provider | Varies                    |

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use App Passwords** for Gmail instead of regular passwords
3. **Use environment variables** in production
4. **Enable TLS/SSL** (`SMTP_SECURE=true` for port 465)
5. **Rotate passwords** regularly
6. **Use dedicated email** for sending (not personal email)

## Production Recommendations

For production, consider:

1. **Dedicated SMTP Service**: Use SendGrid, Mailgun, or similar
2. **Custom Domain**: Set up SPF/DKIM records for better deliverability
3. **Monitoring**: Set up email delivery monitoring
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Error Handling**: Log email failures for debugging

## Migration from Resend

If you were using Resend before:

1. Remove `RESEND_API_KEY` and `RESEND_FROM_EMAIL` from `.env`
2. Add SMTP configuration variables (see above)
3. Restart your server
4. Test email sending

No code changes needed - the migration is complete!
