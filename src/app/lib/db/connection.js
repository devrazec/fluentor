import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const storeDir = path.join(process.cwd(), "src", "app", "store");
if (!fs.existsSync(storeDir)) {
  fs.mkdirSync(storeDir, { recursive: true });
}

const dbPath = path.join(storeDir, "fluentor.db");

const db = new Database(dbPath);

export default db;