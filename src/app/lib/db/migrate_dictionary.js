import db from './connection.js';
import fs from 'fs';
import path from 'path';

// VERY IMPORTANT for SQLite
db.exec('PRAGMA foreign_keys = ON');

const sqlPath = path.join(
  process.cwd(),
  'src',
  'app',
  'store',
  'dictionary.sql'
);
const migration = fs.readFileSync(sqlPath, 'utf8');

db.exec(migration);

console.log('✅ Migrations executed');

export default db;
