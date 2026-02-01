# Data Migration Guide: Old Database → New Database

## Overview
This guide will help you export data from your old Railway PostgreSQL database and import it into the new one.

## Step 1: Get Old Database Connection String

1. Go to Railway dashboard: https://railway.com/dashboard
2. Switch to "Edwin Lin's Projects" workspace
3. Click on the "unique-forgiveness" project
4. Click on the "Postgres" service
5. Click on "Variables" tab
6. Find and copy the `DATABASE_URL` value (it will look like: `postgresql://postgres:password@host:port/railway`)

## Step 2: Export Data from Old Database

Run this command (replace `<OLD_DATABASE_URL>` with the URL from Step 1):

```bash
# Export all data to a SQL file
pg_dump "<OLD_DATABASE_URL>" > old_poker_data.sql

# Or export just the data (no schema):
pg_dump "<OLD_DATABASE_URL>" --data-only > old_poker_data_only.sql
```

## Step 3: Get New Database Connection String

The new database URL is already saved in your Railway project variables:

```bash
# Go to: https://railway.com/project/0c983c1f-b7e4-4ef5-8866-ed8889dcaa84/service/c8ad65e5-b472-4033-aa1d-94a417e54c63/variables
# Copy the DATABASE_URL value
```

## Step 4: Import Data into New Database

```bash
# Import the data (replace <NEW_DATABASE_URL>)
psql "<NEW_DATABASE_URL>" < old_poker_data.sql
```

## Alternative: Manual Table Export/Import

If you want more control, export specific tables:

```bash
# Export individual tables
pg_dump "<OLD_DATABASE_URL>" -t users -t sessions -t players -t session_players -t user_players > tables.sql

# Import into new database
psql "<NEW_DATABASE_URL>" < tables.sql
```

## Tables to Migrate

Based on the old database structure:
- `users` - User accounts
- `players` - Player information
- `sessions` - Poker session data
- `session_players` - Players in each session
- `user_players` - User-to-player relationships
- `seating_assignments` - Seating arrangements
- `seating_charts` - Seating chart configurations
- `user_metrics` - User statistics

## Important Notes

⚠️ **Schema Compatibility**: The new database uses PostgreSQL instead of SQLite, but the schema should be similar. If there are any errors during import, we can fix them manually.

⚠️ **Backup First**: Before importing, make sure to back up both databases just in case.

⚠️ **ID Conflicts**: If you've already created test data in the new database, you might have ID conflicts. In that case, we can clear the new database first:

```bash
# Clear new database (CAREFUL - this deletes all data!)
psql "<NEW_DATABASE_URL>" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## Need Help?

If you run into any issues during migration, I can help you:
1. Check for schema differences
2. Fix any import errors
3. Verify data integrity after migration
4. Update any sequences/auto-increment values

Let me know when you're ready to proceed!
