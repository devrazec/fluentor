import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

export async function GET() {
  const question = db
    .prepare(
      `
    SELECT * FROM (
      SELECT
        q.*,
        c.id  AS category_id,
        c.name  AS category_name,
        c.image AS category_image,
        t.id AS tense_id,
        t.name  AS tense_name,
        COUNT(a.id) AS total_answers,
        ROW_NUMBER() OVER (PARTITION BY q.id_category ORDER BY q.id) AS rn
      FROM question q
      LEFT JOIN category c ON c.id = q.id_category
      LEFT JOIN tense   t ON t.id = q.id_tense
      LEFT JOIN answer  a ON a.id_question = q.id
      GROUP BY q.id
    )
    ORDER BY rn, id_category
  `
    )
    .all();

  return Response.json(question);
}
