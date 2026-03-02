import db from '../../lib/db/connection.js';

export const runtime = "nodejs";

export async function GET() {
  const tense = db.prepare(`
    SELECT
      t.*,
      COUNT(q.id) AS total_questions,
      GROUP_CONCAT(DISTINCT c.name) AS categories
    FROM tense t
    LEFT JOIN question q ON q.id_tense = t.id
    LEFT JOIN category c ON c.id = q.id_category
    GROUP BY t.id
  `).all();

  const result = tense.map((t) => ({
    ...t,
    categories: t.categories ? t.categories.split(',') : [],
  }));

  return Response.json(result);
}
