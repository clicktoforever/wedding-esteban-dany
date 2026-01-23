#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | grep 'SUPABASE_PROJECT_ID' | xargs)
fi

# Check if SUPABASE_PROJECT_ID is set
if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "Error: SUPABASE_PROJECT_ID not found in .env.local"
  exit 1
fi

# Generate types
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > lib/database.types.ts

echo "✅ Types generated successfully"
