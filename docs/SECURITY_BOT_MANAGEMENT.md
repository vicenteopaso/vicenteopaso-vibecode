# Security & Bot Management

## Overview

This document describes the security measures implemented to handle bot traffic, prevent attacks, and reduce noise in application logs.

## Middleware Protection

The application uses Next.js middleware (`middleware.ts`) to handle suspicious requests before they reach application routes.

### Sitemap Redirects

Some bots request localized sitemaps (e.g., `/en/sitemap.xml`). Since we use a single sitemap at `/sitemap.xml`, these requests are redirected:

**Redirected paths (301 Permanent):**

- `/en/sitemap.xml` → `/sitemap.xml`
- `/es/sitemap.xml` → `/sitemap.xml`
- `/en/sitemap-0.xml` → `/sitemap.xml`
- `/es/sitemap-0.xml` → `/sitemap.xml`
- `/en/news_sitemap.xml` → `/sitemap.xml`
- `/es/news_sitemap.xml` → `/sitemap.xml`

### Attack Vector Blocking

Common attack vectors are blocked at the middleware level by returning 404 responses:

**Blocked patterns:**

- `/wp-login.php` - WordPress login attempts
- `/wp-admin/*` - WordPress admin panel
- `/xmlrpc.php` - WordPress XML-RPC (commonly exploited)
- `/wp-content/*` - WordPress content directory
- `/wp-includes/*` - WordPress includes directory
- `/.env` - Environment file access attempts
- `/.git/*` - Git repository access attempts
- `/admin/*` - Generic admin panel attempts
- `/phpmyadmin/*` - phpMyAdmin access attempts
- `/administrator/*` - Joomla admin attempts

**Why 404 instead of 403?**

- A 404 response doesn't reveal whether the path exists
- A 403 response confirms the path exists but access is denied
- Security through obscurity: attackers can't distinguish between a Next.js site and other platforms

## robots.txt

The `public/robots.txt` file explicitly disallows common attack vectors to reduce automated scanning:

```txt
User-agent: *
Allow: /

Disallow: /wp-admin/
Disallow: /wp-login.php
Disallow: /xmlrpc.php
Disallow: /admin/
Disallow: /.env
Disallow: /.git/

Sitemap: https://opa.so/sitemap.xml
```

## Log Monitoring

After implementing these measures, you should see:

**Before:**

```
GET 404 /en/sitemap.xml
GET 404 /en/sitemap-0.xml
GET --- /wp-login.php
```

**After:**

```
GET 301 /en/sitemap.xml → /sitemap.xml
GET 404 /wp-login.php (blocked by middleware)
```

## Additional Recommendations

### 1. Vercel Security Headers

Add security headers in `vercel.json` or `next.config.mjs`:

```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};
```

### 2. Rate Limiting

For production, consider implementing rate limiting for suspicious IPs:

- Vercel Edge Config + Middleware
- Cloudflare (if using as a proxy)
- Third-party services like Arcjet or Unkey

### 3. Monitoring & Alerts

Set up alerts for:

- Spike in 404 responses
- Repeated requests from same IP to blocked paths
- Unusual traffic patterns

Tools:

- Vercel Analytics
- Sentry (already configured)
- Custom logging with Datadog/LogDNA

### 4. Automated Blocking

For persistent attackers:

- Use Vercel Edge Config to maintain a blocklist
- Block by IP, User-Agent, or request patterns
- Consider using Vercel's Firewall features (Pro/Enterprise)

## Testing

Test middleware behavior:

```bash
# Should redirect (301)
curl -I https://opa.so/en/sitemap.xml

# Should return 404
curl -I https://opa.so/wp-login.php

# Should work normally
curl -I https://opa.so/en/cv
```

## Performance Impact

The middleware runs on Vercel Edge Network:

- **Latency:** < 1ms overhead
- **Cold starts:** N/A (edge functions are always warm)
- **Cost:** Included in Vercel plan (Edge Middleware is free)

## Maintenance

1. **Monitor logs** regularly for new attack patterns
2. **Update blocked patterns** as needed in `middleware.ts`
3. **Review quarterly** to remove obsolete patterns
4. **Check Vercel dashboard** for edge function errors

## References

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Edge Middleware](https://vercel.com/docs/functions/edge-middleware)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
