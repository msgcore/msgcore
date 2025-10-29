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

    echo "Shutdown complete"
    exit 0
}

# Trap SIGTERM and SIGINT
trap shutdown SIGTERM SIGINT

# Backend port from environment (default 7890)
BACKEND_PORT=${PORT:-7890}

# Run database migrations
echo "Running database migrations..."
cd /app/backend
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "✗ Migration failed"
    exit 1
fi
echo "✓ Migrations completed successfully"

# Start backend (serves both API and frontend via ServeStaticModule)
echo "Starting backend on port $BACKEND_PORT..."
PORT=$BACKEND_PORT node dist/src/main &
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

echo "=========================================="
echo "MsgCore is running!"
echo ""
echo "🌐 Public URLs (MSGCORE_API_URL):"
echo "  - API: ${MSGCORE_API_URL:-http://localhost:$BACKEND_PORT}/api/v1"
echo "  - Frontend: ${MSGCORE_API_URL:-http://localhost:$BACKEND_PORT}"
echo "  - Health: ${MSGCORE_API_URL:-http://localhost:$BACKEND_PORT}/api/v1/health"
echo ""
echo "🔧 Internal Container URLs:"
echo "  - Frontend: http://localhost:$BACKEND_PORT"
echo "  - API: http://localhost:$BACKEND_PORT/api/v1"
echo "  - MCP: http://localhost:$BACKEND_PORT/mcp"
echo "  - Docs: http://localhost:$BACKEND_PORT/docs"
echo "=========================================="

# Wait for backend to exit
wait $BACKEND_PID

# If we reach here, one of the processes died
EXIT_CODE=$?
echo "Process exited with code: $EXIT_CODE"
shutdown
