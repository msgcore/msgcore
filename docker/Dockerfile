# ==============================================================================
# Stage 1: Build Backend
# ==============================================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy backend source
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY tools ./tools

# Build backend
RUN npm run build

# Generate contracts and OpenAPI for runtime
RUN npm run extract:contracts
RUN npm run generate:openapi

# ==============================================================================
# Stage 2: Build Frontend (Web)
# ==============================================================================
FROM node:20-alpine AS web-builder

WORKDIR /app/web

# Accept build arguments for frontend environment variables
ARG MSGCORE_API_URL
ARG MSGCORE_API_VERSION=v1
ARG MSGCORE_ENV=production

# Convert ARG to ENV so Vite can access during build
ENV MSGCORE_API_URL=$MSGCORE_API_URL
ENV MSGCORE_API_VERSION=$MSGCORE_API_VERSION
ENV MSGCORE_ENV=$MSGCORE_ENV

# Copy web package files
COPY web/package*.json ./

# Install dependencies
RUN npm ci

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

WORKDIR /app

# Install Node.js runtime for backend
RUN apk add --no-cache nodejs npm

# Copy production node_modules
COPY --from=backend-deps /app/node_modules ./backend/node_modules

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/prisma ./backend/prisma
COPY --from=backend-builder /app/backend/package*.json ./backend/

# Copy built frontend to nginx html directory
COPY --from=web-builder /app/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf.template /etc/nginx/nginx.conf

# Copy entrypoint script
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Health check to monitor container health
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/api/v1/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
