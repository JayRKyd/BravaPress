# Supabase HTTPS Setup Guide for Production Deployment (Windows)

## **Current Issue**

Your BravaPress application has been successfully deployed to Vercel at:
**https://v0-brava-press-header.vercel.app**

However, it cannot connect to your self-hosted Supabase instance because of a **Mixed Content Security Error**:

- **Vercel App**: HTTPS (secure)
- **Your Supabase**: HTTP at `135.148.41.27:8000` (insecure)
- **Browser blocks**: HTTP requests from HTTPS sites for security

## **Why This Matters for ALL Production Apps**

This HTTPS requirement isn't just for our deployment - **any production application** you build will need this:

- **Modern browsers** require HTTPS for production sites
- **Payment processing** (Stripe, PayPal) requires HTTPS
- **OAuth authentication** providers require HTTPS
- **SEO ranking** - Google penalizes non-HTTPS sites
- **Security compliance** for handling user data
- **Progressive Web App** features require HTTPS

---

## **Solution: Enable HTTPS on Your Self-Hosted Supabase (Windows Server)**

### **Option 1: Using Nginx on Windows Server (Recommended)**

#### **Step 1: Install Nginx for Windows**
1. Download Nginx for Windows from: http://nginx.org/en/download.html
2. Extract to `C:\nginx`
3. Open Command Prompt as Administrator
4. Navigate to nginx directory:
```cmd
cd C:\nginx
```

#### **Step 2: Get SSL Certificate**

**Option A: Using Let's Encrypt with Certbot for Windows**
1. Download Certbot for Windows from: https://certbot.eff.org/instructions?ws=other&os=windows
2. Install Certbot
3. Open PowerShell as Administrator and run:
```powershell
certbot certonly --standalone -d your-supabase-domain.com
```

