#!/bin/bash
echo "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Copying backend files to dist..."
mkdir -p dist/server
cp server/*.py dist/server/
cp server/.env dist/server/ 2>/dev/null || true
cp server/.env.example dist/server/ 2>/dev/null || true

echo "Build completed successfully!"
echo "Run with: python dist/server/app.py"