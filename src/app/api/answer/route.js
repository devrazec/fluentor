import db from '../../lib/db/connection.js';

export const runtime = "nodejs";

export async function GET() {
  const answer = db.prepare('SELECT * FROM answer').all();
  return Response.json(answer);
}
