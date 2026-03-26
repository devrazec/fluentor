import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

export async function GET() {
  const catvocab = db.prepare(`SELECT * FROM catvocab ORDER BY id`).all();

  return Response.json(catvocab);
}
