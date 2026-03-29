import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

export async function GET() {
  const story = db
    .prepare(
      `SELECT id, title, basic, intermediate, advanced,
              basic_mp3, intermediate_mp3, advanced_mp3, image, active
       FROM story
       WHERE id IN (
         SELECT MIN(id) FROM story GROUP BY title
       )
       ORDER BY title`
    )
    .all();

  return Response.json(story);
}
