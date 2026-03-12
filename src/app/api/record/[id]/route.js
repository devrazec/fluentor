import db from '../../../lib/db/connection.js';

export const runtime = 'nodejs';

// GET record + all its results by record id
export async function GET(request, { params }) {
  const { id } = await params;

  const record = db
    .prepare(
      `
    SELECT
      r.*,
      a.id AS id_answer
    FROM record r
    LEFT JOIN answer a ON a.id = r.id_answer
    WHERE r.id = ?
  `
    )
    .get(id);

  if (!record) {
    return Response.json({ message: 'Not found' }, { status: 404 });
  }

  const result = db
    .prepare(
      `
    SELECT *
    FROM result
    WHERE id_record = ?
    ORDER BY id
  `
    )
    .all(id);

  return Response.json({ data: { ...record, result } });
}
