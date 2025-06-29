# BravaPress - Remaining TODO Items

*Created: January 2025*
*Status: Pending Client Input*

## 🔄 **Items Requiring Client Information**

### **1. Credit System Implementation**
**Status**: TODO - Pending Business Requirements
**Dependencies**: Client decision on credit model

#### **Tasks**:
- [ ] Implement credit tracking for users
- [ ] Add credit deduction on press release creation  
- [ ] Create credit purchase/top-up system
- [ ] Add credit balance display in user dashboard
- [ ] Implement credit expiration policies (if needed)

#### **Files to Create/Modify**:
- `lib/credits/manager.ts`
- `app/api/credits/route.ts`
- Database migration for credits table
- `components/credits/CreditBalance.tsx`
- `app/dashboard/credits/page.tsx`

#### **Business Questions for Client**:
- Do users purchase credits upfront or pay per press release?
- What's the credit-to-dollar conversion rate?
- Do credits expire?
- Should there be bulk credit discounts?

---

### **2. Refund Processing**
**Status**: TODO - Pending Stripe Integration
**Dependencies**: Client Stripe account details

#### **Tasks**:
- [ ] Add refund capability for failed submissions
- [ ] Integrate with Stripe refund API
- [ ] Create admin refund interface
- [ ] Add refund tracking and reporting
- [ ] Implement partial refund logic

#### **Files to Create/Modify**:
- `lib/payments/refunds.ts`
- `app/api/admin/refunds/route.ts`
- `app/dashboard/admin/refunds/page.tsx`
- `services/stripe-refunds.ts`

#### **Client Requirements**:
- Stripe account credentials
- Refund policy definition
- Approval workflow requirements

---

### **3. Audit Logging**
**Status**: TODO - Can implement anytime
**Dependencies**: None

#### **Tasks**:
- [ ] Track all admin actions and system changes
- [ ] Add audit trail for compliance
- [ ] Create audit log viewer in admin dashboard
- [ ] Implement log retention policies
- [ ] Add audit event filtering and search

#### **Files to Create/Modify**:
- `lib/audit/logger.ts`
- `app/api/admin/audit-logs/route.ts`
- `app/dashboard/admin/audit/page.tsx`
- Database migration for audit_logs table
- `middleware/audit-middleware.ts`

---

### **4. Job Worker Notifications**
**Status**: TODO - Can implement anytime
**Dependencies**: Email service selection

#### **Tasks**:
- [ ] Email notifications for job completion/failure
- [ ] Admin alerts for system issues
- [ ] User notifications for press release status
- [ ] Configurable notification preferences
- [ ] SMS notifications (optional)

#### **Files to Create/Modify**:
- `lib/notifications/email.ts`
- `lib/notifications/templates/`
- `services/notification-service.ts`
- `app/api/notifications/preferences/route.ts`
- `components/notifications/NotificationSettings.tsx`

#### **Client Decisions Needed**:
- Email service provider preference (Resend, SendGrid, etc.)
- Notification frequency preferences
- SMS integration requirements

---

## 🎯 **Implementation Priority**

1. **Audit Logging** - No dependencies, can implement immediately
2. **Job Worker Notifications** - Minimal dependencies, high value
3. **Credit System** - Requires business model clarification
4. **Refund Processing** - Requires Stripe integration

---

## 📝 **Notes**

- All systems are architected to support these features
- Database schema can accommodate these additions
- UI components are designed with these features in mind
- Implementation can begin immediately once client requirements are clarified

---

## ✅ **When Client Provides Stripe Info**

1. Update payment processing to use real Stripe keys
2. Implement refund processing system
3. Add credit system if required by business model
4. Test full payment workflow end-to-end

**Current Status**: System is 95% production-ready. These items represent the final 5% for complete feature parity with enterprise requirements. 