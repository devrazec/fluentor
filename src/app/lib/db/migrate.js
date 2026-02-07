import db from "./connection.js";

// VERY IMPORTANT for SQLite
db.exec("PRAGMA foreign_keys = ON");

const migration = `
BEGIN;

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE,
  value TEXT
);

CREATE TABLE IF NOT EXISTS category (
  id INTEGER PRIMARY KEY,
  name TEXT,
  description TEXT,
  mp3 TEXT,
  image TEXT,
  active TEXT
);

CREATE TABLE IF NOT EXISTS training (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  description TEXT,
  skill TEXT,
  mp3 TEXT,
  image TEXT,
  time_range TEXT,
  active TEXT
);

CREATE TABLE IF NOT EXISTS exam (
  id INTEGER PRIMARY KEY,
  name TEXT,
  description TEXT,
  mp3 TEXT,
  image TEXT,
  time_min TEXT,
  active TEXT
);

CREATE TABLE IF NOT EXISTS verb_tense (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  description TEXT,
  mp3 TEXT,
  image TEXT,
  active TEXT
);

CREATE TABLE IF NOT EXISTS type_question (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  description TEXT,
  active TEXT
);

CREATE TABLE IF NOT EXISTS question (
  id INTEGER PRIMARY KEY,
  id_type_question INTEGER,
  id_verb_tense INTEGER, 
  name TEXT,
  active TEXT,
  FOREIGN KEY(id_type_question) REFERENCES type_question(id) ON DELETE CASCADE,
  FOREIGN KEY(id_verb_tense) REFERENCES verb_tense(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_training (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_exam INTEGER,
  id_training INTEGER, 
  name TEXT,
  description TEXT,
  mp3 TEXT,
  image TEXT,
  time_sec TEXT,
  active TEXT,
  FOREIGN KEY(id_exam) REFERENCES exam(id) ON DELETE CASCADE,
  FOREIGN KEY(id_training) REFERENCES training(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_question INTEGER,
  id_category INTEGER, 
  name TEXT UNIQUE,
  description TEXT,
  mp3 TEXT,
  image TEXT,
  active TEXT,
  FOREIGN KEY(id_question) REFERENCES question(id) ON DELETE CASCADE,
  FOREIGN KEY(id_category) REFERENCES category(id) ON DELETE CASCADE
);

COMMIT;
`;

db.exec(migration);

console.log("✅ Migrations executed");

export default db;
