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
    try {
      this.pool = require('./postgres').default;
      console.log('PostgreSQL adapter initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PostgreSQL adapter:', error);
      throw error;
    }
  }

  // Convert SQLite-style ? placeholders to PostgreSQL $1, $2, etc.
  private convertSqlPlaceholders(sql: string): string {
    let paramIndex = 1;
    return sql.replace(/\?/g, () => `$${paramIndex++}`);
  }

  // Convert SQLite functions to PostgreSQL equivalents
  private convertSqlFunctions(sql: string): string {
    // Convert GROUP_CONCAT to STRING_AGG for PostgreSQL
    return sql.replace(/GROUP_CONCAT\(([^)]+)\)/g, 'STRING_AGG($1, \',\')');
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      let convertedSql = this.convertSqlFunctions(sql);
      convertedSql = this.convertSqlPlaceholders(convertedSql);
      const result = await this.pool.query(convertedSql, params);
      return result.rows;
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      console.error('Original SQL:', sql);
      console.error('Converted SQL:', this.convertSqlPlaceholders(this.convertSqlFunctions(sql)));
      console.error('Params:', params);
      throw error;
    }
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    // For INSERT statements, add RETURNING id if not present
    let modifiedSql = sql;
    if (sql.trim().toUpperCase().startsWith('INSERT') && !sql.toUpperCase().includes('RETURNING')) {
      modifiedSql = sql + ' RETURNING id';
    }

    try {
      let convertedSql = this.convertSqlFunctions(modifiedSql);
      convertedSql = this.convertSqlPlaceholders(convertedSql);
      const result = await this.pool.query(convertedSql, params);

      return {
        lastID: result.rows[0]?.id,
        changes: result.rowCount
      };
    } catch (error) {
      console.error('PostgreSQL run error:', error);
      console.error('Original SQL:', sql);
      console.error('Modified SQL:', modifiedSql);
      console.error('Converted SQL:', this.convertSqlPlaceholders(modifiedSql));
      console.error('Params:', params);
      throw error;
    }
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    try {
      let convertedSql = this.convertSqlFunctions(sql);
      convertedSql = this.convertSqlPlaceholders(convertedSql);
      const result = await this.pool.query(convertedSql, params);
      return result.rows[0];
    } catch (error) {
      console.error('PostgreSQL get error:', error);
      console.error('Original SQL:', sql);
      console.error('Converted SQL:', this.convertSqlPlaceholders(this.convertSqlFunctions(sql)));
      console.error('Params:', params);
      throw error;
    }
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    try {
      let convertedSql = this.convertSqlFunctions(sql);
      convertedSql = this.convertSqlPlaceholders(convertedSql);
      const result = await this.pool.query(convertedSql, params);
      return result.rows;
    } catch (error) {
      console.error('PostgreSQL all error:', error);
      console.error('Original SQL:', sql);
      console.error('Converted SQL:', this.convertSqlPlaceholders(this.convertSqlFunctions(sql)));
      console.error('Params:', params);
      throw error;
    }
  }
}

// Export the appropriate adapter
let adapter: DatabaseAdapter;

try {
  if (usePostgres) {
    console.log('Initializing PostgreSQL adapter...');
    adapter = new PostgreSQLAdapter();
    console.log('PostgreSQL adapter ready');
  } else {
    console.log('Initializing SQLite adapter...');
    adapter = new SQLiteAdapter();
    console.log('SQLite adapter ready');
  }
} catch (error) {
  console.error('Failed to initialize database adapter:', error);
  console.log('Falling back to SQLite adapter...');
  adapter = new SQLiteAdapter();
}

export default adapter;
