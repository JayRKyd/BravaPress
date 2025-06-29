# BravaPress: Enabling Real EINPresswire Automation

This guide explains how to turn BravaPress from demo/test mode into a fully automated, production-ready SaaS that submits real press releases to EINPresswire using your client's account.

---

## 1. Configure EINPresswire Credentials

Add your EINPresswire account credentials to your `.env.local` file:

```
EINPRESSWIRE_EMAIL=your_account_email
EINPRESSWIRE_PASSWORD=your_account_password
```

- **Never commit these credentials to version control.**
- Use a secure password manager to share/store these credentials.

---

## 2. Update Automation Code

- In `services/einpresswire-automation.ts`, update the login step to use the credentials from environment variables:
  - Use `process.env.EINPRESSWIRE_EMAIL` and `process.env.EINPRESSWIRE_PASSWORD`.
  - Remove or bypass any code that creates a new EINPresswire account for each submission.
  - Ensure the automation logs in with the real account, navigates to the submission form, and submits the press release.
- Make sure session/cookie management is handled so you stay logged in between jobs.

---

## 3. Switch to Production Mode

- In your job processor (`app/api/jobs/process/route.ts`), set `demoMode: false` and `testMode: false` for all jobs.
- Only use demo/test mode for local testing or debugging.

---

## 4. Handle Submission Results

- Parse the EINPresswire confirmation page for:
  - Submission ID
  - Confirmation URL
  - Any other relevant info
- Store these in the `press_release_submissions` table.
- Save screenshots for each step for audit/debugging.

---

## 5. Error Handling & Retries

- If login or submission fails, log the error and let the job system retry (handled by your job queue).
- If EINPresswire changes their site, update your Playwright selectors and automation logic.

---

## 6. Monitoring & Alerts

- Use `/api/jobs/status` to monitor job health and queue status.
- Set up email/SMS alerts for failed jobs (optional, but recommended for production reliability).

---

## 7. Testing

- Run a real submission with a test press release (not a real customer) to verify end-to-end automation.
- Check the EINPresswire dashboard to confirm the press release appears as expected.
- Review logs and screenshots for any issues.

---

## 8. Security & Compliance

- Never log or expose EINPresswire credentials in client-facing logs or UIs.
- Rotate credentials if you suspect they're compromised.
- Use HTTPS and secure environment variable management in production.

---

## 9. Going Live

- Once you've verified a real submission works, you're ready to onboard real customers!
- Monitor the first few real jobs closely to catch any issues early.

---

**BravaPress is now a true, fully automated SaaS!** 