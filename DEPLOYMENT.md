# MsgCore Multi-Tenant Deployment Guide

## Overview

MsgCore uses **Dokku** for multi-tenant deployments. Each tenant gets:
- Dedicated Dokku app
- Isolated PostgreSQL database
- Isolated Redis instance
- Custom subdomain (`tenant.msgcore.dev`)
- Optional custom domain support
- SSL certificates (Let's Encrypt)

## Architecture

```
msgcore.dev (landing page)
├── acme.msgcore.dev          → Tenant: Acme Corp
│   ├── PostgreSQL (acme-db)
│   ├── Redis (acme-redis)
│   └── Environment (isolated)
├── startup.msgcore.dev       → Tenant: Startup Inc
│   ├── PostgreSQL (startup-db)
│   ├── Redis (startup-redis)
│   └── Environment (isolated)
└── demo.msgcore.dev          → Tenant: Demo
    ├── PostgreSQL (demo-db)
    ├── Redis (demo-redis)
    └── Environment (isolated)
```

## Prerequisites

1. **Server with Dokku installed** (Ubuntu 20.04+ recommended)
2. **DNS configured** - Wildcard A record for `*.msgcore.dev` pointing to server IP
3. **Dokku plugins installed:**
   ```bash
   dokku plugin:install https://github.com/dokku/dokku-postgres.git postgres
   dokku plugin:install https://github.com/dokku/dokku-redis.git redis
   dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git letsencrypt
   ```
4. **Git access** to the msgcore repository

## Provisioning a New Tenant

### Quick Start

```bash
# SSH into your Dokku server
ssh root@your-server

# Navigate to the msgcore repository
cd /root/msgcore

# Run the provisioning script
./scripts/provision-tenant.sh <tenant-name>
```

### Example: Create "acme" tenant

```bash
./scripts/provision-tenant.sh acme
```

This will:
1. Create Dokku app `acme`
2. Create PostgreSQL database `acme-db`
3. Create Redis instance `acme-redis`
4. Configure domain `acme.msgcore.dev`
5. Generate secure JWT and encryption keys
6. Enable SSL (Let's Encrypt)

### With Custom Domain

```bash
./scripts/provision-tenant.sh acme --custom-domain api.acme.com
```

### With Custom Secrets

```bash
./scripts/provision-tenant.sh acme \
  --jwt-secret "your-secure-jwt-secret-min-32-chars" \
  --encryption-key "your-secure-encryption-key-32-chars"
```

## Deploying the Application

### Option 1: Git Push (Recommended)

From your local development machine:

```bash
# Add git remote (replace "acme" with your tenant name)
git remote add acme dokku@your-server:acme

# Push to deploy
git push acme main
```

### Option 2: Deploy from Server

From the Dokku server:

```bash
# Clone the repository if not already present
git clone https://github.com/msgcore/msgcore.git /tmp/msgcore-deploy
cd /tmp/msgcore-deploy

# Deploy to tenant
git push dokku@localhost:acme main
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check app status
dokku ps:report acme

# Check logs
dokku logs acme --tail

# Check database connection
dokku postgres:info acme-db

# Check Redis connection
dokku redis:info acme-redis
```

### 2. Create First Admin User

```bash
curl -X POST https://acme.msgcore.dev/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme.com",
    "password": "SecurePass123",
    "name": "Admin User"
  }'
```

**Important:** Signup is only available for the first user. After the first admin is created, additional users must be invited.

### 3. Test the Deployment

```bash
# Health check
curl https://acme.msgcore.dev/api/v1/health

# Check authentication
curl https://acme.msgcore.dev/api/v1/auth/whoami \
  -H "Authorization: Bearer <jwt-token>"
```

## Managing Tenants

### View All Tenants

```bash
dokku apps:list
```

### Check Tenant Configuration

```bash
# View environment variables
dokku config:show acme

# View domains
dokku domains:report acme

# View SSL status
dokku letsencrypt:list
```

### Update Tenant Configuration

```bash
# Add environment variable
dokku config:set acme FEATURE_FLAG=true

# Add custom domain
dokku domains:add acme api.acme.com

# Renew SSL certificate
dokku letsencrypt:renew acme
```

### Scale Tenant

```bash
# Scale to 2 web processes
dokku ps:scale acme web=2

# Set resource limits
dokku resource:limit acme --memory 1024m --cpu 1000m
dokku resource:reserve acme --memory 512m --cpu 500m
```

### Backup Tenant Data

```bash
# Export database
dokku postgres:export acme-db > acme-backup-$(date +%Y%m%d).sql

# Export Redis data (if needed)
dokku redis:export acme-redis > acme-redis-backup-$(date +%Y%m%d).rdb

# Schedule automatic backups
dokku postgres:backup-auth acme-db AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
dokku postgres:backup-schedule acme-db "0 3 * * *" my-s3-bucket
```

### Delete Tenant

```bash
# WARNING: This is destructive and irreversible!

# Stop the app
dokku ps:stop acme

# Backup before deletion (recommended)
dokku postgres:export acme-db > acme-final-backup.sql

# Unlink and destroy services
dokku postgres:unlink acme-db acme
dokku redis:unlink acme-redis acme
dokku postgres:destroy acme-db
dokku redis:destroy acme-redis

# Destroy the app
dokku apps:destroy acme
```

## Monitoring

### View Logs

```bash
# Real-time logs
dokku logs acme --tail

# Recent logs (last 100 lines)
dokku logs acme --num 100

# Error logs only
dokku logs acme --tail | grep ERROR
```

### Check Resource Usage

```bash
# CPU and memory usage
dokku ps:report acme

# Container stats
docker stats $(dokku ps:report acme | grep "container id" | awk '{print $3}')
```

## Troubleshooting

### Build Failures

```bash
# Check build logs
dokku logs acme --tail

# Rebuild from scratch
dokku ps:rebuild acme
```

### Database Connection Issues

```bash
# Verify DATABASE_URL is set
dokku config:get acme DATABASE_URL

# Test database connection
dokku postgres:connect acme-db

# Check database logs
dokku postgres:logs acme-db
```

### SSL Certificate Issues

```bash
# Check SSL status
dokku letsencrypt:list

# Force certificate renewal
dokku letsencrypt:enable acme --force

# Check domain configuration
dokku domains:report acme
```

### Application Not Starting

```bash
# Check process status
dokku ps:report acme

# Restart the app
dokku ps:restart acme

# Check environment variables
dokku config:show acme

# Verify Procfile is correct
git show main:Procfile
```

## Environment Variables

### Required Variables

These are automatically set by the provisioning script:

- `NODE_ENV=production`
- `PORT=5000`
- `DATABASE_URL` (set by dokku-postgres)
- `REDIS_URL` (set by dokku-redis)
- `JWT_SECRET` (generated)
- `ENCRYPTION_KEY` (generated)

### Optional Variables

Add these as needed:

```bash
# Sentry monitoring
dokku config:set acme SENTRY_DSN=https://...

# Custom log level
dokku config:set acme LOG_LEVEL=debug

# Rate limiting
dokku config:set acme RATE_LIMIT_TTL=60 RATE_LIMIT_LIMIT=100

# Auth0 (if using enterprise SSO)
dokku config:set acme \
  AUTH0_DOMAIN=your-tenant.auth0.com \
  AUTH0_AUDIENCE=https://api.msgcore.dev
```

## Best Practices

1. **Always backup before major changes**
   ```bash
   dokku postgres:export acme-db > backup-$(date +%Y%m%d).sql
   ```

2. **Use separate staging and production environments**
   ```bash
   ./scripts/provision-tenant.sh acme-staging
   ./scripts/provision-tenant.sh acme-production
   ```

3. **Monitor resource usage and scale accordingly**
   ```bash
   dokku ps:scale acme web=2  # Scale horizontally
   dokku resource:limit acme --memory 2048m  # Scale vertically
   ```

4. **Enable automatic backups**
   ```bash
   dokku postgres:backup-schedule acme-db "0 3 * * *" s3-bucket
   ```

5. **Set up monitoring and alerts**
   - Configure Sentry for error tracking
   - Set up UptimeRobot or Pingdom for availability monitoring
   - Monitor database size and set up alerts

## Security Considerations

1. **Firewall Configuration**
   ```bash
   # Only allow HTTP, HTTPS, and SSH
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

2. **Strong Secrets**
   - Use generated secrets (min 32 characters)
   - Rotate secrets periodically
   - Never commit secrets to version control

3. **SSL Certificates**
   - Let's Encrypt provides free SSL
   - Certificates auto-renew via dokku-letsencrypt
   - Force HTTPS for all connections

4. **Database Security**
   - Databases are not exposed externally
   - Only accessible via internal Docker network
   - Use strong PostgreSQL passwords

## Support

For issues or questions:
- GitHub Issues: https://github.com/msgcore/msgcore/issues
- Discord Community: https://discord.gg/bQPsvycW
- Email: support@msgcore.dev
