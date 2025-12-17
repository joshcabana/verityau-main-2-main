# Verity Beta Launch Checklist - getverity.com.au

## ✅ Completed Features

### 1. Email Verification ✅
- **File**: `src/pages/VerifyEmail.tsx`
- **Integration**: `src/hooks/useAuth.tsx`, `src/App.tsx`
- Users must verify email before accessing the app
- Resend verification with 60s cooldown
- Auto-redirect on verification

### 2. Rate Limiting ✅
- **Edge Function**: `supabase/functions/check-rate-limit/index.ts`
- **Client Util**: `src/utils/rateLimit.ts`
- **Integration**: `src/utils/matchmaking.ts`, `src/pages/Chat.tsx`
- **Database**: `supabase/migrations/20251124100000_add_rate_limiting.sql`
- 5 likes per minute
- 5 messages per minute
- Dual-layer (client + server)

### 3. Photo Moderation ✅
- **Edge Function**: `supabase/functions/moderate-photo/index.ts`
- **Integration**: `src/utils/profileCreation.ts`
- AWS Rekognition detects inappropriate content
- Auto-rejects flagged photos
- Fallback: fail open for beta (allows if moderation unavailable)

### 4. Daily.co Video Dates ✅
- **Edge Function**: `supabase/functions/create-daily-room/index.ts`
- **Helper**: `src/utils/verityDateHelpers.ts` (`acceptVerityDate()`)
- **Component**: `src/pages/VerityDateCall.tsx`
- 10-minute video dates
- Auto-end with redirect to feedback
- Icebreaker prompts every 60s
- Report functionality

---

## 🚀 Pre-Launch Deployment Steps

### Step 1: Environment Variables (Supabase)
```bash
# Required for all edge functions
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For create-daily-room function
DAILY_API_KEY=your_daily_api_key

# For moderate-photo function
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

### Step 2: Deploy Edge Functions
```bash
# Deploy rate limiting
supabase functions deploy check-rate-limit

# Deploy photo moderation
supabase functions deploy moderate-photo

# Deploy Daily.co room creation
supabase functions deploy create-daily-room
```

### Step 3: Run Database Migrations
```bash
# In Supabase SQL Editor, run these in order:
1. supabase/migrations/20251124000000_admin_reports_banned.sql
2. supabase/migrations/20251124000001_add_like_notification_type.sql
3. supabase/migrations/20251124100000_add_rate_limiting.sql
```

### Step 4: Configure Supabase Auth
1. Go to Supabase Dashboard → Authentication → Settings
2. **Enable Email Confirmations**:
   - Enable "Enable email confirmations"
   - Set "Confirm email" template
   - Redirect URL: `https://getverity.com.au/verify-email`
3. **Email Templates**:
   - Customize welcome email
   - Add branding/logo
4. **Rate Limits**:
   - Adjust if needed (default is fine)

