import fs from "fs";
import path from "path";
import db from "./connection.js";

// Enable foreign keys once per connection (or move to connection.js)
db.exec("PRAGMA foreign_keys = ON");

const TIMED_DATA = [
  {
    id: 1,
    id_training: 1,
    time_sec: 10,
    word: '15 - 20',
    sentence: '1 - 2',
    description: 'Very short, basic answer',
    ielts: '4.0 - 5.0',
    toefl: '',
    cefr: 'A1 - A2',
    active: 'true'
  }
];

// Prepare insert
const insert = db.prepare(`
  INSERT INTO timed (id, id_training, time_sec, word, sentence, description, ielts, toefl, cefr, active)
  VALUES (@id, @id_training, @time_sec, @word, @sentence, @description, @ielts, @toefl, @cefr, @active)
`);

// Prevent double seeding
const { count } = db
  .prepare("SELECT COUNT(*) AS count FROM timed")
  .get();

if (count === 0) {
  const tx = db.transaction(() => {
    for (const data of TIMED_DATA) {
      insert.run(data);
    }
  });

  tx();
  console.log("🌱 Data seeded from JSON");
} else {
  console.log("ℹ️ Data already seeded");
}

export default db;