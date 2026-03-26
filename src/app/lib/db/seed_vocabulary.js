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
  'Vocabulary.xlsx'
);

// Read + parse XLSX
const workbook = XLSX.read(fs.readFileSync(xlsxPath));
const sheetCatVocab = workbook.Sheets[workbook.SheetNames[0]];
const sheetSubCatVocab = workbook.Sheets[workbook.SheetNames[1]];
const sheetVocabulary = workbook.Sheets[workbook.SheetNames[2]];

const jsonDataCatVocab = XLSX.utils.sheet_to_json(sheetCatVocab);
const jsonDataSubCatVocab = XLSX.utils.sheet_to_json(sheetSubCatVocab);
const jsonDataVocab = XLSX.utils.sheet_to_json(sheetVocabulary);

// Prepare inserts
const insertCatVocab = db.prepare(`
  INSERT INTO catvocab (id, en, pt, description, mp3, image, active)
  VALUES (@id, @en, @pt, @description, @mp3, @image, @active)
`);

const insertSubCatVocab = db.prepare(`
  INSERT INTO subcatvocab (id, id_catvocab, en, pt, description, mp3, image, active)
  VALUES (@id, @id_catvocab, @en, @pt, @description, @mp3, @image, @active)
`);

const insertVocabulary = db.prepare(`
  INSERT INTO vocabulary (id, id_subcatvocab, en, pt, es, fr, de, ru, ar, description, mp3, image, active)
  VALUES (@id, @id_subcatvocab, @en, @pt, @es, @fr, @de, @ru, @ar, @description, @mp3, @image, @active)
`);

// Insert catvocab
const { count: countCatVocab } = db
  .prepare('SELECT COUNT(*) AS count FROM catvocab')
  .get();
if (countCatVocab === 0) {
  const tx = db.transaction(() => {
    for (const json of jsonDataCatVocab) {
      insertCatVocab.run({
        description: null,
        mp3: null,
        image: null,
        active: 1,
        ...json,
      });
    }
  });
  tx();
  console.log('🌱 catvocab seeded');
} else {
  console.log('ℹ️ catvocab already seeded');
}

// Insert subcatvocab
const { count: countSubCatVocab } = db
  .prepare('SELECT COUNT(*) AS count FROM subcatvocab')
  .get();
if (countSubCatVocab === 0) {
  const tx = db.transaction(() => {
    for (const json of jsonDataSubCatVocab) {
      insertSubCatVocab.run({
        description: null,
        mp3: null,
        image: null,
        active: 1,
        ...json,
      });
    }
  });
  tx();
  console.log('🌱 subcatvocab seeded');
} else {
  console.log('ℹ️ subcatvocab already seeded');
}

// Insert vocabulary
const { count: countVocabulary } = db
  .prepare('SELECT COUNT(*) AS count FROM vocabulary')
  .get();
if (countVocabulary === 0) {
  const tx = db.transaction(() => {
    for (const json of jsonDataVocab) {
      insertVocabulary.run({
        description: null,
        mp3: null,
        image: null,
        active: 1,
        ...json,
      });
    }
  });
  tx();
  console.log('🌱 vocabulary seeded');
} else {
  console.log('ℹ️ vocabulary already seeded');
}

export default db;
