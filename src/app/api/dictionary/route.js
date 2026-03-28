import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  const dictionary = q
    ? db
        .prepare(
          `
      SELECT
        w.word,
        (SELECT GROUP_CONCAT(phonetic, ', ')
         FROM (SELECT DISTINCT phonetic FROM phonetics WHERE word = w.word)) AS phonetic,
        (SELECT GROUP_CONCAT(rel, '; ')
         FROM (SELECT DISTINCT relation || ' → ' || target AS rel FROM related WHERE word = w.word)) AS related,
        (SELECT GROUP_CONCAT(def, ' | ')
         FROM (SELECT DISTINCT '[' || part_of_speech || '] ' || definition AS def FROM meanings WHERE word = w.word)) AS meaning
      FROM word_list w
      WHERE w.word LIKE ? ESCAPE '\\'
      ORDER BY w.word
      LIMIT 200
    `
        )
        .all(`${q.replace(/[%_\\]/g, '\\$&')}%`)
    : [];

  return Response.json(dictionary);
}
