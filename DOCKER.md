# MsgCore Docker Deployment

## Architecture

MsgCore uses a unified Docker container that serves both the backend API and frontend web application through nginx:

```
nginx (port 80)
├── /api/*     → Backend (NestJS on port 3000)
├── /mcp       → Backend (MCP server)
├── /docs/*    → Backend (OpenAPI docs)
├── /health    → Backend (Health check)
└── /*         → Frontend (React SPA)
```

## Quick Start

### Development (Recommended)

Run backend and frontend separately for hot-reload:

```bash
# Start databases
docker compose up -d postgres redis

# Terminal 1: Backend
npm run start:dev

# Terminal 2: Frontend
cd web
npm run dev
```

Access:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Production (Unified Container)

Build and run everything in Docker:

```bash
# Build and start all services
docker compose up --build

# Or run in background
docker compose up -d --build
```

Access everything on http://localhost:

- Frontend: http://localhost
- API: http://localhost/api/v1
- MCP: http://localhost/mcp
- Docs: http://localhost/docs
- Health: http://localhost/health

## Docker Commands

```bash
# Build only
docker compose build

# Start services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v

# Rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DB_USER=msgcore
DB_PASSWORD=msgcore_password
DB_NAME=msgcore
DB_PORT=5432

# Redis
REDIS_PASSWORD=redis_password
REDIS_PORT=6379

# Backend
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_KEY=your-encryption-key-here

# Frontend (MSGCORE_ prefix for professional branding)
MSGCORE_API_URL=http://localhost:3000
MSGCORE_API_VERSION=v1
MSGCORE_ENV=development
```

## Project Structure

```
msgcore/
├── src/                    # Backend source (NestJS)
├── web/                    # Frontend source (React + Vite)
│   ├── src/
│   ├── public/
│   └── package.json
├── docker/                 # Docker configuration
│   ├── Dockerfile         # Multi-stage build
│   ├── nginx.conf         # nginx routing config
│   └── docker-entrypoint.sh
├── docker-compose.yml     # Orchestration
└── prisma/                # Database schema

```

## How It Works

### Multi-Stage Build

1. **backend-builder** - Builds NestJS app, generates Prisma client, extracts contracts
2. **web-builder** - Builds React app with Vite
3. **backend-deps** - Installs production dependencies only
4. **Final image** - nginx + Node.js runtime serving both

### Startup Process

1. Backend starts on internal port 3000
2. Health check waits for backend readiness
3. nginx starts on port 80 and proxies requests:
   - `/api/*`, `/mcp`, `/docs/*` → Backend
   - Everything else → Frontend static files

### nginx Routing

- **API routes** - Proxied to backend with WebSocket support
- **Static files** - Served directly with aggressive caching (1 year)
- **SPA fallback** - All unmatched routes serve `index.html`

## Troubleshooting

### Backend not starting

```bash
# Check logs
docker compose logs app

# Check if databases are ready
docker compose ps
docker compose logs postgres redis
```

### Frontend not loading

```bash
# Verify build succeeded
docker compose build --no-cache

# Check nginx is serving files
docker compose exec app ls -la /usr/share/nginx/html
```

### Database connection issues

```bash
# Ensure DATABASE_URL is correct
docker compose exec app env | grep DATABASE_URL

# Test Prisma connection
docker compose exec app npx prisma db pull
```

### Port conflicts

```bash
# Change port in docker-compose.yml
ports:
  - "8080:80"  # Use 8080 instead of 80
```

## Production Deployment

### With Traefik (Recommended)

Add labels to docker-compose.yml:

```yaml
services:
  app:
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.msgcore.rule=Host(`msgcore.yourdomain.com`)'
      - 'traefik.http.routers.msgcore.entrypoints=websecure'
      - 'traefik.http.routers.msgcore.tls.certresolver=letsencrypt'
      - 'traefik.http.services.msgcore.loadbalancer.server.port=80'
```

### With Custom nginx

Use the unified container behind your own nginx:

```nginx
location / {
    proxy_pass http://localhost:80;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Environment-Specific Builds

For production, the frontend is built with these defaults (set in docker-compose.yml):

```bash
MSGCORE_API_URL=  # Empty for same-origin (nginx proxy)
MSGCORE_ENV=production
```

## Health Monitoring

```bash
# Check health endpoint
curl http://localhost/health

# Expected response
{"status":"ok","database":"connected","redis":"connected"}
```

## Scaling

To scale horizontally:

1. Use external PostgreSQL/Redis (not in Docker)
2. Run multiple app containers behind load balancer
3. Configure shared session storage in Redis

```yaml
# External databases
services:
  app:
    environment:
      DATABASE_URL: postgresql://user:pass@external-db:5432/msgcore
      REDIS_URL: redis://:password@external-redis:6379
```

## Security Notes

- Change default passwords in production
- Use secrets management (Docker secrets, Kubernetes secrets)
- Enable HTTPS via Traefik or nginx SSL termination
- Set `JWT_SECRET` to a strong random value (min 32 chars)
- Restrict database access to internal network only

## Support

- Documentation: https://docs.msgcore.dev
- Discord: https://discord.gg/bQPsvycW
- GitHub: https://github.com/msgcore/msgcore
