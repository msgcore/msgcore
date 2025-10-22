# ==============================================================================
# MsgCore Production Dockerfile - Docker Hub Ready
# Published to: docker.io/filipeai/msgcore
# ==============================================================================

# ==============================================================================
# Stage 1: Build Backend & Generate SDK
# ==============================================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy backend source and tools
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY tools ./tools

# Extract contracts and generate SDK
RUN npm run extract:contracts && npm run generate:sdk

# Build SDK (needed for frontend)
WORKDIR /app/generated/sdk
RUN npm install && npm run build

# Build backend
WORKDIR /app
RUN npm run build:backend

# Generate OpenAPI for runtime
RUN npm run generate:openapi

# ==============================================================================
# Stage 2: Build Frontend (Web)
# ==============================================================================
FROM node:20-alpine AS web-builder

WORKDIR /app

# Accept build arguments for frontend environment variables
ARG MSGCORE_API_URL
ARG MSGCORE_API_VERSION=v1
ARG MSGCORE_ENV=production

# Convert ARG to ENV so Vite can access during build
ENV MSGCORE_API_URL=$MSGCORE_API_URL
ENV MSGCORE_API_VERSION=$MSGCORE_API_VERSION
ENV MSGCORE_ENV=$MSGCORE_ENV

# Copy generated SDK from backend-builder
COPY --from=backend-builder /app/generated/sdk ./generated/sdk

# Copy web package files and install dependencies
COPY web/package*.json ./web/
WORKDIR /app/web
RUN npm ci && npm cache clean --force

# Copy web source
COPY web/ ./

# Build frontend (Vite will use MSGCORE_ prefixed ARG variables)
RUN npm run build

# ==============================================================================
# Stage 3: Production Backend Dependencies
# ==============================================================================
FROM node:20-alpine AS backend-deps

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client for production
RUN npx prisma generate

# ==============================================================================
# Stage 4: Final Production Image with nginx
# ==============================================================================
FROM nginx:alpine

# Metadata labels for Docker Hub
LABEL org.opencontainers.image.title="MsgCore" \
      org.opencontainers.image.description="Universal messaging gateway - single API for Discord, Telegram, WhatsApp, Email and more" \
      org.opencontainers.image.vendor="FilipeAI" \
      org.opencontainers.image.url="https://msgcore.dev" \
      org.opencontainers.image.documentation="https://github.com/msgcore/msgcore" \
      org.opencontainers.image.source="https://github.com/msgcore/msgcore" \
      org.opencontainers.image.licenses="Apache-2.0"

WORKDIR /app

# Install Node.js runtime for backend
RUN apk add --no-cache nodejs npm wget

# Copy production node_modules
COPY --from=backend-deps /app/node_modules ./backend/node_modules

# Copy built backend
COPY --from=backend-builder /app/dist ./backend/dist
COPY --from=backend-builder /app/prisma ./backend/prisma
COPY --from=backend-builder /app/generated ./backend/generated
COPY --from=backend-builder /app/package*.json ./backend/

# Copy built frontend to nginx html directory
COPY --from=web-builder /app/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 7890 (configurable via PORT env var)
EXPOSE 7890

# Environment variables for external database connections
ENV DATABASE_URL="" \
    REDIS_URL="" \
    REDIS_HOST="" \
    REDIS_PORT=6379 \
    REDIS_PASSWORD="" \
    PORT=3000 \
    NODE_ENV=production \
    JWT_SECRET="" \
    ENCRYPTION_KEY="" \
    MSGCORE_API_URL="" \
    CORS_ORIGINS="*"

# Health check to monitor container health
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:7890/api/v1/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
