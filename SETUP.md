# Brava Press Launchpad - Setup Guide

## Environment Variables

To get the AI-powered content generation working, you need to set up the following environment variables. Create a `.env.local` file in the root directory with these variables:

### Required for AI Functionality

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here
```

### Optional (for future features)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:8000
NEXTAUTH_SECRET=your-nextauth-secret

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_PRICE_ID=your-stripe-price-id

# Email Configuration
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# EINNewswire Configuration
EIN_USERNAME=your-ein-username
EIN_PASSWORD=your-ein-password
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Create a `.env.local` file in the root directory
   - Add your OpenAI API key (get one from https://platform.openai.com/api-keys)
   - Add other environment variables as needed

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Test the AI functionality:**
   - Navigate to `/dashboard/new-release`
   - Fill in the company information form
   - Click "Next: Payment" and then "Pay $395 and Generate"
   - The AI should generate press release content automatically

## API Endpoints

The following API endpoints have been created for the AI functionality:

- `POST /api/press-release/generate` - Generate press release content using OpenAI
- `POST /api/press-release/validate` - Validate press release content against guidelines

## Features Implemented

✅ **AI-Powered Content Generation**
- Company information form
- OpenAI GPT-4 integration for content generation
- Press release title, Twitter title, summary, and full content generation
- Editable generated content

✅ **Content Validation**
- AI-powered validation against EINNewswire guidelines
- Detailed feedback for content improvements
- Pass/fail validation results

✅ **User Interface**
- Multi-step form with tabs
- Payment simulation
- Content preview and editing
- Validation results display

## Next Steps

The core AI functionality is now working. Future development should focus on:

1. **Payment Integration** - Replace payment simulation with real Stripe integration
2. **Database Integration** - Save press releases to Supabase
3. **EINNewswire Automation** - Implement Playwright automation for submission
4. **Email Notifications** - Send confirmation and report emails
5. **User Authentication** - Implement proper user sessions and data persistence 