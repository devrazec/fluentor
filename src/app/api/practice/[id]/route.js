import db from '../../../lib/db/connection.js';

export const runtime = 'nodejs';

// GET question + all its answers by question id
export async function GET(request, { params }) {
  const { id } = await params;

  const question = db
    .prepare(
      `
    SELECT
      q.*,
      c.id AS id_category,
      c.name AS category_name,
      c.image AS category_image,
      t.id AS id_tense,
      t.name AS tense_name
    FROM question q
    LEFT JOIN category c ON c.id = q.id_category
    LEFT JOIN tense t ON t.id = q.id_tense
    WHERE q.id = ?
  `
    )
    .get(id);

  if (!question) {
    return Response.json({ message: 'Not found' }, { status: 404 });
  }

  const answers = db
    .prepare(
      `
    SELECT id, id_question, name, word, timed, mp3, active
    FROM answer
    WHERE id_question = ?
    ORDER BY id
  `
    )
    .all(id);

  return Response.json({ data: { ...question, answers } });
}
