import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

// GET ALL (Refine expects array + total)
export async function GET() {
  const data = db
    .prepare(
      `
    SELECT
      c.*,
      COUNT(q.id) AS total_questions,
      GROUP_CONCAT(DISTINCT t.name) AS tenses
    FROM category c
    LEFT JOIN question q ON q.id_category = c.id
    LEFT JOIN tense t ON t.id = q.id_tense
    GROUP BY c.id
    ORDER BY c.id
  `
    )
    .all();

  // Convert tenses from comma string to array
  const result = data.map(c => ({
    ...c,
    tenses: c.tenses ? c.tenses.split(',') : [],
  }));

  return Response.json(result);
}

// CREATE
export async function POST(request) {
  const body = await request.json();
  const { name, image, active } = body;

  const stmt = db.prepare(`
    INSERT INTO category (name, image, active)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(name, image, active);

  const newRecord = db
    .prepare('SELECT * FROM category WHERE id = ?')
    .get(result.lastInsertRowid);

  return Response.json({ data: newRecord }, { status: 201 });
}
