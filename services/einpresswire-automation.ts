import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface PressReleaseSubmission {
  title: string;
  content: string;
  summary: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  industry: string;
  location: string;
  scheduledDate?: Date; // For advance scheduling
}

export interface SubmissionResult {
  success: boolean;
  submissionId?: string;
  confirmationUrl?: string;
  error?: string;
  screenshots?: string[]; // Base64 encoded screenshots for debugging
}

export interface PurchaseResult {
  success: boolean;
  orderId?: string;
  error?: string;
  accessCredentials?: {
    username?: string;
    password?: string;
    submissionUrl?: string;
  };
  requiresManualPayment?: boolean; // Added for credit mode
}

export class EINPresswireAutomation {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private readonly baseUrl = 'https://www.einpresswire.com';
  private readonly maxRetries = 3;
  private readonly timeout = 30000;

  // Build absolute URL from possibly relative href
  private absoluteUrl(pathOrUrl: string): string {
    if (!pathOrUrl) return this.baseUrl;
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    if (pathOrUrl.startsWith('/')) return `${this.baseUrl}${pathOrUrl}`;
    return `${this.baseUrl}/${pathOrUrl}`;
  }

  /**
   * Ensure we're authenticated in the current browser context.
   */
  private async ensureLoggedIn(): Promise<void> {
    if (!this.page) throw new Error('Page not available');
    const email = process.env.EINPRESSWIRE_EMAIL;
    const password = process.env.EINPRESSWIRE_PASSWORD;
    if (!email || !password) throw new Error('EINPresswire credentials not set in environment variables');

    try {
      // Quick check: if we can see a user-only element, assume logged in
      const loggedIn = await this.page.locator('a.gtm-upper_menu-click-logout, a.gtm-upper_menu-click-my_releases').first().isVisible({ timeout: 2000 }).catch(() => false);
      if (loggedIn) {
        console.log('🔐 Already logged in (header detected)');
        return;
      }
    } catch {}

    console.log('🔐 Logging in to EINPresswire...');
    await this.page.goto('https://www.einpresswire.com/login-email', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Fill login form
    await this.page.waitForSelector('form[action="/login-email"]', { timeout: 10000 });
    await this.page.fill('input#login', email);
    await this.page.fill('input#password', password);
    const loginBtn = this.page.locator('form[action="/login-email"] button[type="submit"]').first();
    await loginBtn.click({ force: true });

    // Wait for navigation or for header indicator
    await Promise.race([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}),
      this.page.locator('a.gtm-upper_menu-click-submit_release, a.gtm-upper_menu-click-logout').first().waitFor({ timeout: 15000 }).catch(() => {})
    ]);

