# Data Migration via Railway CLI

Since the database URLs use internal Railway hostnames, we need to use Railway CLI which can access them.

## Option 1: Quick Migration (Recommended)

Run these commands in your terminal:

```bash
cd poker-night-app

# Export from OLD database
railway link eb581647-eb7b-40d8-bb79-0281f3d14534
railway run --environment production -- pg_dump "$DATABASE_URL" --data-only --inserts > old_data.sql

# Import to NEW database  
railway link 0c983c1f-b7e4-4ef5-8866-ed8889dcaa84
railway run --environment production -- psql "$DATABASE_URL" < old_data.sql
```

## Option 2: Download Backup from Railway UI

1. **Export from OLD database:**
   - Go to: https://railway.com (make sure you're in Edwin Lin's workspace)
   - Click "unique-forgiveness" project
   - Click "Postgres" service
   - Click "Backups" tab
   - Click "Create Backup"
   - Wait for it to complete
   - Click "Download" to get the .sql file

2. **Import to NEW database:**
   - Switch to ollieorganizer's workspace
   - Click "triumphant-integrity" project  
   - Click "Postgres" service
   - Upload via Railway CLI:
   ```bash
   railway link 0c983c1f-b7e4-4ef5-8866-ed8889dcaa84
   railway run -- psql "$DATABASE_URL" < ~/Downloads/backup.sql
   ```

## Option 3: Manual Export/Import

If Railway CLI isn't working, you can manually export and import:

```bash
# Export (you'll need to paste the OLD internal URL when prompted)
pg_dump "postgresql://postgres:auBpNBapGowTfouPRBOMmVmGTGGEDxdQ@postgres.railway.internal:5432/railway" > old_data.sql

# Import (paste the NEW internal URL)
psql "postgresql://postgres:aancLZTIDvYMRvovxVjHYNoVTGJYFKzv@postgres.railway.internal:5432/railway" < old_data.sql
```

**Note:** The internal URLs will only work if you're running these commands from within a Railway service, OR if you have Railway CLI's `railway run` wrapper.

Let me know which option works best for you!
