import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

export async function GET() {
  const question = db
    .prepare(
      `
    SELECT
      q.*,
      c.name  AS category_name,
      c.image AS category_image,
      t.name  AS tense_name,
      COUNT(a.id) AS total_answers
    FROM question q
    LEFT JOIN category c ON c.id = q.id_category
    LEFT JOIN tense   t ON t.id = q.id_tense
    LEFT JOIN answer  a ON a.id_question = q.id
    GROUP BY q.id
  `
    )
    .all();

  return Response.json(question);
}
