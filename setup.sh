#!/bin/bash
# ============================================================
# TNGMS Angular Project - Setup Script
# Run this script after extracting the zip:
#   chmod +x setup.sh && ./setup.sh
# ============================================================

echo ""
echo "======================================"
echo "  TNGMS Angular - Setting up project "
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Download from https://nodejs.org/ (v18 or above)"
  exit 1
fi

NODE_VER=$(node -v)
echo "✓ Node.js found: $NODE_VER"

# Check npm
NPM_VER=$(npm -v)
echo "✓ npm found: $NPM_VER"

# Check Angular CLI
if ! command -v ng &> /dev/null; then
  echo ""
  echo "Installing Angular CLI globally..."
  npm install -g @angular/cli
fi

NG_VER=$(ng version --skip-analytics 2>/dev/null | grep "Angular CLI" | head -1)
echo "✓ Angular CLI: $NG_VER"

echo ""
echo "Installing dependencies (this may take 1-2 minutes)..."
npm install

echo ""
echo "======================================"
echo "  Setup complete!"
echo "======================================"
echo ""
echo "To start the development server, run:"
echo ""
echo "   ng serve --open"
echo ""
echo "The app will open at: http://localhost:4200"
echo ""
echo "Default login: Use your TNGMS credentials"
echo "API Base URL: https://training.masclass.in/api/v1/"
echo ""
