# Docker Hub Publishing Guide

## Overview

MsgCore is published to Docker Hub under the **filipeai** organization:
- **Repository**: https://hub.docker.com/r/filipeai/msgcore
- **Image**: `filipeai/msgcore`

## Prerequisites

1. **Docker Hub Account** with access to `filipeai` organization
2. **GitHub Secrets** configured:
   - `DOCKER_USERNAME` - Docker Hub username
   - `DOCKER_PASSWORD` - Docker Hub access token
3. **GitHub Variables** configured:
   - `GIT_USER_EMAIL` - Git commit email
   - `GIT_USER_NAME` - Git commit name

## Publishing Workflow

### Automated Publishing (GitHub Actions)

1. **Update version** in `package.json`:
   ```bash
   npm version patch  # 1.0.4 → 1.0.5
   npm version minor  # 1.0.4 → 1.1.0
   npm version major  # 1.0.4 → 2.0.0
   ```

2. **Commit and push** changes:
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: bump version to $(node -p 'require(\"./package.json\").version')"
   git push origin main
   ```

3. **Trigger GitHub Actions workflow**:
   - Go to: https://github.com/msgcore/msgcore/actions/workflows/docker-publish.yml
   - Click: "Run workflow"
   - Select branch: `main`
   - Check: "Publish to Docker Hub"
   - Click: "Run workflow"

4. **Wait for completion** (~5-10 minutes):
   - Builds multi-arch image (amd64, arm64)
   - Publishes to Docker Hub
   - Creates Git tag
   - Creates GitHub Release with changelog

### Manual Publishing (Local)

Build and push manually if needed:

```bash
# Login to Docker Hub
docker login -u <username>

# Build multi-arch image
docker buildx create --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag filipeai/msgcore:latest \
  --tag filipeai/msgcore:$(node -p 'require("./package.json").version') \
  --push \
  .

# Or build for current architecture only
docker build -t filipeai/msgcore:latest .
docker push filipeai/msgcore:latest
```

## Image Tags

### Versioning Strategy

- `filipeai/msgcore:latest` - Always points to the most recent stable release
- `filipeai/msgcore:1.0.4` - Specific version (immutable)
- `filipeai/msgcore:1.0` - Latest patch in minor version
- `filipeai/msgcore:1` - Latest minor in major version
- `filipeai/msgcore:dev` - Development builds (optional)

### Current Tags

Check available tags:
```bash
# Via Docker Hub website
https://hub.docker.com/r/filipeai/msgcore/tags

# Via Docker CLI
docker search filipeai/msgcore
docker pull filipeai/msgcore:latest
docker images filipeai/msgcore
```

## Image Details

### Architecture
- **Multi-stage build** - Optimized for size and security
- **Base image**: nginx:alpine with Node.js 20
- **Platforms**: linux/amd64, linux/arm64
- **Size**: ~300MB (compressed)

### What's Included
- ✅ Backend API (NestJS)
- ✅ Frontend Web App (React + Vite)
- ✅ nginx reverse proxy
- ✅ Prisma client
- ✅ OpenAPI documentation
- ✅ Health checks
- ❌ PostgreSQL (use external)
- ❌ Redis (use external)

### Exposed Ports
- **7890** - Main application port (frontend + API via nginx)

### Required Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host:5432/msgcore?schema=public
REDIS_URL=redis://:password@host:6379
JWT_SECRET=$(openssl rand -hex 32)  # 64 hex characters
ENCRYPTION_KEY=$(openssl rand -hex 32)  # 64 hex characters (required)
```

## Testing the Image

### Test Locally

```bash
# Pull the image
docker pull filipeai/msgcore:latest

# Run with test databases (use docker-compose.yml for databases)
docker compose up -d postgres redis

# Run the image
docker run -d \
  --name msgcore-test \
  --network msgcore_msgcore-network \
  -p 7890:7890 \
  -e DATABASE_URL="postgresql://msgcore:msgcore_password@postgres:5432/msgcore?schema=public" \
  -e REDIS_URL="redis://:redis_password@redis:6379" \
  -e JWT_SECRET="test-secret-min-32-chars-required-here" \
  -e ENCRYPTION_KEY="test-encryption-key-32-chars-here" \
  filipeai/msgcore:latest

# Check health
curl http://localhost:7890/api/v1/health

# View logs
docker logs -f msgcore-test

# Cleanup
docker stop msgcore-test && docker rm msgcore-test
```

### Validate Multi-Architecture Support

```bash
# Check manifest
docker manifest inspect filipeai/msgcore:latest

# Pull for specific architecture
docker pull --platform linux/amd64 filipeai/msgcore:latest
docker pull --platform linux/arm64 filipeai/msgcore:latest
```

## Troubleshooting

### Build Failures

**Problem**: GitHub Actions build fails

**Solutions**:
1. Check build logs in GitHub Actions
2. Verify Docker Hub credentials are valid
3. Ensure `package.json` version is unique
4. Test build locally first

### Push Failures

**Problem**: Cannot push to Docker Hub

**Solutions**:
1. Verify Docker Hub account has access to `filipeai` organization
2. Check Docker Hub access token permissions
3. Ensure repository exists: https://hub.docker.com/r/filipeai/msgcore

### Image Size Too Large

**Problem**: Image exceeds size limits

**Solutions**:
1. Image is already optimized with multi-stage build
2. Check `.dockerignore` includes all unnecessary files
3. Consider using `alpine` base images (already in use)

## Security

### Secrets Management

**Never commit secrets to the repository**. Use environment variables:

```bash
# BAD - hardcoded secrets
ENV JWT_SECRET=mysecret

# GOOD - environment variables
ENV JWT_SECRET=""
```

### Docker Hub Access Token

Generate a personal access token instead of using password:
1. Go to: https://hub.docker.com/settings/security
2. Click: "New Access Token"
3. Name: "GitHub Actions - MsgCore"
4. Permissions: "Read & Write"
5. Copy token and save to GitHub Secrets

### Image Scanning

Docker Hub automatically scans images for vulnerabilities:
- View scan results: https://hub.docker.com/r/filipeai/msgcore/tags
- Address critical vulnerabilities promptly
- Keep base images updated

## Documentation References

- [Docker.com - Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Hub - Official Docs](https://docs.docker.com/docker-hub/)
- [GitHub Actions - Docker](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)

## Support

- **Issues**: https://github.com/msgcore/msgcore/issues
- **Discord**: https://discord.gg/bQPsvycW
- **Email**: contact@msgcore.dev
