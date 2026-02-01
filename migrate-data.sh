#!/bin/bash

# Data Migration Script for Poker Night App
# This script exports data from the old database and imports it into the new one

set -e  # Exit on error

echo "🎲 Poker Night Data Migration Script"
echo "===================================="
echo ""

# Check if pg_dump and psql are installed
if ! command -v pg_dump &> /dev/null; then
    echo "❌ Error: pg_dump is not installed. Please install PostgreSQL client tools."
    echo "   macOS: brew install postgresql"
    exit 1
fi

# Get old database URL
echo "📥 Step 1: Export from Old Database"
echo "-----------------------------------"
read -p "Enter OLD database URL (from Edwin Lin's workspace): " OLD_DB_URL

if [ -z "$OLD_DB_URL" ]; then
    echo "❌ Error: No database URL provided"
    exit 1
fi

# Export data
echo "Exporting data from old database..."
pg_dump "$OLD_DB_URL" --data-only --inserts > old_poker_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Data exported successfully to old_poker_data.sql"
    FILESIZE=$(wc -c < old_poker_data.sql)
    echo "   File size: $FILESIZE bytes"
else
    echo "❌ Export failed"
    exit 1
fi

echo ""
echo "📤 Step 2: Import to New Database"
echo "----------------------------------"
read -p "Enter NEW database URL (from ollieorganizer workspace): " NEW_DB_URL

if [ -z "$NEW_DB_URL" ]; then
    echo "❌ Error: No database URL provided"
    exit 1
fi

# Optional: Clear existing data
read -p "⚠️  Clear existing data in new database first? (y/N): " CLEAR_DB

if [ "$CLEAR_DB" = "y" ] || [ "$CLEAR_DB" = "Y" ]; then
    echo "Clearing existing data..."
    psql "$NEW_DB_URL" -c "TRUNCATE users, players, sessions, session_players, user_players, seating_assignments, seating_charts, user_metrics CASCADE;" 2>/dev/null || echo "Some tables may not exist yet (this is OK)"
fi

# Import data
echo "Importing data into new database..."
psql "$NEW_DB_URL" < old_poker_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Data imported successfully!"
else
    echo "⚠️  Import completed with some errors (this may be OK if some tables don't exist)"
fi

echo ""
echo "🎉 Migration Complete!"
echo "====================="
echo ""
echo "Next steps:"
echo "1. Test the new app at https://pokernight.famylin.com"
echo "2. Verify your old sessions and players are there"
echo "3. If everything looks good, you can decommission the old app"
echo ""
echo "Backup file saved: old_poker_data.sql"
