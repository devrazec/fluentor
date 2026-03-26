import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

export async function GET() {
  const subcatvocab = db.prepare(`SELECT * FROM subcatvocab ORDER BY id`).all();

  return Response.json(subcatvocab);
}
