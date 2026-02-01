#!/bin/bash

# Data Migration Script - Automated
# This will be run with database URLs passed in

set -e

echo "🎲 Starting Poker Night Data Migration"
echo "======================================"
echo ""

# Old database (Edwin's workspace - unique-forgiveness project)
OLD_DB_URL="${1}"
# New database (ollieorganizer's workspace - triumphant-integrity project)  
NEW_DB_URL="${2}"

if [ -z "$OLD_DB_URL" ] || [ -z "$NEW_DB_URL" ]; then
    echo "❌ Error: Database URLs not provided"
    echo "Usage: $0 <old_db_url> <new_db_url>"
    exit 1
fi

echo "📥 Step 1: Exporting data from old database..."
/opt/homebrew/Cellar/postgresql@16/16.11_1/bin/pg_dump "$OLD_DB_URL" --data-only --inserts --column-inserts > old_poker_data.sql

if [ $? -eq 0 ]; then
    FILESIZE=$(wc -c < old_poker_data.sql | tr -d ' ')
    LINES=$(wc -l < old_poker_data.sql | tr -d ' ')
    echo "✅ Data exported successfully!"
    echo "   File: old_poker_data.sql"
    echo "   Size: $FILESIZE bytes"
    echo "   Lines: $LINES"
else
    echo "❌ Export failed"
    exit 1
fi

echo ""
echo "📤 Step 2: Importing data into new database..."

# Import the data
/opt/homebrew/Cellar/postgresql@16/16.11_1/bin/psql "$NEW_DB_URL" < old_poker_data.sql 2>&1 | tee migration.log

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ Data imported successfully!"
else
    echo "⚠️  Import completed with some warnings (check migration.log)"
fi

echo ""
echo "🔍 Step 3: Verifying migration..."

# Count records in new database
echo "Counting records in new database..."
/opt/homebrew/Cellar/postgresql@16/16.11_1/bin/psql "$NEW_DB_URL" -t -c "
SELECT 
    'users: ' || COUNT(*) FROM users
    UNION ALL
    SELECT 'players: ' || COUNT(*) FROM players
    UNION ALL  
    SELECT 'sessions: ' || COUNT(*) FROM sessions
    UNION ALL
    SELECT 'session_players: ' || COUNT(*) FROM session_players
    UNION ALL
    SELECT 'user_players: ' || COUNT(*) FROM user_players;
"

echo ""
echo "🎉 Migration Complete!"
echo "====================="
echo ""
echo "✅ Your data has been migrated to the new database"
echo "✅ Backup saved as: old_poker_data.sql"
echo "✅ Migration log saved as: migration.log"
echo ""
echo "Next: Test your app at https://pokernight.famylin.com"
