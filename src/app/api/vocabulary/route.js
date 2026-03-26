import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

export async function GET() {
  const vocabulary = db
    .prepare(
      `
    SELECT
      v.*,
      sc.id_catvocab,
      sc.en AS subcategory_en,
      sc.pt AS subcategory_pt,
      c.en AS category_en,
      c.pt AS category_pt
    FROM vocabulary v
    LEFT JOIN subcatvocab sc ON sc.id = v.id_subcatvocab
    LEFT JOIN catvocab c ON c.id = sc.id_catvocab
    ORDER BY v.id
  `
    )
    .all();

  return Response.json(vocabulary);
}
