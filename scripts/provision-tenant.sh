#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage function
usage() {
    echo "Usage: $0 <tenant-name> [options]"
    echo ""
    echo "Options:"
    echo "  --custom-domain <domain>  Add custom domain (optional)"
    echo "  --jwt-secret <secret>     Custom JWT secret (optional, generated if not provided)"
    echo "  --encryption-key <key>    Custom encryption key (optional, generated if not provided)"
    echo ""
    echo "Example:"
    echo "  $0 acme"
    echo "  $0 startup --custom-domain api.startup.com"
    exit 1
}

# Check if tenant name is provided
if [ -z "$1" ]; then
    usage
fi

TENANT_NAME=$1
shift

# Parse optional arguments
CUSTOM_DOMAIN=""
JWT_SECRET=""
ENCRYPTION_KEY=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --custom-domain)
            CUSTOM_DOMAIN="$2"
            shift 2
            ;;
        --jwt-secret)
            JWT_SECRET="$2"
            shift 2
            ;;
        --encryption-key)
            ENCRYPTION_KEY="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
    esac
done

# Validate tenant name (alphanumeric and hyphens only)
if ! [[ "$TENANT_NAME" =~ ^[a-z0-9-]+$ ]]; then
    echo -e "${RED}Error: Tenant name must contain only lowercase letters, numbers, and hyphens${NC}"
    exit 1
fi

APP_NAME="msgcore-${TENANT_NAME}"
DB_NAME="msgcore-${TENANT_NAME}-db"
REDIS_NAME="msgcore-${TENANT_NAME}-redis"
DOMAIN="${TENANT_NAME}.msgcore.dev"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  MsgCore Multi-Tenant Provisioning    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Tenant:${NC}     $TENANT_NAME"
echo -e "${YELLOW}Domain:${NC}     $DOMAIN"
if [ -n "$CUSTOM_DOMAIN" ]; then
    echo -e "${YELLOW}Custom:${NC}     $CUSTOM_DOMAIN"
fi
echo ""

# Check if app already exists
if dokku apps:exists "$APP_NAME" 2>/dev/null; then
    echo -e "${RED}Error: App '$APP_NAME' already exists${NC}"
    exit 1
fi

# Step 1: Create Dokku app
echo -e "${GREEN}[1/9]${NC} Creating Dokku app..."
dokku apps:create "$APP_NAME"

# Step 2: Create PostgreSQL database
echo -e "${GREEN}[2/9]${NC} Creating PostgreSQL database..."
dokku postgres:create "$DB_NAME"

# Step 3: Link PostgreSQL to app
echo -e "${GREEN}[3/9]${NC} Linking PostgreSQL to app..."
dokku postgres:link "$DB_NAME" "$APP_NAME"

# Step 4: Create Redis instance
echo -e "${GREEN}[4/9]${NC} Creating Redis instance..."
dokku redis:create "$REDIS_NAME"

# Step 5: Link Redis to app
echo -e "${GREEN}[5/9]${NC} Linking Redis to app..."
dokku redis:link "$REDIS_NAME" "$APP_NAME"

# Step 6: Configure domain
echo -e "${GREEN}[6/9]${NC} Configuring domain..."
dokku domains:set "$APP_NAME" "$DOMAIN"
if [ -n "$CUSTOM_DOMAIN" ]; then
    dokku domains:add "$APP_NAME" "$CUSTOM_DOMAIN"
fi

# Step 7: Generate and set environment variables
echo -e "${GREEN}[7/9]${NC} Setting environment variables..."

# Generate secrets if not provided
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
fi

if [ -z "$ENCRYPTION_KEY" ]; then
    ENCRYPTION_KEY=$(openssl rand -hex 32)
fi

# Set all environment variables
dokku config:set --no-restart "$APP_NAME" \
    NODE_ENV=production \
    PORT=5000 \
    JWT_SECRET="$JWT_SECRET" \
    ENCRYPTION_KEY="$ENCRYPTION_KEY" \
    MSGCORE_API_URL="https://$DOMAIN" \
    LOG_LEVEL=info

# Step 8: Enable SSL (Let's Encrypt)
echo -e "${GREEN}[8/9]${NC} Enabling SSL (Let's Encrypt)..."
dokku letsencrypt:enable "$APP_NAME" || echo -e "${YELLOW}Warning: SSL setup failed. You may need to enable it manually later.${NC}"

# Step 9: Set up git remote (optional - for manual deployment)
echo -e "${GREEN}[9/9]${NC} Setup complete!"
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Tenant Provisioned Successfully!     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}App Name:${NC}       $APP_NAME"
echo -e "${YELLOW}Database:${NC}       $DB_NAME"
echo -e "${YELLOW}Redis:${NC}          $REDIS_NAME"
echo -e "${YELLOW}Domain:${NC}         https://$DOMAIN"
if [ -n "$CUSTOM_DOMAIN" ]; then
    echo -e "${YELLOW}Custom Domain:${NC}  https://$CUSTOM_DOMAIN"
fi
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo "1. Add git remote (from your local repo):"
echo -e "   ${BLUE}git remote add msgcore-$TENANT_NAME dokku@your-server:$APP_NAME${NC}"
echo ""
echo "2. Deploy the application:"
echo -e "   ${BLUE}git push msgcore-$TENANT_NAME main${NC}"
echo ""
echo "3. Create first admin user (after deployment):"
echo -e "   ${BLUE}curl -X POST https://$DOMAIN/api/v1/auth/signup \\${NC}"
echo -e "   ${BLUE}     -H \"Content-Type: application/json\" \\${NC}"
echo -e "   ${BLUE}     -d '{\"email\":\"admin@example.com\",\"password\":\"SecurePass123\",\"name\":\"Admin\"}'${NC}"
echo ""
echo -e "${YELLOW}Important Credentials (save these securely):${NC}"
echo -e "JWT_SECRET:     $JWT_SECRET"
echo -e "ENCRYPTION_KEY: $ENCRYPTION_KEY"
echo ""
