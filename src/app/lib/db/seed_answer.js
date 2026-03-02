import fs from 'fs';
import path from 'path';
import db from './connection.js';
import * as XLSX from 'xlsx';

// Enable foreign keys once per connection (or move to connection.js)
db.exec('PRAGMA foreign_keys = ON');

// Build absolute path to XLSX
const xlsxPath = path.join(
  process.cwd(),
  'src',
  'app',
  'store',
  '828_Answer.xlsx'
);

// Read + parse XLSX
const workbook = XLSX.read(fs.readFileSync(xlsxPath));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(sheet);

// Prepare insert
const insert = db.prepare(`
  INSERT INTO answer (id, id_question, name, word, timed, mp3, active)
  VALUES (@id, @id_question, @name, @word, @timed, @mp3, @active)
`);

// Prevent double seeding
const { count } = db.prepare('SELECT COUNT(*) AS count FROM answer').get();

if (count === 0) {
  const tx = db.transaction(() => {
    for (const json of jsonData) {
      insert.run(json);
    }
  });

  tx();
  console.log('🌱 Data seeded from JSON');
} else {
  console.log('ℹ️ Data already seeded');
}

export default db;
