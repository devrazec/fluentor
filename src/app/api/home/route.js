import db from '../../lib/db/connection.js';

export const runtime = 'nodejs';

const TENSE_GROUPS = [
  { id: 1, name: 'Present', tenseIds: [1, 2, 13, 14] },
  { id: 2, name: 'Past', tenseIds: [4, 8, 9, 10] },
  { id: 3, name: 'Future', tenseIds: [3, 5, 6, 7] },
  { id: 4, name: 'Conditional', tenseIds: [11, 12] },
];

export async function GET() {
  // Fetch all questions with joins
  const questions = db
    .prepare(
      `
    SELECT
      q.*,
      c.name  AS category_name,
      c.image AS category_image,
      t.name  AS tense_name,
      COUNT(a.id) AS total_answers
    FROM question q
    LEFT JOIN category c ON c.id = q.id_category
    LEFT JOIN tense   t ON t.id = q.id_tense
    LEFT JOIN answer  a ON a.id_question = q.id
    GROUP BY q.id
  `
    )
    .all();

  // Fetch tense names for group labels
  const tenses = db.prepare('SELECT id, name FROM tense').all();
  const tenseMap = Object.fromEntries(tenses.map(t => [t.id, t.name]));

  // Build groups
  const groups = TENSE_GROUPS.map(group => {
    const groupQuestions = questions.filter(q =>
      group.tenseIds.includes(q.id_tense)
    );
    return {
      group_id: group.id,
      group_name: group.name,
      tense_names: group.tenseIds
        .map(id => tenseMap[id])
        .filter(Boolean)
        .join(', '),
      tense_ids: group.tenseIds,
      total_questions: groupQuestions.length,
      questions: groupQuestions,
    };
  });

  return Response.json(groups);
}
