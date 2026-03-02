import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

// Whitelist sortable fields to prevent SQL injection
const SORT_FIELD_MAP = {
  id: 'a.id',
  name: 'a.name',
  question_name: 'q.name',
  category_name: 'c.name',
  tense_name: 't.name',
  correct: 'a.correct',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') || '20'))
  );
  const offset = (page - 1) * pageSize;
  const search = searchParams.get('search') || '';
  const sortField = SORT_FIELD_MAP[searchParams.get('sortField')] ?? 'a.id';
  const sortDir = searchParams.get('sortDir') === 'desc' ? 'DESC' : 'ASC';

  const like = `%${search}%`;
  const whereClause = search
    ? `WHERE a.name LIKE ? OR q.name LIKE ? OR c.name LIKE ? OR t.name LIKE ?`
    : '';
  const whereParams = search ? [like, like, like, like] : [];

  const data = db
    .prepare(
      `
    SELECT
      a.*,
      q.name  AS question_name,
      c.name  AS category_name,
      c.image AS category_image,
      t.name  AS tense_name
    FROM answer a
    LEFT JOIN question q ON q.id = a.id_question
    LEFT JOIN category c ON c.id = q.id_category
    LEFT JOIN tense t ON t.id = q.id_tense
    ${whereClause}
    GROUP BY a.id
    ORDER BY ${sortField} ${sortDir}
    LIMIT ? OFFSET ?
  `
    )
    .all(...whereParams, pageSize, offset);

  const total = db
    .prepare(
      `
    SELECT COUNT(*) as count
    FROM answer a
    LEFT JOIN question q ON q.id = a.id_question
    LEFT JOIN category c ON c.id = q.id_category
    LEFT JOIN tense t ON t.id = q.id_tense
    ${whereClause}
  `
    )
    .get(...whereParams).count;

  return Response.json({ data, total, page, pageSize });
}
