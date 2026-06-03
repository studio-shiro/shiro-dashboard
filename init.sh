#!/usr/bin/env bash
set -e

echo "==> Shiro Dashboard — session init"

# 1. Dependencies
echo ""
echo "[1/4] Verifying dependencies..."
yarn install --frozen-lockfile || { echo "FAILED: yarn install failed. Run 'yarn install' manually and fix any errors."; exit 1; }

# 2. Environment variables
echo ""
echo "[2/4] Checking required environment variables..."

missing_vars=()

if [ -z "${NEXT_PUBLIC_SUPABASE_URL}" ]; then
  missing_vars+=("NEXT_PUBLIC_SUPABASE_URL")
fi

if [ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" ]; then
  missing_vars+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
fi

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "FAILED: Missing required environment variables:"
  for var in "${missing_vars[@]}"; do
    echo "  - $var"
  done
  echo "Copy .env.local.example to .env.local and fill in the values."
  exit 1
fi

echo "  NEXT_PUBLIC_SUPABASE_URL        ✓"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY   ✓"

# 3. Type check
echo ""
echo "[3/4] Running type check..."
yarn typecheck || { echo "FAILED: TypeScript errors found. Run 'yarn typecheck' to see details."; exit 1; }

# 4. Lint
echo ""
echo "[4/4] Running linter..."
yarn lint || { echo "FAILED: Lint errors found. Run 'yarn lint' to see details."; exit 1; }

# Build check (disabled by default — uncomment before deploying)
# echo ""
# echo "[5/5] Running production build..."
# yarn build || { echo "FAILED: Production build failed. Run 'yarn build' to see details."; exit 1; }

echo ""
echo "✓ All checks passed. Session is ready."
