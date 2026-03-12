import db from './connection.js';

db.exec('PRAGMA foreign_keys = OFF');

db.exec(`
  DROP TABLE IF EXISTS answer;
  DROP TABLE IF EXISTS question;
  DROP TABLE IF EXISTS tense;
  DROP TABLE IF EXISTS category;
  DROP TABLE IF EXISTS result;
  DROP TABLE IF EXISTS record;
`);

db.exec('PRAGMA foreign_keys = ON');

console.log('🧹 Database cleaned');
process.exit(0);