    // Final check
    const success = await this.page.locator('a.gtm-upper_menu-click-submit_release, a.gtm-upper_menu-click-logout').first().isVisible({ timeout: 2000 }).catch(() => false);
    if (success) {
      console.log('✅ Login successful');
    } else {
      throw new Error('Login did not complete');
    }
  }

  /**
   * Initialize browser and create context
   */
  async initialize(headless: boolean = true): Promise<void> {
    console.log('🚀 Initializing EINPresswire automation...');
    
    try {
      this.browser = await chromium.launch({
        headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote'
        ]
      });

      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true
      });

      this.page = await this.context.newPage();
      
      // Set default timeout
      this.page.setDefaultTimeout(this.timeout);
      
      console.log('✅ Browser initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw new Error(`Browser initialization failed: ${error}`);
    }
  }

  /**
   * Take screenshot and convert to base64 string
   */
  private async takeScreenshot(): Promise<string> {
    if (!this.page) throw new Error('Page not available');
    
    const buffer = await this.page.screenshot();
    return buffer.toString('base64');
  }

  /**
   * Navigate to EINPresswire and purchase a press release package
   */
  async purchasePackage(packageType: 'basic' | 'premium' | 'enterprise' = 'basic'): Promise<PurchaseResult> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    // 1. Always start by logging in at /login-email
    const email = process.env.EINPRESSWIRE_EMAIL;
    const password = process.env.EINPRESSWIRE_PASSWORD;
    if (!email || !password) throw new Error('EINPresswire credentials not set in environment variables');

    try {
      console.log('🌐 Navigating directly to /login-email...');
      await this.page.goto('https://www.einpresswire.com/login-email', { waitUntil: 'domcontentloaded', timeout: 60000 });
      console.log('✅ /login-email page loaded');
    } catch (err) {
      console.error('❌ Failed to load /login-email:', err);
      await this.page.screenshot({ path: 'error_login_email_load.png' });
      throw err;
    }

    // 2. Wait for the login form, fill email and password, then log in
    try {
      console.log('🔍 Waiting for login form...');
      await this.page.waitForSelector('form[action="/login-email"]', { timeout: 10000 });
      console.log('✅ Login form found.');
      await this.page.fill('input#login', email);
      await this.page.fill('input#password', password);
      console.log('✅ Credentials filled. Waiting briefly before clicking Log In...');
      await this.page.waitForTimeout(500);
      // Click the Log In button within the form
      const loginBtn = this.page.locator('form[action="/login-email"] button[type="submit"]');
      await loginBtn.waitFor({ state: 'visible', timeout: 5000 });
      console.log('🖱️ Clicking Log In button (form-specific)...');
      await loginBtn.click({ force: true });
      // Wait for either navigation or dashboard element
      console.log('⏳ Waiting for navigation or dashboard after login...');
      await Promise.race([
        this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}),
        this.page.waitForSelector('a.gtm-upper_menu-click-submit_release', { timeout: 15000 }).catch(() => {})
      ]);
      console.log('✅ Login step complete.');
    } catch (err) {
      console.error('❌ Login step failed:', err);
      await this.page.screenshot({ path: 'error_login_email_submit.png' });
      throw err;
    }

    // 2. Now proceed to pricing and package selection as before
    console.log(`💳 Starting purchase process for ${packageType} package...`);
    try {
      await this.page.goto(`${this.baseUrl}/pricing`, { waitUntil: 'networkidle' });
      console.log('📄 Navigated to pricing page');

      // Take screenshot for debugging
      const pricingScreenshot = await this.takeScreenshot();
      
      // Try to dismiss cookie/consent banners or overlays that might block clicks
      try {
        const consentSelectors = [
          'button:has-text("I Agree")',
          'button:has-text("Accept")',
          'button[aria-label="Close"]',
          'button:has-text("×")',
          '.cc-allow',
          '.cc-accept',
          '.cookie-consent .close',
          '.cookie-bar .close'
        ];
        for (const s of consentSelectors) {
          const el = this.page.locator(s).first();
          if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
            await el.click({ force: true }).catch(() => {});
            console.log('🧹 Dismissed consent/overlay via selector:', s);
            break;
          }
        }
      } catch {}

      // Remove any fixed cookie bars/overlays that still block the bottom area
      try {
        await this.page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll<HTMLElement>('div, section, footer'));
          for (const el of elements) {
            const style = window.getComputedStyle(el);
            const text = (el.textContent || '').toLowerCase();
            if (
              (style.position === 'fixed' || style.position === 'sticky') &&
              /cookie|consent|terms|privacy/.test(text)
            ) {
              el.remove();
            }
          }
        });
        console.log('🧽 Removed fixed consent/cookie elements');
      } catch {}
      
      // Look for package selection buttons (more robust set of fallbacks)
      const candidates = [
        'Get Started',
        'Buy Now',
        'Select Plan',
        'Select',
        'Purchase',
        'Order Now',
        'Continue'
      ];

      const indexByPackage = packageType === 'basic' ? 0 : packageType === 'premium' ? 1 : 2;

      let packageButton = null as any;

      // Strategy 0a: explicit Basic anchor from site markup
      if (packageType === 'basic' && !packageButton) {
        try {
          const directBasicAnchor = this.page.locator('a.gtm-press_release_packages_up-basic-pricing, a[href*="plan=presswire-basic"]').first();
          await directBasicAnchor.waitFor({ timeout: 7000 });
          packageButton = directBasicAnchor;
          console.log('🔎 Found Basic plan via explicit anchor selector');
        } catch {}
      }

      // Strategy 0b: if explicitly choosing Basic, try to find the Select button within the Basic tile
      if (packageType === 'basic') {
        try {
          const basicTile = this.page.locator('div:has-text("Basic")').first();
          await basicTile.waitFor({ timeout: 5000 }).catch(() => {});
          const basicSelect = basicTile.locator('button:has-text("Select")').first();
          await basicSelect.waitFor({ timeout: 5000 });
          packageButton = basicSelect;
          console.log('🔎 Found Basic plan Select button via Basic tile text');
        } catch {}
      }

      // Strategy 1: buttons inside the pricing comparison table (column-based)
      if (!packageButton) {
        try {
          const tableButtons = this.page.locator('table a:has-text("Get Started"), table button:has-text("Get Started")');
          await tableButtons.first().waitFor({ timeout: 10000 });
          packageButton = tableButtons.nth(indexByPackage);
        await packageButton.waitFor({ timeout: 10000 });
          console.log('🔎 Found plan button via table column index');
        } catch {}
      }

      // Strategy 2: data attributes or explicit package classes
      const packageSelectors = {
        basic: '[data-package="basic"], .package-basic button, .plan-basic button',
        premium: '[data-package="premium"], .package-premium button, .plan-premium button',
        enterprise: '[data-package="enterprise"], .package-enterprise button, .plan-enterprise button'
      } as const;

      try {
        if (!packageButton) {
          packageButton = this.page.locator(packageSelectors[packageType]).first();
          await packageButton.waitFor({ timeout: 20000 });
        }
      } catch {
        // Strategy 3: buttons or links by text, pick the likely index
        const textSelector = candidates
          .map(t => `button:has-text("${t}"), a:has-text("${t}")`)
          .join(', ');
        try {
          packageButton = this.page.locator(textSelector).nth(indexByPackage);
          await packageButton.waitFor({ timeout: 20000 });
        } catch {
          // Strategy 4: any visible candidate text, choose first visible
          packageButton = this.page.locator(textSelector).first();
          await packageButton.waitFor({ timeout: 20000 });
        }
      }

      // Strategy 5: Last-resort DOM scan for a "Get Started"/"Select" button under a parent containing "Basic"
      if (!packageButton) {
        try {
          const clicked = await this.page.evaluate(() => {
            const texts = [/get started/i, /select/i, /buy now/i, /continue/i, /order/i];
            const candidates = Array.from(document.querySelectorAll('a, button'))
              .filter(el => texts.some(rx => rx.test(el.textContent || '')));
            function hasAncestorWith(el: HTMLElement, rx: RegExp) {
              let node = el.parentElement;
              for (let i = 0; i < 8 && node; i++) {
                const txt = (node.textContent || '').toLowerCase();
                if (rx.test(txt)) return true;
                node = node.parentElement as HTMLElement | null;
              }
              return false;
            }
            let target = candidates.find(el => hasAncestorWith(el as HTMLElement, /\bbasic\b/i));
            if (!target) target = candidates[0];
            if (target) {
              (target as HTMLElement).scrollIntoView({ block: 'center' });
              (target as HTMLElement).click();
              return true;
            }
            return false;
          });
          if (clicked) {
            console.log('✅ Clicked plan button via DOM scan');
          }
        } catch {}
      }

      // Click the package button
      if (packageButton) {
        await packageButton.scrollIntoViewIfNeeded().catch(() => {});
        await packageButton.click({ force: true });
      }
      console.log(`✅ Selected ${packageType} package`);

      // Wait for navigation to checkout or registration page
      await this.page.waitForLoadState('networkidle');
      
      // Check if we should use credits or require manual payment
      const useCredits = process.env.EIN_USE_PREPAID_CREDITS === 'true';
      const alwaysManual = process.env.EIN_USE_PREPAID_CREDITS === 'manual';
      
      if (alwaysManual) {
        console.log('🛑 Manual payment mode: stopping at checkout for admin approval');
        return {
          success: false,
          error: 'Manual payment required',
          requiresManualPayment: true
        };
      }
      
      if (useCredits) {
        console.log('💳 Credit mode: attempting to use prepaid credits');
        try {
          // Try to detect and use available credits
          const creditUsed = await this.attemptCreditPurchase();
          if (creditUsed) {
            console.log('✅ Credit applied successfully, proceeding to submission');
            // Continue to submission form
          } else {
            console.log('⚠️ No credits available, falling back to manual payment');
            return {
              success: false,
              error: 'No credits available, manual payment required',
              requiresManualPayment: true
            };
          }
        } catch (creditError) {
          console.log('❌ Credit application failed, falling back to manual payment');
          return {
            success: false,
            error: `Credit application failed: ${creditError}`,
            requiresManualPayment: true
          };
        }
      }
      
      // Handle possible registration/login requirement
      const currentUrl = this.page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('register') || currentUrl.includes('signup') || currentUrl.includes('login')) {
        console.log('🔐 Registration/login required, proceeding with account creation...');
        
        // Generate random credentials for this session
        const timestamp = Date.now();
        const credentials = {
          username: `bravapress_${timestamp}@temp-mail.org`,
          password: `BravaPress${timestamp}!`,
          submissionUrl: ''
        };

        // Fill registration form
        await this.fillRegistrationForm(credentials);
        
        // Complete checkout process
        await this.completeCheckout();
        
        // Get submission URL from confirmation page
        credentials.submissionUrl = await this.getSubmissionUrl();
        
        return {
          success: true,
          orderId: `ORDER_${timestamp}`,
          accessCredentials: credentials
        };
      }

      // If no registration required, proceed directly to checkout
      await this.completeCheckout();
      
      return {
        success: true,
        orderId: `ORDER_${Date.now()}`
      };

    } catch (error) {
      console.error('❌ Purchase failed:', error);
      
      // Take error screenshot
      const errorScreenshot = await this.takeScreenshot().catch(() => null);
      
      return {
        success: false,
        error: `Purchase failed: ${error}`
      };
    }
  }

  /**
   * Fill registration form with generated credentials
   */
  private async fillRegistrationForm(credentials: { username: string; password: string }): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    console.log('📝 Filling registration form...');

    // Common registration field selectors
    const emailSelectors = ['input[name="email"]', 'input[type="email"]', '#email', '[placeholder*="email" i]'];
    const passwordSelectors = ['input[name="password"]', 'input[type="password"]', '#password', '[placeholder*="password" i]'];
    const confirmPasswordSelectors = ['input[name="confirm_password"]', 'input[name="password_confirmation"]', '#confirm_password'];
    const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Sign Up")', 'button:has-text("Register")'];

    // Fill email
    for (const selector of emailSelectors) {
      try {
        await this.page.fill(selector, credentials.username);
        console.log(`✅ Filled email with selector: ${selector}`);
        break;
      } catch {
        continue;
      }
    }

    // Fill password
    for (const selector of passwordSelectors) {
      try {
        await this.page.fill(selector, credentials.password);
        console.log(`✅ Filled password with selector: ${selector}`);
        break;
      } catch {
        continue;
      }
    }

    // Fill confirm password if present
    for (const selector of confirmPasswordSelectors) {
      try {
        await this.page.fill(selector, credentials.password);
        console.log(`✅ Filled confirm password with selector: ${selector}`);
        break;
      } catch {
        continue;
      }
    }

    // Submit form
    for (const selector of submitSelectors) {
      try {
        await this.page.click(selector);
        console.log(`✅ Submitted form with selector: ${selector}`);
        break;
      } catch {
        continue;
      }
    }

    // Wait for navigation
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Complete the checkout process
   */
  private async completeCheckout(): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    console.log('💳 Completing checkout process...');

    // This is a simulation - in production, you'd need to handle actual payment
    // For testing purposes, we'll look for checkout completion or redirect
    
    try {
      // Wait for checkout page to load
      await this.page.waitForTimeout(2000);
      
      // Look for payment form elements
      const paymentSelectors = [
        'input[name="card_number"]',
        'input[name="cardnumber"]', 
        '#card_number',
        '[placeholder*="card" i]'
      ];

      let paymentFormFound = false;
      for (const selector of paymentSelectors) {
        if (await this.page.locator(selector).count() > 0) {
          paymentFormFound = true;
          console.log('💳 Payment form detected');
          break;
        }
      }

      if (paymentFormFound) {
        // In production, you would integrate with actual payment processing
        // For now, we'll simulate successful payment
        console.log('⚠️ Payment simulation - would process actual payment in production');
        
        // Wait for potential redirect after payment
        await this.page.waitForTimeout(3000);
      }

    } catch (error) {
      console.log('⚠️ Checkout process completed with potential variations:', error);
    }
  }

  /**
   * Get the submission URL after successful purchase
   */
  private async getSubmissionUrl(): Promise<string> {
    if (!this.page) throw new Error('Page not available');

    try {
      // Look for submission links or dashboard URLs
      const submissionLinkSelectors = [
        'a[href*="submit"]',
        'a[href*="dashboard"]',
        'a[href*="create"]',
        'text="Submit Press Release"',
        'text="Create Press Release"'
      ];

      for (const selector of submissionLinkSelectors) {
        try {
          const link = this.page.locator(selector).first();
          if (await link.count() > 0) {
            const href = await link.getAttribute('href');
            if (href) {
              return href.startsWith('http') ? href : `${this.baseUrl}${href}`;
            }
          }
        } catch {
          continue;
        }
      }

      // Default fallback
      return `${this.baseUrl}/dashboard/submit`;
      
    } catch (error) {
      console.error('⚠️ Could not find submission URL:', error);
      return `${this.baseUrl}/dashboard`;
    }
  }

  /**
   * Submit a press release after successful purchase
   */
  async submitPressRelease(submission: PressReleaseSubmission, accessCredentials?: any): Promise<SubmissionResult> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    console.log('📤 Starting press release submission...');
    
    try {
      // Log incoming submission payload (redact long body)
      try {
        console.log('🧾 Submission payload (pre-flight):', {
          titlePresent: !!submission.title,
          summaryPresent: !!submission.summary,
          contentLength: submission.content?.length || 0,
          companyName: submission.companyName,
          contactName: submission.contactName,
          contactEmail: submission.contactEmail,
          contactPhonePresent: !!submission.contactPhone,
          websiteUrlPresent: !!submission.websiteUrl,
          industry: submission.industry,
          location: submission.location,
          scheduledDate: submission.scheduledDate?.toISOString?.() || null
        })
      } catch {}

      // 1) Ensure we're logged in
      await this.ensureLoggedIn();

      // 2) Go to EIN "Create Your Press Release" (Step 1) and fill required fields
      const editUrl = `${this.baseUrl}/press-releases/edit`;
      await this.page.goto(editUrl, { waitUntil: 'networkidle' });
      console.log(`📄 Navigated to edit page: ${editUrl}`);

      // Ensure the Step 1 form is present; try alternatives if needed
      const editCandidates = [
        'form#pr_edit_form',
        '#title',
        'input[name="title"]'
      ];
      let foundEdit = false;
      for (const sel of editCandidates) {
        if (await this.page.locator(sel).first().isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log(`🔎 Found edit selector: ${sel}`);
          foundEdit = true;
          break;
        }
      }
      if (!foundEdit) {
        console.log('🧭 Edit form not found; trying alternate paths');
        const altUrls = [
          `${this.baseUrl}/press-releases/create`,
          `${this.baseUrl}/press-releases/new`,
          `${this.baseUrl}/press-releases/edit`
        ];
        for (const url of altUrls) {
          try {
            await this.page.goto(url, { waitUntil: 'networkidle' });
            console.log(`🔁 Navigated alternative: ${url}`);
            for (const sel of editCandidates) {
              if (await this.page.locator(sel).first().isVisible({ timeout: 3000 }).catch(() => false)) {
                console.log(`🔎 Found edit selector on alt: ${sel}`);
                foundEdit = true;
                break;
              }
            }
            if (foundEdit) break;
          } catch {}
        }
        // Last resort: click header CTA if present
        if (!foundEdit) {
          try {
            const cta = this.page.locator('a.gtm-upper_menu-click-submit_release').first();
            if (await cta.isVisible({ timeout: 2000 }).catch(() => false)) {
              await cta.click({ force: true });
              await this.page.waitForLoadState('networkidle');
              for (const sel of editCandidates) {
                if (await this.page.locator(sel).first().isVisible({ timeout: 3000 }).catch(() => false)) {
                  console.log(`🔎 Found edit selector via CTA: ${sel}`);
                  foundEdit = true;
                  break;
                }
              }
            }
          } catch {}
        }
      }

      // If redirected to login, perform login then retry edit URL once
      try {
        const cur = this.page.url();
        if (/\/login/.test(cur)) {
          console.log('🔁 Detected login redirect; logging in and retrying edit page');
          await this.ensureLoggedIn();
          await this.page.goto(editUrl, { waitUntil: 'networkidle' });
        }
      } catch {}

      // Log current URL and title for debugging
      try {
        const curUrl = this.page.url();
        const title = await this.page.title();
        console.log('🌐 Page context before fill:', { curUrl, title });
      } catch {}

      await this.fillEINEditStepOne(submission);

      // 2) Click Continue to Step 2 (Preview)
      try {
        const continueBtn = this.page.locator('button[name="preview"], button:has-text("Continue to Step 2"), button:has-text("Preview")').first();
        await continueBtn.waitFor({ timeout: 10000 });
        await continueBtn.scrollIntoViewIfNeeded().catch(() => {});
        await continueBtn.click({ force: true });
        await this.page.waitForLoadState('networkidle');
        console.log('➡️ Advanced to Step 2 (Preview)');
      } catch (e) {
        // Check for form errors
        try {
          const hasErrors = await this.page.locator('#flash_error').isVisible({ timeout: 2000 }).catch(() => false);
          if (hasErrors) {
            const errText = await this.page.locator('#flash_error').innerText().catch(() => 'Unknown validation error');
            throw new Error(`EIN validation errors: ${errText}`);
          }
        } catch {}
        throw e;
      }

      // 3) From preview, proceed to Step 3 (Choose Your Distribution)
      try {
        const step3Link = this.page.locator('a[href="/press-releases/edit-location"]').first();
        if (await step3Link.isVisible({ timeout: 4000 }).catch(() => false)) {
          await step3Link.click({ force: true });
          await this.page.waitForLoadState('networkidle');
        } else {
          // Fallback: try generic proceed controls, else go directly by URL
          const proceedSelectors = [
            'button:has-text("Continue")',
            'button:has-text("Proceed")',
            'a:has-text("Continue")',
            'a:has-text("Proceed")',
            'button:has-text("Step 3")',
          ];
          let clicked = false;
          for (const s of proceedSelectors) {
            const el = this.page.locator(s).first();
            if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
              await el.click({ force: true });
              await this.page.waitForLoadState('networkidle');
              clicked = true;
              break;
            }
          }
          if (!clicked) {
            await this.page.goto(`${this.baseUrl}/press-releases/edit-location`, { waitUntil: 'domcontentloaded' });
          }
        }
        console.log('➡️ Arrived at Step 3 (Choose Your Distribution)');
      } catch {}

      // 4) Fill Step 3 selections (industry and country) and submit for review
      await this.fillEINEditStepThree(submission);
      try {
        const publishBtn = this.page.locator('button[name="save_and_publish"]').first();
        await publishBtn.waitFor({ timeout: 8000 });
        await publishBtn.scrollIntoViewIfNeeded().catch(() => {});
        await publishBtn.click({ force: true });
        await this.page.waitForLoadState('networkidle');
        console.log('✅ Step 3 submitted (Save & Submit for Review)');

        // Handle overlay: click "Submit for Review" anchor if shown
        try {
          const overlaySubmit = this.page.locator('a.js_confirm_publish[href*="/press-releases/publish/"]').first();
          if (await overlaySubmit.isVisible({ timeout: 4000 }).catch(() => false)) {
            const href = await overlaySubmit.getAttribute('href');
            console.log(`🟢 Overlay present; will click Submit for Review (${href || ''})`);
            await overlaySubmit.click({ force: true });
            await this.page.waitForLoadState('networkidle');

            // If a confirmation popup appears, check required boxes and submit
            await this.handleReviewConfirmation().catch(() => {});
          } else {
            // Fallback: try to extract hidden overlay container and navigate directly
            const publishHref = await this.page.locator('div.channels-save-choice a.js_confirm_publish').getAttribute('href').catch(() => null);
            if (publishHref) {
              console.log(`🧭 Navigating directly to publish URL: ${publishHref}`);
              await this.page.goto(this.absoluteUrl(publishHref), { waitUntil: 'domcontentloaded' });
              await this.page.waitForLoadState('networkidle');

              // Also handle confirmation popup if shown on this route
              await this.handleReviewConfirmation().catch(() => {});
            }
          }
        } catch {}
      } catch (e) {
        console.log('⚠️ Could not click Submit for Review button, proceeding to capture final state');
      }

      const finalUrl = this.page.url();
      const successScreenshot = await this.takeScreenshot();

      return {
        success: true,
        submissionId: `SUBMISSION_${Date.now()}`,
        confirmationUrl: finalUrl,
        screenshots: [successScreenshot]
      };

    } catch (error) {
      console.error('❌ Submission failed:', error);
      
      // Take error screenshot
      const errorScreenshot = await this.takeScreenshot().catch(() => null);
      
      return {
        success: false,
        error: `Submission failed: ${error}`,
        screenshots: errorScreenshot ? [errorScreenshot] : []
      };
    }
  }

  /**
   * Fill the press release submission form
   */
  private async fillSubmissionForm(submission: PressReleaseSubmission): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    console.log('📝 Filling submission form...');

    // Common field mappings
    const fieldMappings = {
      title: ['input[name="title"]', '#title', '[placeholder*="title" i]'],
      content: ['textarea[name="content"]', 'textarea[name="body"]', '#content', '#body'],
      summary: ['textarea[name="summary"]', 'textarea[name="description"]', '#summary'],
      company: ['input[name="company"]', 'input[name="company_name"]', '#company'],
      contact_name: ['input[name="contact_name"]', 'input[name="contact"]', '#contact_name'],
      contact_email: ['input[name="contact_email"]', 'input[name="email"]', '#contact_email'],
      contact_phone: ['input[name="contact_phone"]', 'input[name="phone"]', '#contact_phone'],
      website: ['input[name="website"]', 'input[name="website_url"]', '#website'],
      location: ['input[name="location"]', 'input[name="city"]', '#location']
    };

    // Fill each field with retry logic
    const fillField = async (fieldType: keyof typeof fieldMappings, value: string) => {
      const selectors = fieldMappings[fieldType];
      for (const selector of selectors) {
        try {
          await this.page!.fill(selector, value);
          console.log(`✅ Filled ${fieldType}: ${selector}`);
          return;
        } catch {
          continue;
        }
      }
      console.log(`⚠️ Could not find field for ${fieldType}`);
    };

    // Fill all fields
    await fillField('title', submission.title);
    await fillField('content', submission.content);
    await fillField('summary', submission.summary);
    await fillField('company', submission.companyName);
    await fillField('contact_name', submission.contactName);
    await fillField('contact_email', submission.contactEmail);
    
    if (submission.contactPhone) {
      await fillField('contact_phone', submission.contactPhone);
    }
    
    if (submission.websiteUrl) {
      await fillField('website', submission.websiteUrl);
    }
    
    await fillField('location', submission.location);

    // Handle industry selection if dropdown exists
    try {
      const industrySelectors = ['select[name="industry"]', '#industry', '[name="category"]'];
      for (const selector of industrySelectors) {
        if (await this.page.locator(selector).count() > 0) {
          await this.page.selectOption(selector, { label: submission.industry });
          console.log(`✅ Selected industry: ${submission.industry}`);
          break;
        }
      }
    } catch (error) {
      console.log('⚠️ Could not set industry:', error);
    }
  }

  /**
   * Fill EIN "Create Your Press Release" Step 1 form using concrete selectors
   */
  private async fillEINEditStepOne(submission: PressReleaseSubmission): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    // Helper: safe fill
    const tryFill = async (selector: string, value?: string) => {
      if (!value) {
        console.log(`⏭️ Skipped ${selector} (empty value)`);
        return;
      }
      try {
        const loc = this.page!.locator(selector).first();
        const count = await loc.count();
        if (count > 0) {
          await loc.fill(value);
          console.log(`✅ Filled ${selector}`);
        } else {
          console.log(`⚠️ Selector not found: ${selector}`);
        }
      } catch (e) {
        console.log(`❌ Failed to fill ${selector}:`, e);
      }
    };

    // Helper: select by label or value
    const trySelect = async (selector: string, opts: { label?: string; value?: string }) => {
      try {
        const selected = await this.page!.selectOption(selector, opts as any);
        console.log(`✅ Selected ${JSON.stringify(opts)} on ${selector} -> ${selected}`);
      } catch (e) {
        console.log(`❌ Failed select on ${selector} with ${JSON.stringify(opts)}:`, e);
      }
    };

    // Title, summary, body
    await tryFill('#title', submission.title);
    const shortSummary = submission.summary ? submission.summary.slice(0, 160) : undefined;
    await tryFill('#subtitle', shortSummary);
    await tryFill('#text', submission.content);

    // Location parsing: "City, State, Country" | "City, Country" | single token
    let city: string | undefined;
    let state: string | undefined;
    let countryGuess: string | undefined;
    if (submission.location) {
      const parts = submission.location.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length === 1) {
        city = parts[0];
      } else if (parts.length === 2) {
        city = parts[0];
        countryGuess = parts[1];
      } else if (parts.length >= 3) {
        city = parts[0];
        state = parts[1];
        countryGuess = parts[2];
      }
    }

    await tryFill('#location_city', city || submission.location);
    await tryFill('#location_state', state);
    if (countryGuess) {
      await trySelect('#location_country_select', { label: countryGuess });
    }
    // Fallback country to United States if required select is empty
    try {
      const val = await this.page.locator('#location_country_select').inputValue().catch(() => '');
      if (!val) {
        await trySelect('#location_country_select', { label: 'United States' });
      }
    } catch {}

    // Language (default to English)
    try {
      await trySelect('#language', { value: 'en' });
    } catch {}

    // Release timing: immediate or scheduled
    if (submission.scheduledDate) {
      try {
        await this.page.check('#release_date_active_yes');
        const date = submission.scheduledDate;
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = String(date.getFullYear());
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        await tryFill('#release_date', `${mm}/${dd}/${yyyy}`);
        await tryFill('#release_time', `${hh}:${min}`);
        // Default timezone to Eastern if not specified via UI (selector exists on page)
        await trySelect('#release_time_zone', { value: 'America/New_York' });
      } catch {}
    } else {
      try {
        await this.page.check('#release_date_active_no');
      } catch {}
    }

    // Contact
    await tryFill('#contact_name', submission.contactName);
    await tryFill('#contact_organization', submission.companyName);
    await tryFill('#contact_phone', submission.contactPhone);
    await tryFill('#contact_email', submission.contactEmail);

    // Verify filled values (log)
    try {
      const filled = await this.page.evaluate(() => ({
        title: (document.querySelector('#title') as HTMLInputElement)?.value || '',
        subtitle: (document.querySelector('#subtitle') as HTMLTextAreaElement)?.value || '',
        textLen: (document.querySelector('#text') as HTMLTextAreaElement)?.value.length || 0,
        city: (document.querySelector('#location_city') as HTMLInputElement)?.value || '',
        country: (document.querySelector('#location_country_select') as HTMLSelectElement)?.value || '',
        contact_name: (document.querySelector('#contact_name') as HTMLInputElement)?.value || '',
        contact_org: (document.querySelector('#contact_organization') as HTMLInputElement)?.value || '',
        contact_email: (document.querySelector('#contact_email') as HTMLInputElement)?.value || ''
      }));
      console.log('🧪 Step 1 filled snapshot:', filled);
      const missing: string[] = [];
      if (!filled.title) missing.push('title');
      if (!filled.textLen) missing.push('text');
      if (!filled.contact_name) missing.push('contact_name');
      if (!filled.contact_email) missing.push('contact_email');
      if (!filled.city) missing.push('location_city');
      if (!filled.country) missing.push('location_country_select');
      if (missing.length) {
        console.log('⚠️ Step 1 missing after fill:', missing);
      } else {
        console.log('✅ Step 1 required fields present');
      }
    } catch {}
  }

  /**
   * Set scheduled publication date
   */
  private async setScheduledDate(scheduledDate: Date): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    console.log('📅 Setting scheduled date...');

    try {
      // Look for date input fields
      const dateSelectors = [
        'input[type="date"]',
        'input[name="publish_date"]',
        'input[name="scheduled_date"]',
        '#publish_date',
        '#scheduled_date'
      ];

      const dateString = scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      for (const selector of dateSelectors) {
        try {
          await this.page.fill(selector, dateString);
          console.log(`✅ Set scheduled date: ${dateString}`);
          return;
        } catch {
          continue;
        }
      }

      console.log('⚠️ Could not find date input field');
    } catch (error) {
      console.error('❌ Failed to set scheduled date:', error);
    }
  }

  /**
   * Submit the completed form
   */
  private async submitForm(): Promise<string> {
    if (!this.page) throw new Error('Page not available');

    console.log('🚀 Submitting form...');

    // Look for submit buttons
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Publish")',
      'button:has-text("Send")',
      '.submit-btn',
      '#submit'
    ];

    for (const selector of submitSelectors) {
      try {
        await this.page.click(selector);
        console.log(`✅ Clicked submit button: ${selector}`);
        break;
      } catch {
        continue;
      }
    }

    // Wait for submission to complete
    await this.page.waitForLoadState('networkidle');
    
    // Extract submission ID from confirmation page
    try {
      const submissionIdPatterns = [
        /submission[:\s]+([A-Z0-9-]+)/i,
        /reference[:\s]+([A-Z0-9-]+)/i,
        /id[:\s]+([A-Z0-9-]+)/i
      ];

      const pageText = await this.page.textContent('body') || '';
      
      for (const pattern of submissionIdPatterns) {
        const match = pageText.match(pattern);
        if (match) {
          return match[1];
        }
      }
      
      // Fallback: generate ID from timestamp
      return `SUBMISSION_${Date.now()}`;
      
    } catch (error) {
      console.log('⚠️ Could not extract submission ID:', error);
      return `SUBMISSION_${Date.now()}`;
    }
  }

  /**
   * Attempt to use prepaid credits for the current package
   */
  private async attemptCreditPurchase(): Promise<boolean> {
    if (!this.page) throw new Error('Page not available');
    
    try {
      // Wait for checkout page to load
      await this.page.waitForLoadState('networkidle');
      
      // Look for credit-related elements
      const creditSelectors = [
        'text=Use Credit',
        'text=Use Credit(s)',
        'text=Available Credits',
        'label:has-text("Use Credit") input[type="radio"]',
        'input[type="radio"][value*="credit"]',
        'button:has-text("Use Credit")',
        'input[name*="credit"]',
        'select[name*="credit"]'
      ];
      
      let creditElement = null;
      
      // Try to find a credit option
      for (const selector of creditSelectors) {
        try {
          const el = this.page.locator(selector).first();
          if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
            creditElement = el;
            console.log(`🔍 Found credit option: ${selector}`);
            break;
          }
        } catch {}
      }
      
      if (!creditElement) {
        console.log('❌ No credit options found on checkout page');
        return false;
      }
      
      // Select/click the credit option
      await creditElement.click({ force: true });
      console.log('✅ Credit option selected');
      
      // Look for confirmation/submit buttons
      const confirmSelectors = [
        'button:has-text("Place Order")',
        'button:has-text("Submit")',
        'button:has-text("Complete Order")',
        'button:has-text("Confirm")',
        'input[type="submit"][value*="Order"]',
        'input[type="submit"][value*="Submit"]'
      ];
      
      let orderButton = null;
      
      // Find and click the order confirmation button
      for (const selector of confirmSelectors) {
        try {
          const btn = this.page.locator(selector).first();
          if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
            orderButton = btn;
            console.log(`🔍 Found order button: ${selector}`);
            break;
          }
        } catch {}
      }
      
      if (!orderButton) {
        console.log('❌ No order confirmation button found');
        return false;
      }
      
      // Click the order button
      await orderButton.scrollIntoViewIfNeeded().catch(() => {});
      await orderButton.click({ force: true });
      console.log('✅ Order button clicked');
      
      // Wait for navigation to complete
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Check if we landed on a submission form or success page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/submit') || currentUrl.includes('/dashboard') || currentUrl.includes('success')) {
        console.log('✅ Credit purchase successful, landed on submission page');
        return true;
      }
      
      // If we're still on checkout, something went wrong
      if (currentUrl.includes('/buy') || currentUrl.includes('/checkout')) {
        console.log('❌ Still on checkout page after credit attempt');
        return false;
      }
      
      // If we navigated somewhere else, assume success
      console.log('✅ Credit purchase appears successful, navigated to:', currentUrl);
      return true;
      
    } catch (error) {
      console.error('❌ Error during credit purchase attempt:', error);
      return false;
    }
  }

  /**
   * Fill EIN Step 3 (Choose Your Distribution) selections
   */
  private async fillEINEditStepThree(submission: PressReleaseSubmission): Promise<void> {
    if (!this.page) throw new Error('Page not available');

    // Derive labels
    const industryLabel = submission.industry || 'Technology';
    // Try to derive a country from location string
    let countryLabel: string | undefined;
    if (submission.location) {
      const parts = submission.location.split(',').map(s => s.trim()).filter(Boolean);
      countryLabel = parts.length >= 2 ? parts[parts.length - 1] : undefined;
    }
    if (!countryLabel) countryLabel = 'United States';

    console.log('🎯 Step 3 targets:', { industryLabel, countryLabel });

    // Find all channel selects and assign first matching industry and country by label
    try {
      const assigned = await this.page.evaluate(({ industryLabel, countryLabel }) => {
        const selects = Array.from(document.querySelectorAll<HTMLSelectElement>('select[name="channels[]"]'));
        let industryDone = false;
        let countryDone = false;
        for (const sel of selects) {
          const hasIndustry = Array.from(sel.options).some(o => o.text.trim().toLowerCase() === industryLabel.trim().toLowerCase());
          const hasCountry = Array.from(sel.options).some(o => o.text.trim().toLowerCase() === countryLabel!.trim().toLowerCase());
          if (!industryDone && hasIndustry) {
            const opt = Array.from(sel.options).find(o => o.text.trim().toLowerCase() === industryLabel.trim().toLowerCase());
            if (opt) sel.value = opt.value;
            industryDone = true;
            continue;
          }
          if (!countryDone && hasCountry) {
            const opt = Array.from(sel.options).find(o => o.text.trim().toLowerCase() === countryLabel!.trim().toLowerCase());
            if (opt) sel.value = opt.value;
            countryDone = true;
            continue;
          }
        }
        return { industryDone, countryDone, total: selects.length };
      }, { industryLabel, countryLabel });
      console.log(`✅ Step 3 selection set:`, assigned);
    } catch (e) {
      console.log('⚠️ Could not auto-select Step 3 channels:', e);
    }
  }

  /**
   * Handle confirmation modal on publish: tick required boxes and click Submit for Review
   */
  private async handleReviewConfirmation(): Promise<void> {
    if (!this.page) return;
    try {
      // Wait briefly for the modal container
      const modal = this.page.locator('div.popup-sure_to_publish, div.msg-overlay');
      const visible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
      if (!visible) return;

      const checks = ['#permission', '#images', '#links', '#decline'];
      for (const sel of checks) {
        try {
          const cb = this.page.locator(sel).first();
          if (await cb.count() > 0) {
            await cb.check({ force: true }).catch(() => {});
          }
        } catch {}
      }

      // The submit button inside this modal can be an anchor with disabled class
      const submitSelectors = [
        'a.close_popup_send:not(.disabled)',
        'a.a-button--green:not(.disabled)',
        'button:has-text("Submit for Review")'
      ];
      for (const s of submitSelectors) {
        const el = this.page.locator(s).first();
        if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
          await el.click({ force: true });
          await this.page.waitForLoadState('networkidle');
          console.log('🟢 Submitted from confirmation modal');
          return;
        }
      }
    } catch {}
  }

  /**
   * Clean up browser resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up browser resources...');
    
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  /**
   * Retry wrapper for operations
   */
  private async withRetry<T>(operation: () => Promise<T>, retries: number = this.maxRetries): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${retries}`);
        return await operation();
      } catch (error) {
        console.log(`❌ Attempt ${attempt} failed:`, error);
        lastError = error as Error;
        
        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.page?.waitForTimeout(delay);
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Demo mode: Navigate through EINPresswire and test form filling without actual submission
   */
  async demoNavigationTest(submission: PressReleaseSubmission): Promise<{ screenshots: string[]; message: string }> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log('🎭 Starting demo navigation test...');
    const screenshots: string[] = [];
    
    try {
      // Step 1: Navigate to homepage
      console.log('📄 Demo Step 1: Navigating to EINPresswire homepage...');
      await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      let screenshot = await this.takeScreenshot();
      screenshots.push(screenshot);
      console.log('✅ Homepage loaded successfully');
      
      // Wait for user to see
      await this.page.waitForTimeout(2000);

      // Step 2: Navigate to pricing page
      console.log('💰 Demo Step 2: Navigating to pricing page...');
      await this.page.goto(`${this.baseUrl}/pricing`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      screenshot = await this.takeScreenshot();
      screenshots.push(screenshot);
      console.log('✅ Pricing page loaded successfully');
      
      // Wait and analyze pricing options
      await this.page.waitForTimeout(2000);

      // Step 3: Look for pricing packages (without clicking)
      console.log('🔍 Demo Step 3: Analyzing pricing packages...');
      const packageSelectors = [
        'button:has-text("Get Started")',
        'button:has-text("Buy Now")',
        'a:has-text("Get Started")',
        'a:has-text("Buy Now")',
        '[class*="package"]',
        '[class*="pricing"]'
      ];

      let foundPackages = 0;
      for (const selector of packageSelectors) {
        try {
          const count = await this.page.locator(selector).count();
          if (count > 0) {
            console.log(`✅ Found ${count} elements matching: ${selector}`);
            foundPackages += count;
          }
        } catch (error) {
          // Continue
        }
      }

      console.log(`📊 Total pricing elements found: ${foundPackages}`);

      // Step 4: Try to navigate to submission page (if accessible)
      console.log('📝 Demo Step 4: Looking for submission forms...');
      try {
        // Try common submission URLs
        const submissionUrls = [
          `${this.baseUrl}/submit`,
          `${this.baseUrl}/press-release-submission`,
          `${this.baseUrl}/new-release`,
          `${this.baseUrl}/create`
        ];

        for (const url of submissionUrls) {
          try {
            console.log(`🔍 Trying: ${url}`);
            await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            
            // Check if we found a form
            const formCount = await this.page.locator('form').count();
            const inputCount = await this.page.locator('input').count();
            
            if (formCount > 0 || inputCount > 0) {
              console.log(`✅ Found submission form at: ${url}`);
              console.log(`📋 Forms: ${formCount}, Inputs: ${inputCount}`);
              
              screenshot = await this.takeScreenshot();
              screenshots.push(screenshot);
              
              // Demo form filling (without submitting)
              await this.demoFormFilling(submission);
              break;
            }
          } catch (error) {
            console.log(`❌ ${url} not accessible`);
            continue;
          }
        }
      } catch (error) {
        console.log('⚠️ Could not access submission forms - may require account');
      }

      // Step 5: Final screenshot
      screenshot = await this.takeScreenshot();
      screenshots.push(screenshot);

      console.log('🎉 Demo navigation test completed successfully!');
      
      return {
        screenshots,
        message: `Demo completed: Found ${foundPackages} pricing elements, captured ${screenshots.length} screenshots`
      };

    } catch (error) {
      console.error('❌ Demo navigation failed:', error);
      
      // Take error screenshot
      try {
        const errorScreenshot = await this.takeScreenshot();
        screenshots.push(errorScreenshot);
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
      
      return {
        screenshots,
        message: `Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Demo form filling - shows how forms would be filled without actually submitting
   */
  private async demoFormFilling(submission: PressReleaseSubmission): Promise<void> {
    if (!this.page) return;

    console.log('📝 Demo: Practicing form filling...');

    // Common form field selectors
    const fieldMappings = {
      title: ['input[name="title"]', '#title', '[placeholder*="title" i]'],
      content: ['textarea[name="content"]', 'textarea[name="body"]', '#content'],
      company: ['input[name="company"]', 'input[name="company_name"]', '#company'],
      contact: ['input[name="contact_name"]', 'input[name="contact"]', '#contact'],
      email: ['input[name="email"]', 'input[name="contact_email"]', '#email']
    };

    // Try to fill demo data (but don't submit)
    for (const [fieldType, selectors] of Object.entries(fieldMappings)) {
      for (const selector of selectors) {
        try {
          if (await this.page.locator(selector).count() > 0) {
            console.log(`✅ Demo: Found ${fieldType} field with selector: ${selector}`);
            
            // Fill with demo data (but clear it immediately to not mess up the site)
            await this.page.fill(selector, 'DEMO_TEST_DATA');
            await this.page.waitForTimeout(500); // Show it's filled
            await this.page.fill(selector, ''); // Clear it
            
            console.log(`✅ Demo: Successfully tested ${fieldType} field`);
            break;
          }
        } catch (error) {
          continue;
        }
      }
    }

    console.log('✅ Demo form filling test completed');
  }
}

// Convenience function for one-time operations
export async function automatePressReleaseSubmission(
  submission: PressReleaseSubmission,
  packageType: 'basic' | 'premium' | 'enterprise' = 'basic',
  headless: boolean = true
): Promise<{ purchase: PurchaseResult; submission: SubmissionResult }> {
  
  const automation = new EINPresswireAutomation();
  
  try {
    await automation.initialize(headless);
    
    const purchaseResult = await automation.purchasePackage(packageType);
    
    if (!purchaseResult.success) {
      throw new Error(`Purchase failed: ${purchaseResult.error}`);
    }
    
    const submissionResult = await automation.submitPressRelease(submission, purchaseResult.accessCredentials);
    
    return {
      purchase: purchaseResult,
      submission: submissionResult
    };
    
  } finally {
    await automation.cleanup();
  }
} 