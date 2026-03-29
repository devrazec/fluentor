import db from '../../../lib/db/connection.js';

export const runtime = 'nodejs';

// GET story + all its answers by story id
export async function GET(request, { params }) {
  const { id } = await params;

  const story = db
    .prepare(
      `
    SELECT
      s.*
    FROM story s
    WHERE s.id = ?
  `
    )
    .get(id);

  if (!story) {
    return Response.json({ message: 'Not found' }, { status: 404 });
  }

  return Response.json({ data: { ...story } });
}
