import db from './connection.js';

db.exec('PRAGMA foreign_keys = OFF');

db.exec(`
  DROP TABLE IF EXISTS vocabulary;
  DROP TABLE IF EXISTS subcatvocab;
  DROP TABLE IF EXISTS catvocab;
`);

db.exec('PRAGMA foreign_keys = ON');

console.log('🧹 Database cleaned');
process.exit(0);
