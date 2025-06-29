# BravaPress Job System Flow Documentation

## Overview
The BravaPress job system tracks and manages the entire press release submission and processing workflow, from customer signup to final distribution. This document outlines the complete flow and what jobs track at each stage.

---

## 🔄 Complete Customer-to-Admin Flow

### **Phase 1: Customer Journey**

#### **1. Customer Signs Up**
- **Location**: `/auth/login` or `/auth/signup`
- **Database**: Creates record in `auth.users` and `profiles` tables
- **Jobs Created**: None yet
- **Status**: User account created

#### **2. Customer Creates Press Release**
- **Location**: `/dashboard/new-release`
- **Process**: 
  - User fills out press release form
  - AI generates/optimizes content
  - User reviews and validates content
- **Database**: No records created yet (draft mode)
- **Jobs Created**: None yet
- **Status**: Content prepared but not submitted

#### **3. Customer Submits & Pays**
- **Location**: `/dashboard/new-release` (submit button)
- **Process**:
  - Creates `press_release_submissions` record with `status: 'payment_pending'`
  - Stripe payment intent created
  - Customer completes payment
- **Database**: 
  ```sql
  -- press_release_submissions table
  status: 'payment_pending' → 'paid'
  stripe_payment_intent_id: 'pi_xxx'
  payment_amount: 9900 (in cents)
  ```
- **Jobs Created**: None yet (waiting for payment confirmation)

#### **4. Payment Webhook Triggers**
- **Location**: `/api/payments/webhook`
- **Trigger**: Stripe sends `payment_intent.succeeded` webhook
- **Process**:
  - Updates submission status to `'paid'`
  - **Creates background job** 🎯
- **Database**:
  ```sql
  -- jobs table - FIRST JOB CREATED
  INSERT INTO jobs (
    type: 'press_release_submission',
    status: 'pending',
    data: {
      submission_id: 'uuid',
      user_id: 'uuid', 
      payment_intent_id: 'pi_xxx'
    },
    priority: 1
  )
  ```

---

### **Phase 2: Background Processing**

#### **5. Background Worker Picks Up Job**
- **Location**: `background-job-worker.mjs` (runs every 60 seconds)
- **Process**: Calls `/api/jobs/process` endpoint
- **Database Update**:
  ```sql
  -- jobs table
  status: 'pending' → 'processing'
  started_at: NOW()
  attempts: attempts + 1
  ```

#### **6. Job Processor Executes**
- **Location**: `/api/jobs/process`
- **Process**: 
  - Fetches submission details
  - Updates submission to `'processing'`
  - Initializes EINPresswire automation
  - Runs browser automation to submit press release
- **Database Updates**:
  ```sql
  -- press_release_submissions table
  status: 'paid' → 'processing' → 'completed'/'failed'
  processing_logs: [step-by-step automation logs]
  einpresswire_order_id: 'order_xxx'
  einpresswire_submission_id: 'sub_xxx'
  screenshots: [base64 images for debugging]
  completed_at: NOW()
  ```

#### **7. Job Completion**
- **Success Path**:
  ```sql
  -- jobs table
  status: 'processing' → 'completed'
  completed_at: NOW()
  result: {automation results, order IDs, etc.}
  ```
- **Failure Path**:
  ```sql
  -- jobs table  
  status: 'processing' → 'failed' (or 'retrying')
  error: 'Error message'
  attempts: attempts + 1
  ```

---

### **Phase 3: Admin Monitoring**

#### **8. Admin Logs In**
- **Location**: `/dashboard/admin`
- **Authentication**: 
  - Checks `admin_users` table for `role` and `is_active`
  - Only `super_admin`, `admin`, or `support` roles allowed
- **Dashboard Access**: Admin dashboard loads with job monitoring

#### **9. Admin Views Jobs**
- **Location**: `/dashboard/admin` (Jobs tab)
- **API Endpoint**: `/api/admin/jobs`
- **Data Displayed**:
  ```javascript
  {
    id: 'job-uuid',
    type: 'press_release_submission',
    status: 'completed', // pending, processing, completed, failed, retrying
    attempts: 1,
    created_at: '2024-01-15T10:30:00Z',
    started_at: '2024-01-15T10:31:00Z', 
    completed_at: '2024-01-15T10:35:00Z',
    error: null,
    // Linked submission data
    press_release_submissions: {
      title: 'Customer Press Release Title',
      company_name: 'Customer Company',
      profiles: {
        email: 'customer@email.com',
        full_name: 'Customer Name'
      }
    }
  }
  ```

#### **10. Admin Views Press Releases**
- **Location**: `/dashboard/admin` (Press Releases tab)
- **API Endpoint**: `/api/admin/press-releases`
- **Data Displayed**:
  ```javascript
  {
    id: 'submission-uuid',
    title: 'Press Release Title',
    company_name: 'Company Name', 
    status: 'completed', // draft, payment_pending, paid, processing, completed, failed
    payment_amount: 99.00,
    einpresswire_order_id: 'order_123',
    created_at: '2024-01-15T10:30:00Z',
    completed_at: '2024-01-15T10:35:00Z',
    // User info
    profiles: {
      email: 'customer@email.com',
      full_name: 'Customer Name'
    }
  }
  ```

---

