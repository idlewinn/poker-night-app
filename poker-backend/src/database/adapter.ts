import dotenv from 'dotenv';

dotenv.config();

// Database adapter that provides a consistent interface for both SQLite and PostgreSQL
const usePostgres = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql');

interface DatabaseAdapter {
  query: (sql: string, params?: any[]) => Promise<any>;
  run: (sql: string, params?: any[]) => Promise<{ lastID?: number; changes?: number }>;
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
}

class SQLiteAdapter implements DatabaseAdapter {
  private db: any;

  constructor() {
    this.db = require('./db').default;
  }

  query(sql: string, params: any[] = []): Promise<any> {
    return this.all(sql, params);
  }

  run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(this: any, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: Error | null, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }
}

class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: any;

  constructor() {
    this.pool = require('./postgres').default;
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    // For INSERT statements, add RETURNING id if not present
    let modifiedSql = sql;
    if (sql.trim().toUpperCase().startsWith('INSERT') && !sql.toUpperCase().includes('RETURNING')) {
      modifiedSql = sql + ' RETURNING id';
    }

    const result = await this.pool.query(modifiedSql, params);
    
    return {
      lastID: result.rows[0]?.id,
      changes: result.rowCount
    };
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const result = await this.pool.query(sql, params);
    return result.rows[0];
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }
}

// Export the appropriate adapter
const adapter: DatabaseAdapter = usePostgres ? new PostgreSQLAdapter() : new SQLiteAdapter();

export default adapter;
