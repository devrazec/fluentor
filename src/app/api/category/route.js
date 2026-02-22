import db from "../../lib/db/connection.js";

export const runtime = "nodejs";

// GET ALL (Refine expects array + total)
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  const offset = (page - 1) * pageSize;

  const data = db
    .prepare("SELECT * FROM category LIMIT ? OFFSET ?")
    .all(pageSize, offset);

  const total = db
    .prepare("SELECT COUNT(*) as count FROM category")
    .get().count;

  return Response.json({ data, total });
}

// CREATE
export async function POST(request) {
  const body = await request.json();
  const { name, description, mp3, image, active } = body;

  const stmt = db.prepare(`
    INSERT INTO category (name, description, mp3, image, active)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(name, description, mp3, image, active);

  const newRecord = db
    .prepare("SELECT * FROM category WHERE id = ?")
    .get(result.lastInsertRowid);

  return Response.json({ data: newRecord }, { status: 201 });
}
