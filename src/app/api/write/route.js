import OpenAI from 'openai';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are a friendly English writing tutor. The user will send you a sentence or short paragraph they wrote in English.

Your task:
1. Identify any grammar, spelling, or phrasing mistakes.
2. Provide a corrected version if needed (skip this if the text is already correct).
3. Give a brief, encouraging explanation of what was wrong (or praise if it's correct).

Keep your response concise and easy to understand. Format:
- If correct: just confirm it's correct and give a short compliment.
- If incorrect: show the corrected version first, then explain the issues in 1–3 short bullet points.`;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const text = body?.text?.trim();
  if (!text) {
    return Response.json({ error: 'No text provided.' }, { status: 400 });
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  if (!endpoint || !apiKey || !deployment) {
    return Response.json(
      { error: 'Azure OpenAI is not configured.' },
      { status: 500 }
    );
  }

  const openai = new OpenAI({
    baseURL: endpoint,
    apiKey,
    defaultHeaders: { 'api-key': apiKey },
  });

  try {
    const completion = await openai.chat.completions.create({
      model: deployment,
      store: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      temperature: 0.4,
      max_tokens: 400,
    });

    const feedback = completion.choices[0]?.message?.content?.trim();
    if (!feedback) {
      return Response.json({ error: 'No response from AI.' }, { status: 502 });
    }

    return Response.json({ feedback });
  } catch (err) {
    return Response.json(
      { error: `AI request failed: ${err.message}` },
      { status: 500 }
    );
  }
}
