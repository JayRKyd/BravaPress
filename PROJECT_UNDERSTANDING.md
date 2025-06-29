# BravaPress Launchpad - Project Understanding

## Overview
BravaPress is a SaaS platform that automates press release creation and distribution through EINPresswire.com. The system handles the entire workflow from payment to distribution reporting.

## Core Workflow

### 1. Payment First Approach
- **$395 charge via Stripe** before any content input
- Payment webhook handling for reliability
- Automatic refunds if submission fails 3 times

### 2. AI-Powered Content Generation
- **OpenAI GPT-4** for press release generation
- User inputs: company details, announcement type, key information
- Industry-specific templates and optimization
- **Twitter-optimized titles** for social media distribution

### 3. Content Validation
- **Dual validation system**:
  - OpenAI validation against EINPresswire guidelines
  - Custom regex/linting for formatting issues
- **Unlimited re-edits** until validation passes
- **Rate limiting**: Max 5 validation attempts per hour
- Store drafts and validations for compliance auditing

### 4. Browser Automation (Critical Component)
- **Puppeteer/Playwright** automation for EINPresswire.com
- **Purchase press release package** on EINPresswire
- **Submit content** automatically
- **Handle scheduling**: immediate or advance scheduling
- **Robust error handling** with retries
- **Headless browser session monitoring**

### 5. Distribution Monitoring
- **24-hour check** for distribution reports
- **Background job queue** (BullMQ or cron)
- **Email notifications** via Resend API
- **Real-time dashboard updates**

## Technical Architecture

### Frontend (Next.js 14 + TypeScript)
```
app/
├── dashboard/
│   ├── page.tsx                 # Dashboard overview
│   ├── new-release/             # Press release creation
│   ├── releases/                # Manage existing releases
│   └── billing/                 # Payment history
├── api/
│   ├── press-release/
│   │   ├── generate/            # OpenAI content generation
│   │   ├── validate/            # Content validation
│   │   └── submit/              # EINPresswire automation
│   ├── payments/                # Stripe integration
│   └── webhooks/                # Payment webhooks
```

### Key Features
- **Magic Link Authentication** (Auth.js) - *postponed for now*
- **Mobile-responsive dashboard**
- **Real-time status updates**
- **Scheduled submissions**
- **Distribution report retrieval**

### Backend Services

#### 1. OpenAI Integration
- **Content Generation**: Company info → full press release
- **Content Validation**: EINPresswire guidelines compliance
- **Industry-specific optimization**
- **Draft storage** for auditing

#### 2. Browser Automation Service
```javascript
// Core automation tasks:
1. Navigate to EINPresswire.com
2. Purchase press release package ($395)
3. Fill submission form with generated content
4. Handle scheduling (immediate/future)
5. Monitor submission status
6. Retrieve distribution reports
```

#### 3. Payment Processing
- **Stripe integration** with webhooks
- **Pre-payment model** (charge before content input)
- **Automatic refund logic** (3 failed attempts)
- **Transaction monitoring**

#### 4. Background Jobs
- **Email notifications** (Resend API)
- **Distribution report checking**
- **Submission retry logic**
- **Error alert system**

## Database Schema (PostgreSQL + Prisma)

### Core Tables
```sql
-- Users (Auth postponed)
users: id, email, created_at, updated_at

-- Transactions 
transactions: id, user_id, amount, status, stripe_payment_id, created_at

-- Press Releases
press_releases: id, user_id, transaction_id, title, content, status, scheduled_for, created_at

-- Submissions (EINPresswire tracking)
submissions: id, press_release_id, status, submission_id, report_url, created_at

-- Error Logs
error_logs: id, component, error_message, user_id, created_at
```

## Current Development Priorities

### Phase 1: Core AI & Automation (Current Focus)
1. ✅ **OpenAI API Integration** - Content generation & validation
2. 🔄 **Browser Automation** - EINPresswire submission automation
3. 🔄 **Error Handling** - Robust retry and fallback mechanisms

### Phase 2: Payment & User Flow
1. **Stripe Integration** - $395 pre-payment system
2. **Webhook Handling** - Payment confirmation & refunds
3. **User Dashboard** - Status tracking & management

### Phase 3: Monitoring & Optimization
1. **Background Jobs** - Email notifications & report retrieval
2. **Admin Panel** - Transaction & submission monitoring
3. **Mobile Optimization** - Responsive design

### Phase 4: Production & Deployment
1. **Domain Setup** - bravapress.com on DigitalOcean
2. **CI/CD Pipeline** - GitHub → DigitalOcean
3. **SSL & Security** - Production-ready deployment

## Risk Mitigation

### Browser Automation Risks
- **HTML Changes**: EINPresswire UI updates breaking selectors
- **Solution**: Robust selectors + fallback flows + monitoring

### Payment Security
- **Failed Transactions**: User closes browser mid-payment
- **Solution**: Stripe webhooks + transaction reconciliation

### Content Compliance
- **Policy Changes**: EINPresswire guideline updates
- **Solution**: Regular validation rule updates + manual review flags

### System Reliability
- **Automation Failures**: Browser crashes, network issues
- **Solution**: Automatic retries + error alerts + manual fallback

## Key Business Rules

1. **Payment First**: No content generation without payment
2. **Validation Required**: Content must pass AI + format validation
3. **3-Strike Rule**: Automatic refund after 3 failed submissions
4. **Rate Limiting**: Max 5 validation attempts per hour
5. **24-Hour Reporting**: Distribution reports within 24 hours
6. **Unlimited Edits**: Users can revise until validation passes

## EINPresswire Integration Points

### Purchase Flow
1. Navigate to EINPresswire pricing page
2. Select appropriate package ($395)
3. Complete purchase with provided payment method
4. Obtain submission credentials/access

### Submission Flow
1. Access submission portal
2. Fill required fields (title, content, company info)
3. Set distribution date (immediate/scheduled)
4. Submit for review
5. Monitor approval status

### Reporting Flow
1. Check submission status (24-48 hours)
2. Retrieve distribution report
3. Extract key metrics (reach, pickup, etc.)
4. Send report to user via email

## Development Environment
- **Framework**: Next.js 14 with TypeScript
- **Database**: Self-hosted Supabase (PostgreSQL)
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Automation**: Playwright (preferred over Puppeteer)
- **Email**: Resend API
- **Queue**: BullMQ for background jobs
- **Deployment**: DigitalOcean with GitHub CI/CD

## Immediate Next Steps
1. ✅ Secure OpenAI API routes (completed)
2. 🔄 Debug form submission button (current issue)
3. 🆕 Implement Playwright automation for EINPresswire
4. 🆕 Create background job system for monitoring
5. 🆕 Add Stripe payment integration 