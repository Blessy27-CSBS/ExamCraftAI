const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let dbDriver = null; // 'pg' or 'sqlite'
let pgPool = null;
let sqliteDb = null;

const schemaSqlPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');

/**
 * Normalizes SQL queries across PostgreSQL ($1, $2) and SQLite (?, ?)
 */
function normalizeQuery(sql, driver) {
  if (driver === 'sqlite') {
    // Convert $1, $2 ... into ?
    return sql.replace(/\$\d+/g, '?');
  } else {
    // Convert ? into $1, $2 ...
    let paramIndex = 1;
    return sql.replace(/\?/g, () => `$${paramIndex++}`);
  }
}

async function initDatabase() {
  const pgConnectionString = process.env.DATABASE_URL || 
    (process.env.PGHOST && `postgres://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'examcraft_ai'}`);

  // 1. Attempt PostgreSQL connection if configured
  if (pgConnectionString) {
    try {
      const { Pool } = require('pg');
      const testPool = new Pool({
        connectionString: pgConnectionString,
        connectionTimeoutMillis: 3000
      });

      // Quick test query
      const client = await testPool.connect();
      await client.query('SELECT 1');
      client.release();

      pgPool = testPool;
      dbDriver = 'pg';
      console.log('✅ [Database] Connected successfully to PostgreSQL server at:', pgConnectionString.replace(/:[^:]*@/, ':****@'));

      // Run Schema migrations on PostgreSQL
      await runSchemaStatements(pgPool, schemaSql, 'pg');
      await seedDefaultFaculty();
      return { driver: 'pg' };
    } catch (pgErr) {
      console.warn('⚠️ [Database] PostgreSQL connection failed or unauthenticated:', pgErr.message);
      console.log('ℹ️ [Database] Initializing persistent local SQL engine (examcraft.db) as reliable storage fallback.');
    }
  }

  // 2. Initialize persistent SQLite database
  return new Promise((resolve, reject) => {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, '..', '..', 'examcraft.db');

    sqliteDb = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('❌ [Database] Failed to open SQLite database:', err.message);
        return reject(err);
      }

      dbDriver = 'sqlite';
      console.log(`✅ [Database] Persistent SQL storage initialized at: ${dbPath}`);

      // Enable foreign keys
      sqliteDb.run('PRAGMA foreign_keys = ON;', async (fkErr) => {
        if (fkErr) console.warn('PRAGMA foreign_keys error:', fkErr.message);

        try {
          await runSchemaStatements(sqliteDb, schemaSql, 'sqlite');
          await seedDefaultFaculty();
          resolve({ driver: 'sqlite' });
        } catch (schemaErr) {
          reject(schemaErr);
        }
      });
    });
  });
}

/**
 * Runs multi-statement SQL schema safely
 */
async function runSchemaStatements(db, sql, driver) {
  // Split statements by semicolon while ignoring comments
  const cleanSql = sql
    .replace(/--.*$/gm, '')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of cleanSql) {
    if (driver === 'pg') {
      await db.query(stmt);
    } else {
      await new Promise((resolve, reject) => {
        // Adjust column types for SQLite compatibility
        const sqliteStmt = stmt
          .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
          .replace(/NUMERIC\(\d+,\s*\d+\)/gi, 'NUMERIC');

        db.run(sqliteStmt, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.warn('Schema statement warning:', err.message);
          }
          resolve();
        });
      });
    }
  }
}

/**
 * Seeds default administrator and faculty accounts if they don't already exist
 */
async function seedDefaultFaculty() {
  const teacherEmail = 'teacher@examcraft.ai';
  const adminEmail = 'admin@examcraft.ai';

  const existing = await query('SELECT id FROM users WHERE email = ?', [teacherEmail]);
  if (!existing || existing.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const teacherHash = await bcrypt.hash('Faculty@2026', salt);
    const adminHash = await bcrypt.hash('Admin@2026', salt);

    // Insert Teacher
    await query(`
      INSERT INTO users (id, email, password_hash, full_name, department, institution, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'usr-faculty-default',
      teacherEmail,
      teacherHash,
      'Faculty Member',
      'Academic Department',
      'INSTITUTE OF SCIENCE & TECHNOLOGY',
      'teacher'
    ]);

    // Insert Admin
    await query(`
      INSERT INTO users (id, email, password_hash, full_name, department, institution, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'usr-admin-default',
      adminEmail,
      adminHash,
      'System Administrator',
      'Academic Affairs & Examination Board',
      'INSTITUTE OF SCIENCE & TECHNOLOGY',
      'admin'
    ]);

    // Seed default application settings
    const defaultSettings = {
      teacherName: 'Faculty Member',
      department: 'Department of Computer Science & Engineering',
      institution: 'INSTITUTE OF SCIENCE & TECHNOLOGY',
      defaultDuration: 90,
      defaultMarks: 50,
      defaultExamType: 'Model Examination',
      includeInstructions: true,
      showBloomTags: true,
      includeSignatureLine: true,
      theme: 'light',
      density: 2,
      cornerRadius: 16
    };

    await query(`
      INSERT INTO application_settings (id, user_id, settings_json)
      VALUES (?, ?, ?)
    `, [
      'set-faculty-default',
      'usr-faculty-default',
      JSON.stringify(defaultSettings)
    ]);

    console.log('🌱 [Database] Seeded default credentials:');
    console.log('   Faculty: teacher@examcraft.ai / Faculty@2026');
    console.log('   Admin:   admin@examcraft.ai / Admin@2026');
  }
}

/**
 * Universal query runner
 */
async function query(sql, params = []) {
  if (dbDriver === 'pg') {
    const formattedSql = normalizeQuery(sql, 'pg');
    const res = await pgPool.query(formattedSql, params);
    return res.rows;
  } else if (dbDriver === 'sqlite') {
    const formattedSql = normalizeQuery(sql, 'sqlite');
    return new Promise((resolve, reject) => {
      const isSelect = /^\s*(SELECT|PRAGMA)/i.test(formattedSql);
      if (isSelect) {
        sqliteDb.all(formattedSql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      } else {
        sqliteDb.run(formattedSql, params, function (err) {
          if (err) return reject(err);
          resolve({ lastID: this.lastID, changes: this.changes });
        });
      }
    });
  } else {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
}

/**
 * Universal single-row query runner
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Universal transaction runner
 */
async function transaction(callback) {
  if (dbDriver === 'pg') {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const res = await callback({
        query: (sql, params = []) => client.query(normalizeQuery(sql, 'pg'), params).then(r => r.rows)
      });
      await client.query('COMMIT');
      return res;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    await query('BEGIN TRANSACTION');
    try {
      const res = await callback({ query });
      await query('COMMIT');
      return res;
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }
}

module.exports = {
  initDatabase,
  query,
  queryOne,
  transaction,
  getDriver: () => dbDriver
};
