#!/bin/bash
# Start the CSSPS Framework Backend Server

cd "$(dirname "$0")/backend" || exit 1

echo "Starting CSSPS Framework Backend..."
echo "Server will run on http://0.0.0.0:8000"
echo "Press Ctrl+C to stop"
echo ""

python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