**Option B: Using Existing Certificate**
- Place your certificate files in `C:\nginx\ssl\`
- Create the directory if it doesn't exist

#### **Step 3: Configure Nginx**

Edit `C:\nginx\conf\nginx.conf` and replace the content with:

```nginx
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    # HTTP server (redirect to HTTPS)
    server {
        listen 80;
        server_name your-supabase-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-supabase-domain.com;

        # SSL Configuration (Let's Encrypt paths)
        ssl_certificate C:/Certbot/live/your-supabase-domain.com/fullchain.pem;
        ssl_certificate_key C:/Certbot/live/your-supabase-domain.com/privkey.pem;
        
        # Or if using custom certificates:
        # ssl_certificate C:/nginx/ssl/your-certificate.crt;
        # ssl_certificate_key C:/nginx/ssl/your-private-key.key;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Proxy to your Supabase instance
        location / {
            proxy_pass http://135.148.41.27:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support for Realtime
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

#### **Step 4: Start Nginx as Windows Service**
1. Test the configuration:
```cmd
cd C:\nginx
nginx -t
```

2. Start Nginx:
```cmd
nginx
```

3. To stop Nginx:
```cmd
nginx -s stop
```

4. To reload configuration:
```cmd
nginx -s reload
```

**Optional: Install as Windows Service**
1. Download NSSM (Non-Sucking Service Manager): https://nssm.cc/download
2. Extract and run as Administrator:
```cmd
nssm install nginx
```
3. Set path to: `C:\nginx\nginx.exe`
4. Start the service:
```cmd
net start nginx
```

### **Option 2: Using Caddy on Windows (Automatic HTTPS)**

#### **Step 1: Install Caddy for Windows**
1. Download Caddy for Windows from: https://caddyserver.com/download
2. Extract `caddy.exe` to `C:\caddy\`
3. Open Command Prompt as Administrator

#### **Step 2: Configure Caddy**

Create `C:\caddy\Caddyfile` with the following content:

```caddy
your-supabase-domain.com {
    reverse_proxy 135.148.41.27:8000
}
```

#### **Step 3: Start Caddy**
1. Navigate to Caddy directory:
```cmd
cd C:\caddy
```

2. Run Caddy:
```cmd
caddy run
```

**Install as Windows Service:**
1. Install Caddy as a service:
```cmd
caddy add-package github.com/caddyserver/caddy/v2/cmd/caddy-service
sc create caddy binPath="C:\caddy\caddy.exe run --config C:\caddy\Caddyfile"
```

2. Start the service:
```cmd
net start caddy
```

---

## **Update Your Supabase Configuration**

### **Step 1: Update Your Environment File**

In your Supabase project directory (find your `docker-compose.yml` file and the corresponding `.env` file), update:

```bash
# Change from HTTP to HTTPS
SITE_URL=https://your-supabase-domain.com
ADDITIONAL_REDIRECT_URLS=https://v0-brava-press-header.vercel.app/auth/callback,https://your-supabase-domain.com

# Update API gateway URLs
API_EXTERNAL_URL=https://your-supabase-domain.com
```

### **Step 2: Restart Supabase Services**

Open Command Prompt/PowerShell as Administrator and navigate to your Supabase project directory:

```cmd
cd path\to\your\supabase-project

# Stop services
docker compose down

# Start services with new configuration
docker compose up -d

# Check all services are healthy
docker compose ps
```

---

## **Test the Setup**

### **Step 1: Verify HTTPS Access**
1. Open browser and go to: `https://your-supabase-domain.com`
2. You should see the Supabase Studio login page
3. Login with your dashboard credentials
4. Verify all services are working

### **Step 2: Test API Endpoints**
Open PowerShell and test the API:
```powershell
# Test the API endpoint using PowerShell
Invoke-RestMethod -Uri "https://your-supabase-domain.com/rest/v1/" -Method GET

# Or using curl if installed
curl https://your-supabase-domain.com/rest/v1/
```

### **Step 3: Update Vercel Environment Variables**

In your Vercel dashboard, update the environment variable:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-domain.com
```

Then redeploy your Vercel app.

---

## **DNS Configuration Required**

Make sure your domain DNS points to your server:

```
A Record: your-supabase-domain.com → 135.148.41.27
```

---

## **Troubleshooting**

### **Common Issues:**

#### **1. Certificate Not Working**
Open PowerShell as Administrator:
```powershell
# Check certificate status (if using Certbot)
certbot certificates

# Renew certificate
certbot renew --dry-run
```

#### **2. Nginx Configuration Errors**
```cmd
# Test configuration
cd C:\nginx
nginx -t

# Check logs (if logging is enabled in nginx.conf)
# View logs in C:\nginx\logs\error.log
```

#### **3. Windows Firewall Issues**
Open PowerShell as Administrator:
```powershell
# Allow HTTPS traffic through Windows Firewall
New-NetFirewallRule -DisplayName "Allow HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443
New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -Protocol TCP -LocalPort 80
```

#### **4. Docker Services Not Responding**
```cmd
# Check service status
docker compose ps

# Restart specific service
docker compose restart <service-name>

# Check logs
docker compose logs <service-name>
```

---

## **Success Criteria**

When setup is complete, you should be able to:

1. Access `https://your-supabase-domain.com` in browser (secure connection)
2. Login to Supabase Studio dashboard
3. BravaPress app at `https://v0-brava-press-header.vercel.app` connects successfully
4. User authentication works
5. No console errors about mixed content

---

## **Need Help?**

If you encounter any issues during setup:

1. **Check Windows Event Logs**: Open Event Viewer and check Application/System logs
2. **Check Nginx logs**: View `C:\nginx\logs\error.log` and `C:\nginx\logs\access.log`
3. **Check Supabase logs**: `docker compose logs`
4. **Verify DNS**: Use PowerShell command `nslookup your-supabase-domain.com`
5. **Test connectivity**: Use PowerShell `Test-NetConnection your-supabase-domain.com -Port 443`

---

## **What We Need After Setup**

Once you've completed the HTTPS setup, please provide:

1. **Your new HTTPS Supabase URL**: `https://your-supabase-domain.com`
2. **Confirmation that the API is accessible** via HTTPS
3. **Any updated API keys** (if regenerated during setup)

We'll then update the Vercel environment variables and test the full integration.

---

**This setup will solve the current deployment issue AND prepare your infrastructure for any future production applications!** 