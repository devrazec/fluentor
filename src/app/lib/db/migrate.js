import db from './connection.js';

// VERY IMPORTANT for SQLite
db.exec('PRAGMA foreign_keys = ON');

const migration = `
BEGIN;

CREATE TABLE IF NOT EXISTS category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  image TEXT,
  active TEXT
);

CREATE TABLE IF NOT EXISTS tense (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  mp3 TEXT,
  image TEXT,
  active TEXT
);

CREATE TABLE IF NOT EXISTS question (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  id_category INTEGER,
  id_tense INTEGER, 
  name TEXT,
  mp3 TEXT,
  active TEXT,
  FOREIGN KEY(id_category) REFERENCES category(id) ON DELETE CASCADE,
  FOREIGN KEY(id_tense) REFERENCES tense(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answer (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_question INTEGER,
  name TEXT,
  word INTEGER,
  timed INTEGER, 
  mp3 TEXT,
  active TEXT,
  FOREIGN KEY(id_question) REFERENCES question(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS record (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_user TEXT,
  id_answer INTEGER,
  duration INTEGER, 
  mp3 TEXT,
  date TEXT,
  active TEXT,
  FOREIGN KEY(id_answer) REFERENCES answer(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS result (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_record INTEGER,
  pronunciation INTEGER,
  accuracy INTEGER,
  fluency INTEGER,
  completeness INTEGER,
  prosody INTEGER,
  mispronunciation INTEGER,
  omission INTEGER,
  insertion INTEGER,
  unexpected_break INTEGER,
  missing_break INTEGER,
  monotone INTEGER,
  json_file TEXT,
  active TEXT,
  FOREIGN KEY(id_record) REFERENCES record(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS catvocab (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  en TEXT,
  pt TEXT,
  description TEXT,
  mp3 TEXT,
  image TEXT,
  active TEXT
);

CREATE TABLE IF NOT EXISTS subcatvocab (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_catvocab INTEGER,
  en TEXT,
  pt TEXT,
  description TEXT,
  mp3 TEXT,
  image TEXT,
  active TEXT,
  FOREIGN KEY(id_catvocab) REFERENCES catvocab(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_subcatvocab INTEGER,
  en TEXT,
  pt TEXT,
  es TEXT,
  fr TEXT,
  de TEXT,
  ru TEXT,
  ar TEXT,
  description TEXT,
  mp3 TEXT,
  image TEXT,
  active TEXT,
  FOREIGN KEY(id_subcatvocab) REFERENCES subcatvocab(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS story (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  basic TEXT,
  intermediate TEXT,
  advanced TEXT,
  basic_mp3 TEXT,
  intermediate_mp3 TEXT,
  advanced_mp3 TEXT,
  image TEXT,
  active TEXT
);

COMMIT;
`;

db.exec(migration);

console.log('✅ Migrations executed');

export default db;
