import db from "./connection.js";

// VERY IMPORTANT for SQLite
db.exec("PRAGMA foreign_keys = ON");

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

COMMIT;
`;

db.exec(migration);

console.log("✅ Migrations executed");

export default db;