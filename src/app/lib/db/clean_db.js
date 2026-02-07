import db from "./connection.js";

db.exec("PRAGMA foreign_keys = OFF");

db.exec(`
  DROP TABLE IF EXISTS question_category;
  DROP TABLE IF EXISTS exam_training;
  DROP TABLE IF EXISTS question;
  DROP TABLE IF EXISTS type_question;
  DROP TABLE IF EXISTS verb_tense;
  DROP TABLE IF EXISTS exam;
  DROP TABLE IF EXISTS training;
  DROP TABLE IF EXISTS category;
  DROP TABLE IF EXISTS settings;
`);

db.exec("PRAGMA foreign_keys = ON");

console.log("🧹 Database cleaned");
process.exit(0);