## 📊 What Jobs Track

### **Job Metadata**
- **Unique ID**: Each job has a UUID for tracking
- **Type**: `press_release_submission`, `email_notification`, `cleanup`
- **Status**: `pending` → `processing` → `completed`/`failed`
- **Priority**: Higher numbers processed first
- **Attempts**: Retry counter (max 3 attempts)
- **Timing**: Created, started, completed timestamps
- **Results**: Success data or error messages

### **Press Release Job Data**
```json
{
  "submission_id": "uuid-of-press-release",
  "package_type": "basic|premium|enterprise", 
  "test_mode": true/false,
  "demo_mode": true/false,
  "user_id": "uuid-of-customer",
  "payment_intent_id": "stripe-payment-id"
}
```

### **Job Processing Results**
```json
{
  "success": true,
  "result": {
    "purchase": {
      "success": true,
      "orderId": "EIN_ORDER_123",
      "accessCredentials": {...}
    },
    "submission": {
      "success": true, 
      "submissionId": "EIN_SUB_456",
      "confirmationUrl": "https://...",
      "screenshots": ["base64_image1", "base64_image2"]
    }
  }
}
```

---

## 🔍 Admin Dashboard Features

### **Real-Time Monitoring**
- **Job Queue Status**: See pending, processing, failed jobs
- **Processing Times**: Track how long jobs take
- **Error Tracking**: View failed jobs with error messages
- **User Activity**: See which customers are submitting

### **Filtering & Search**
- **By Status**: pending, processing, completed, failed
- **By Type**: press_release_submission, email_notification
- **By Date Range**: Last 24h, week, month
- **By Customer**: Search by email or company name

### **Management Actions**
- **Retry Failed Jobs**: Manually retry failed submissions
- **View Job Details**: See full processing logs and screenshots
- **Customer Support**: Contact info for failed submissions
- **System Health**: Monitor queue depth and processing rates

---

## 🚨 Error Handling & Retries

### **Automatic Retries**
- **Max Attempts**: 3 tries per job
- **Backoff Strategy**: 5 minutes × attempt number
- **Retry Conditions**: Network errors, temporary failures
- **No Retry**: Invalid data, permanent failures

### **Error Categories**
1. **Payment Issues**: Stripe webhook failures
2. **Automation Issues**: Browser automation failures  
3. **EINPresswire Issues**: Website changes, login problems
4. **System Issues**: Database errors, API timeouts

### **Admin Alerts**
- **Failed Jobs**: Email notifications for critical failures
- **Queue Backup**: Alert when jobs pile up
- **System Health**: Daily/weekly status reports

---

## 🔧 Technical Implementation

### **Background Worker**
- **File**: `background-job-worker.mjs`
- **Schedule**: Every 60 seconds
- **Method**: HTTP POST to `/api/jobs/process`
- **Deployment**: Can run as cron job, PM2 process, or serverless function

### **Database Tables**
1. **`jobs`**: Main job queue and status tracking
2. **`press_release_submissions`**: Customer submissions and results
3. **`profiles`**: Customer information for admin dashboard
4. **`admin_users`**: Admin access control

### **API Endpoints**
- **`/api/jobs/process`**: Background job processor
- **`/api/admin/jobs`**: Admin job monitoring
- **`/api/admin/press-releases`**: Admin submission monitoring
- **`/api/payments/webhook`**: Stripe payment processing

---

## 🎯 Success Metrics

### **Customer Metrics**
- **Submission Success Rate**: % of submissions that complete successfully
- **Processing Time**: Average time from payment to completion
- **Customer Satisfaction**: Based on successful distributions

### **System Metrics**  
- **Job Processing Rate**: Jobs per hour/day
- **Error Rate**: % of jobs that fail
- **Queue Health**: Average queue depth and wait times
- **Uptime**: System availability and reliability

### **Business Metrics**
- **Revenue Tracking**: Successful paid submissions
- **Customer Retention**: Repeat customers
- **Support Load**: Failed jobs requiring manual intervention

---

## 💡 Key Client Notes

### **When Are Jobs Created?**
**Jobs are ONLY created when payment is confirmed** - not before. Here's the exact timeline:

#### **❌ Jobs NOT Created When:**
- Customer signs up
- Customer fills out press release form  
- Customer clicks "Submit" (creates submission record, but no job yet)
- Payment is pending/processing

#### **✅ Job IS Created When:**
- **Stripe payment succeeds**
- **Payment webhook fires** (`/api/payments/webhook`)
- **`payment_intent.succeeded` event received**

#### **Why This Design?**
1. **Payment Security**: Only process press releases that are actually paid for
2. **No Wasted Resources**: Don't run expensive automation for unpaid submissions  
3. **Clean Pipeline**: Payment confirmation → Job creation → Processing
4. **Webhook Reliability**: Stripe webhooks are the most reliable way to confirm payment

#### **Client Summary:**
```
Customer Pays → Stripe Webhook → Job Created → Background Worker Processes → Admin Sees Results
```

**Every job in your system represents a paid, legitimate press release that needs processing.** This ensures no resources are wasted on unpaid submissions and provides a clear audit trail from payment to completion.

---

This job system provides complete visibility and control over the press release submission process, ensuring customers get reliable service and admins can proactively manage the system. 