### Step 5: Deploy to Vercel (getverity.com.au)
```bash
# If not already deployed, run:
vercel --prod

# Set environment variables in Vercel:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 6: Configure Custom Domain
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `getverity.com.au`
3. Update DNS records (Vercel provides exact records)
4. Wait for SSL certificate (auto, ~5 minutes)

### Step 7: AWS Rekognition Setup
1. Create AWS Account (free tier available)
2. IAM → Create user with `AmazonRekognitionFullAccess`
3. Generate access keys
4. Add to Supabase secrets (Step 1)
5. **Billing Alert**: Set budget alert for $5/month

### Step 8: Daily.co Setup
1. Sign up at daily.co
2. Free tier: 10k minutes/month
3. Get API key from Dashboard → Developers
4. Add to Supabase secrets (Step 1)

---

## 🧪 Beta Testing Checklist

### Pre-Launch Testing (Do This First!)
- [ ] Sign up new account → verify email works
- [ ] Upload photo → check moderation (test with safe image)
- [ ] Complete onboarding → verify profile created
- [ ] Like 6 profiles quickly → verify rate limit triggers
- [ ] Match with test user → check notification
- [ ] Send 6 messages quickly → verify rate limit
- [ ] Accept Verity Date → Daily.co room created
- [ ] Join video call → timer counts down correctly
- [ ] Wait for timer end → redirects to feedback
- [ ] Submit feedback → stores correctly

### Beta Launch Day
1. **Invite 20-50 beta users** (friends, trusted network)
2. **Monitor Supabase logs** for errors
3. **Check Sentry/error tracking** (if configured)
4. **Daily.co usage** (stay under free tier)
5. **AWS Rekognition cost** (should be <$1/day with 50 users)

---

## ⚠️ Known Limitations (Beta)

### Photo Moderation
- **Fail Open**: If AWS Rekognition is down, photos are allowed
- **For Production**: Change to fail closed (reject if moderation unavailable)
- **File**: `supabase/functions/moderate-photo/index.ts` line 98

### Rate Limiting
- **No Redis**: Uses Supabase table (slower but sufficient for beta)
- **Cleanup**: Old records auto-deleted after 1 hour
- **For Production**: Consider Redis for better performance

### Video Dates
- **No Recording**: Videos are not recorded (privacy-first)
- **Max 2 participants**: Daily.co enforced
- **10-minute limit**: Hard-coded, consider making configurable

### Email Verification
- **No SMS backup**: Email only (some users may not have access)
- **For Production**: Add SMS verification via Twilio

---

## 📊 Beta Success Metrics

Track these to measure beta success:

1. **Activation Rate**: % of signups who complete onboarding
2. **Match Rate**: % of users who get ≥1 match
3. **Verity Date Completion**: % of accepted dates that complete full 10 min
4. **Chat Unlock Rate**: % of matches that unlock chat (post-date)
5. **Retention**: % of users who return after 7 days

Target for beta:
- 70%+ activation rate
- 40%+ match rate  
- 80%+ Verity Date completion
- 60%+ chat unlock rate
- 30%+ 7-day retention

---

## 🎯 Next Steps After Beta

### Week 1-2 (Feedback Collection)
- Daily check-in with beta users
- Fix critical bugs immediately
- Collect UX feedback

### Week 3-4 (Iteration)
- Implement top-requested features
- Improve onboarding based on dropoff
- Optimize matching algorithm

### Month 2 (Scaling)
- Invite 100-200 users
- Switch to fail-closed moderation
- Add Redis for rate limiting
- Enable push notifications

### Month 3+ (Public Launch)
- Marketing campaign
- App Store submission
- Scale infrastructure
- Add premium features

---

## 🆘 Emergency Contacts

**If Something Breaks:**

1. **Supabase Down**: Check https://status.supabase.com
2. **Daily.co Issues**: Support at https://www.daily.co/contact
3. **AWS Issues**: Check AWS Health Dashboard

**Quick Fixes:**

- **Rate limit too strict**: Increase limit in edge function (line 35)
- **Photo moderation rejecting good photos**: Lower confidence threshold (line 47)
- **Video calls not starting**: Check DAILY_API_KEY is set correctly

---

## ✅ Final Pre-Launch Checklist

- [ ] All edge functions deployed
- [ ] All migrations run
- [ ] Email verification enabled in Supabase
- [ ] Domain `getverity.com.au` pointing to Vercel
- [ ] SSL certificate active (https works)
- [ ] Daily.co API key configured
- [ ] AWS credentials configured
- [ ] Test account created and verified
- [ ] Full user journey tested (signup → match → video date → feedback)
- [ ] Error monitoring configured
- [ ] Billing alerts set (AWS, Daily.co)
- [ ] Beta user list ready (20-50 people)
- [ ] Support email configured (support@getverity.com.au)

---

## 🎉 Launch Command

Once everything above is ✅:

```bash
# 1. Final build and deploy
git add .
git commit -m "Beta launch v1.0 - Email verification, rate limiting, photo moderation, Daily.co integration"
git push origin main

# 2. Vercel auto-deploys (or manual deploy):
vercel --prod

# 3. Send beta invites!
# 4. Monitor dashboard for first 24 hours
# 5. Celebrate! 🎊
```

---

**Video Dates Only - Beta Focus:**
- Main feature: 10-minute AI-facilitated video dates
- Chat unlocked ONLY after successful date
- This differentiates Verity from Tinder/Bumble
- Focus all beta feedback on video date experience

**Domain**: https://getverity.com.au
**Beta Start**: TBD
**Beta Duration**: 4-6 weeks
**Target Users**: 50-100 beta testers

---

Good luck with the beta launch! 🚀❤️
