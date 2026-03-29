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
  //'Vocabulary1.xlsx'
  'Google_Vocabulary2.xlsx'
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
const tx1 = db.transaction(() => {
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
tx1();
console.log('🌱 catvocab seeded');

// Insert subcatvocab
const tx2 = db.transaction(() => {
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
tx2();
console.log('🌱 subcatvocab seeded');

// Insert vocabulary
const tx3 = db.transaction(() => {
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
tx3();
console.log('🌱 vocabulary seeded');

export default db;
