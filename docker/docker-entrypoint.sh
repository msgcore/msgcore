#!/bin/sh
set -e

echo "=========================================="
echo "Starting MsgCore Unified Container"
echo "=========================================="

# Function to handle shutdown
shutdown() {
    echo ""
    echo "Shutting down services..."

    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill -TERM $BACKEND_PID 2>/dev/null || true
    fi

    if [ ! -z "$NGINX_PID" ]; then
        echo "Stopping nginx (PID: $NGINX_PID)..."
        kill -TERM $NGINX_PID 2>/dev/null || true
    fi

    echo "Shutdown complete"
    exit 0
}

# Trap SIGTERM and SIGINT
trap shutdown SIGTERM SIGINT

# Get backend port from environment (default 7890)
BACKEND_PORT=${PORT:-7890}
export BACKEND_PORT

# Generate nginx config with environment variables
echo "Generating nginx configuration..."
envsubst '${BACKEND_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start backend
echo "Starting backend API on port $BACKEND_PORT..."
cd /app/backend
node dist/src/main &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if wget -q --spider http://localhost:$BACKEND_PORT/api/v1/health 2>/dev/null; then
        echo "✓ Backend is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo "  Attempt $attempt/$max_attempts..."
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo "✗ Backend failed to start within 30 seconds"
    kill -TERM $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start nginx
echo "Starting nginx on port 80..."
nginx -g "daemon off;" &
NGINX_PID=$!
echo "nginx started (PID: $NGINX_PID)"

echo "=========================================="
echo "MsgCore is running!"
echo ""
echo "🌐 Public URLs (MSGCORE_API_URL):"
echo "  - API: ${MSGCORE_API_URL:-http://localhost:8080}/api/v1"
echo "  - Frontend: ${MSGCORE_API_URL:-http://localhost:8080}"
echo "  - Health: ${MSGCORE_API_URL:-http://localhost:8080}/api/v1/health"
echo ""
echo "🔧 Internal Container URLs:"
echo "  - Frontend: http://localhost"
echo "  - API: http://localhost/api/v1"
echo "  - MCP: http://localhost/mcp"
echo "  - Docs: http://localhost/docs"
echo "=========================================="

# Wait for any process to exit
wait -n $BACKEND_PID $NGINX_PID

# If we reach here, one of the processes died
EXIT_CODE=$?
echo "Process exited with code: $EXIT_CODE"
shutdown
