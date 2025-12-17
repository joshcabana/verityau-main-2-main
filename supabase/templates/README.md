# Verity Email Templates

Custom branded email templates for Supabase Auth.

## Templates

1. **email-confirmation.html** - Email verification for new signups
2. **password-reset.html** - Password reset requests
3. **welcome-email.html** - Welcome message after email confirmation (optional)

## Configuration

### Supabase Dashboard Setup

1. Go to **Authentication > Email Templates** in your Supabase dashboard
2. For each template type, replace the default with the corresponding HTML file:

#### Confirm signup template
- Copy contents of `email-confirmation.html`
- Supabase variable: `{{ .ConfirmationURL }}`

#### Reset password template
- Copy contents of `password-reset.html`  
- Supabase variable: `{{ .ConfirmationURL }}`

#### Magic Link template (if using)
- Can reuse `email-confirmation.html` with minor modifications
- Supabase variable: `{{ .ConfirmationURL }}`

### Variables Available

Supabase provides these template variables:
- `{{ .ConfirmationURL }}` - Confirmation/reset link
- `{{ .Token }}` - Verification token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL from auth settings

### Testing

1. Create a test account
2. Request password reset
3. Verify emails render correctly in:
   - Gmail (webmail & app)
   - Apple Mail
   - Outlook
   - Mobile devices

### Email Service Configuration

Ensure SMTP is configured in Supabase:
- Go to **Project Settings > Auth**
- Configure SMTP or use Supabase's default (max 4 emails/hour in free tier)
- For production, use a service like:
  - SendGrid
  - AWS SES
  - Postmark
  - Resend

### Branding

Current colors (update in templates if needed):
- Primary gradient: `#FF6B6B` to `#FF8E53`
- Background: `#0A0A0A`
- Card background: `#1A1A1A`
- Text: `#FFFFFF` / `#D1D5DB`

### Accessibility

- ✅ Semantic HTML
- ✅ Alt text for images
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Readable font sizes (minimum 13px)
- ✅ Mobile responsive design

## Production Checklist

- [ ] Update domain from `getverity.com.au` to production domain
- [ ] Configure SMTP with production email service
- [ ] Test all email flows (signup, reset, magic link)
- [ ] Verify SPF, DKIM, DMARC records for email deliverability
- [ ] Set up email analytics/tracking (optional)
- [ ] Monitor bounce/complaint rates
- [ ] Add unsubscribe link for marketing emails (not required for transactional)

## Support

For email-related issues:
- Check Supabase logs: **Authentication > Logs**
- Verify SMTP settings
- Test email deliverability with mail-tester.com
- Contact: support@getverity.com.au
