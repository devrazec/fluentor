import fs from "fs";
import path from "path";
import db from "./connection.js";

// Enable foreign keys once per connection (or move to connection.js)
db.exec("PRAGMA foreign_keys = ON");

// Build absolute path to JSON
const jsonPath = path.join(
  process.cwd(),
  "src",
  "app",
  "store",
  "answer_vocabulary.json"
);

// Read + parse JSON
const jsonData = JSON.parse(
  fs.readFileSync(jsonPath, "utf8")
);

// Prepare insert
const insert = db.prepare(`
  INSERT INTO answer_vocabulary (id, subject, verb, noun, adjective, adverb, determiner, preposition, phrasal_verb, active)
  VALUES (@id, @subject, @verb, @noun, @adjective, @adverb, @determiner, @preposition, @phrasal_verb, @active)
`);

// Prevent double seeding
const { count } = db
  .prepare("SELECT COUNT(*) AS count FROM answer_vocabulary")
  .get();

if (count === 0) {
  const tx = db.transaction(() => {
    for (const json of jsonData) {
      insert.run(json);
    }
  });

  tx();
  console.log("🌱 Data seeded from JSON");
} else {
  console.log("ℹ️ Data already seeded");
}

export default db;