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
  "type_question.json"
);

// Read + parse JSON
const jsonData = JSON.parse(
  fs.readFileSync(jsonPath, "utf8")
);

// Prepare insert
const insert = db.prepare(`
  INSERT INTO type_question (id, name, description, active)
  VALUES (@id, @name, @description, @active)
`);

// Prevent double seeding
const { count } = db
  .prepare("SELECT COUNT(*) AS count FROM type_question")
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