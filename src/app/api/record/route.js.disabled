import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

// GET ALL
export async function GET() {
  const data = db
    .prepare(
      `
      SELECT
        r.*,
        res.pronunciation,
        res.accuracy,
        res.fluency,
        res.completeness,
        res.prosody,
        res.mispronunciation,
        res.omission,
        res.insertion,
        res.unexpected_break,
        res.missing_break,
        res.monotone,
        res.json_file
      FROM record r
      LEFT JOIN result res ON res.id_record = r.id
      ORDER BY r.id
    `
    )
    .all();

  return Response.json(data);
}

// CREATE
export async function POST(request) {
  const body = await request.json();
  const {
    id_user,
    id_answer,
    mp3,
    duration,
    date,
    active,
    pronunciation,
    accuracy,
    fluency,
    completeness,
    prosody,
    mispronunciation,
    omission,
    insertion,
    unexpected_break,
    missing_break,
    monotone,
    json_file,
  } = body;

  const insertRecord = db.prepare(`
    INSERT INTO record (id_user, id_answer, mp3, duration, date, active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertResult = db.prepare(`
    INSERT INTO result (id_record, pronunciation, accuracy, fluency, completeness, prosody, mispronunciation, omission, insertion, unexpected_break, missing_break, monotone, json_file, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    const recordRes = insertRecord.run(
      id_user,
      id_answer,
      mp3,
      duration,
      date,
      active
    );
    const id_record = recordRes.lastInsertRowid;
    insertResult.run(
      id_record,
      pronunciation,
      accuracy,
      fluency,
      completeness,
      prosody,
      mispronunciation,
      omission,
      insertion,
      unexpected_break,
      missing_break,
      monotone,
      json_file,
      active
    );
    return id_record;
  });

  const id_record = tx();

  const newRecord = db
    .prepare(
      `
      SELECT r.*, res.pronunciation, res.accuracy, res.fluency, res.completeness,
        res.prosody, res.mispronunciation, res.omission, res.insertion,
        res.unexpected_break, res.missing_break, res.monotone, res.json_file
      FROM record r
      LEFT JOIN result res ON res.id_record = r.id
      WHERE r.id = ?
    `
    )
    .get(id_record);

  return Response.json({ data: newRecord }, { status: 201 });
}
