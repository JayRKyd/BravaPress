# BravaPress: Using Prepaid EIN Presswire Credits

This guide explains how to configure BravaPress to use prepaid credits on EIN Presswire so the automation can bypass card entry and submit press releases hands‑free.

---

## 1) What you’ll achieve
- Automation logs into EIN → selects the chosen package (Basic/Pro+/Corporate) → applies an available credit at checkout → proceeds to the submission form → posts your press release.
- No card data is entered by the bot during checkout.

---

## 2) Prerequisites
- EIN account credentials set as server environment variables:
  - `EINPRESSWIRE_EMAIL`
  - `EINPRESSWIRE_PASSWORD`
- Your app/server running with Playwright available.
- Admin dashboard accessible to monitor jobs and errors.

Optional toggle (recommended):
- `EIN_USE_PREPAID_CREDITS=true` to explicitly enable the “use credits” branch in automation.

> NOTE: Do not expose these variables on the client. They must only exist on the server/.env.local and production server env.

---

## 3) Load your EIN account with credits
Complete this step in the EIN web UI (manually):
1. Log in to EIN Presswire using your admin account.
2. Navigate to Pricing/Buy page or Account → Billing/Payments.
3. Purchase a block of credits for the package tier(s) you plan to use (e.g., Basic).
4. Verify your account shows available credits (e.g., “Credits: 5” / “Available Press Releases: 5”).

Once credits exist, the checkout flow for that package should present an option to use a credit and bypass card entry.

---

## 4) Automation behavior (what the bot will do)
When `EIN_USE_PREPAID_CREDITS=true` is set, the automation will:
- Log in to EIN
- Go to `/pricing`
- Click the plan (Basic/Pro+/Corporate)
- On the checkout page, detect credit availability and complete the order using a credit instead of card details
- Continue to the submission form and fill the PR fields

If credits are missing or the UI doesn’t present the credit option, the bot will fail gracefully and log a clear error such as “No credits available” (see Fallbacks below).

---

## 5) Implementation details (to be applied in code)
You can implement these edits in `services/einpresswire-automation.ts` inside the `purchasePackage(...)` method after navigation to the package checkout page.

### 5.1 Add an environment toggle
```ts
const useCredits = process.env.EIN_USE_PREPAID_CREDITS === 'true';
```

### 5.2 Detect a credit option on the checkout page
Try selectors similar to these (the site can change; keep multiple fallbacks):
```ts
// Possible indicators/selectors
const creditIndicators = [
  'text=Use Credit',
  'text=Use Credit(s)',
  'text=Available Credits',
  'label:has-text("Use Credit") input[type="radio"]',
  'input[type="radio"][value*="credit"]',
  'button:has-text("Use Credit")'
];
```

### 5.3 Apply the credit
Pseudocode:
```ts
if (useCredits) {
  for (const s of creditIndicators) {
    const el = page.locator(s).first();
    if (await el.isVisible().catch(() => false)) {
      await el.click({ force: true }).catch(() => {});
      break;
    }
  }

  // Common confirm/submit buttons after selecting a credit
  const confirmSelectors = [
    'button:has-text("Place Order")',
    'button:has-text("Submit")',
    'button:has-text("Complete Order")',
    'input[type="submit"][value*="Order"]',
  ];

  for (const s of confirmSelectors) {
    const btn = page.locator(s).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click({ force: true });
      await page.waitForLoadState('networkidle');
      // If navigation ends on submission form, success
      break;
    }
  }
}
```

### 5.4 Verify you landed on the submission form
Look for a known submission element, then proceed with `fillSubmissionForm(...)`.

---

## 6) Fallbacks and error handling
- If credits aren’t found or visible:
  - Log and return a structured error: `{"error":"No EIN credits available for selected package"}`.
  - The job should be marked `failed` and an admin alert raised.
- If cookie/consent bars block the page, dismiss or remove fixed overlays (already implemented in the automation).
- If EIN DOM changes, update the selectors above; keep several fallbacks.

---

## 7) Environment configuration
Add to `.env.local` (development) or server env (production):
```
EINPRESSWIRE_EMAIL=your_email@domain.com
EINPRESSWIRE_PASSWORD=your_password
EIN_USE_PREPAID_CREDITS=true
```
Restart the app so the env vars are picked up.

---

## 8) End‑to‑end test
1. Start the app (ensure Playwright browsers installed):
   - `npm run dev` (dev) or `npm run build && npm start` (prod)
2. Verify admin System Health shows env OK.
3. Trigger a test submission via API:
   - POST `/api/press-release/submit` with a minimal payload (title/content/companyName).
4. Observe logs:
   - Should show: login → pricing → package click → “Detected/Applied credit” → submission page loaded.
5. Verify in admin dashboard that the job completes and the submission row is updated.

---

## 9) Operational runbook
- **Monitoring**: Admin → Jobs tab; verify pending/failed counts. Metrics page for throughput and success rate.
- **Low credits**: Add credits in EIN; retry failed jobs from admin.
- **DOM drift**: If EIN changes UI, update selectors under `purchasePackage()`; run smoke test again.
- **Security**: Keep EIN credentials in server env only. Don’t commit secrets.

---

## 10) Rollback
If you want to temporarily disable credits:
- Set `EIN_USE_PREPAID_CREDITS=false` (or remove it) and restart.
- The automation will fall back to the default purchase path (or stop at payment if card automation is not enabled).

---

## 11) Optional next steps
- Add alerting when credits fall below a threshold (query the checkout page for available credits text and notify).
- Store screenshots for each stage to S3 or Supabase storage for audit.
- Expand form field selectors in `fillSubmissionForm(...)` to match any EIN editor updates (including iframe editors).