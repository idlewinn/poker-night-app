# 🗄️ PostgreSQL Migration Guide

This guide covers migrating your Poker Night app from SQLite to PostgreSQL for production.

## 🎯 Why PostgreSQL?

- **Production Ready**: Better for concurrent users and larger datasets
- **Reliability**: ACID compliance and better data integrity
- **Scalability**: Handles more connections and larger databases
- **Backup & Recovery**: Better tools and managed service support
- **Railway Integration**: Native PostgreSQL support with automatic backups

## 🚀 Migration Steps

### 1. Add PostgreSQL Database on Railway

1. **In Railway Dashboard:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway creates a PostgreSQL instance automatically
   - Note the connection details

2. **Railway Auto-Configuration:**
   Railway automatically adds these environment variables to your backend service:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   PGHOST=host
   PGPORT=5432
   PGUSER=username
   PGPASSWORD=password
   PGDATABASE=database
   ```

### 2. Deploy Updated Backend

The backend code now automatically detects PostgreSQL:
- **Production**: Uses PostgreSQL when `DATABASE_URL` is present
- **Development**: Uses SQLite when `DATABASE_URL` is not set

### 3. Database Schema Migration

The PostgreSQL schema is automatically created on first deployment:
- ✅ All tables created with proper constraints
- ✅ Foreign key relationships maintained
- ✅ Indexes and performance optimizations
- ✅ Data types optimized for PostgreSQL

### 4. Data Migration (Optional)

If you have existing data in SQLite that you want to migrate:

#### Option A: Fresh Start (Recommended)
- Let PostgreSQL start fresh
- Users will re-authenticate with Google OAuth
- Create new sessions and players as needed

#### Option B: Manual Data Export/Import
1. Export data from SQLite (if needed)
2. Transform data format for PostgreSQL
3. Import into PostgreSQL

## 🔧 Technical Changes

### Database Detection Logic
```typescript
// Automatically chooses database based on environment
const usePostgres = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';
```

### Schema Differences
- **SQLite**: `INTEGER PRIMARY KEY AUTOINCREMENT`
- **PostgreSQL**: `SERIAL PRIMARY KEY`
- **SQLite**: `TEXT` for strings
- **PostgreSQL**: `VARCHAR(255)` with proper sizing
- **SQLite**: `DATETIME`
- **PostgreSQL**: `TIMESTAMP`

### Connection Management
- **SQLite**: Single file-based connection
- **PostgreSQL**: Connection pooling for better performance

## 🧪 Testing the Migration

### 1. Verify Database Connection
Check Railway logs for:
```
Using database: PostgreSQL
Initializing PostgreSQL database...
Connected to PostgreSQL database
Users table ready
Players table ready
[... all tables ready]
```

### 2. Test Application Features
- ✅ Google OAuth login
- ✅ Create players
- ✅ Create sessions
- ✅ Update player status
- ✅ Generate seating charts
- ✅ Financial tracking

### 3. Performance Verification
- ✅ Fast response times
- ✅ Multiple concurrent users
- ✅ No connection errors

## 🔒 Security & Backup

### Railway PostgreSQL Features
- **Automatic Backups**: Daily backups included
- **SSL Connections**: Encrypted connections by default
- **Monitoring**: Built-in performance monitoring
- **Scaling**: Easy vertical scaling as needed

### Environment Security
- ✅ Database credentials in environment variables
- ✅ SSL connections in production
- ✅ No hardcoded connection strings

## 🚨 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify `DATABASE_URL` is set in Railway
   - Check PostgreSQL service is running
   - Verify SSL configuration

2. **Schema Errors**
   - Check table creation logs
   - Verify foreign key constraints
   - Check data type compatibility

3. **Performance Issues**
   - Monitor connection pool usage
   - Check query performance
   - Consider adding indexes if needed

### Rollback Plan
If issues occur, you can temporarily rollback:
1. Remove `DATABASE_URL` environment variable
2. Redeploy to use SQLite
3. Debug PostgreSQL issues separately

## 📊 Benefits After Migration

- **Better Performance**: Connection pooling and optimized queries
- **Reliability**: ACID transactions and data integrity
- **Scalability**: Handle more concurrent users
- **Monitoring**: Railway's built-in PostgreSQL monitoring
- **Backups**: Automatic daily backups
- **Production Ready**: Industry-standard database for web applications

Your Poker Night app will be much more robust and scalable with PostgreSQL! 🎉
