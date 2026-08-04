/**
 * Lumora prompt library.
 *
 * Prompts are first-class, versioned assets (see /prompts for the full library).
 * The master Curriculum → JSON prompt mirrors the product spec: modules →
 * lessons → concepts → quizzes, with mandatory source references.
 */

export const CURRICULUM_PROMPT = `You are an expert curriculum designer and learning scientist. Given a document, create a structured learning curriculum that turns it into a guided study path.

Rules:
1. Break the document into MODULES (major themes/chapters). Order them to build understanding.
2. Within each module, create LESSONS (2–4) with clear learning objectives.
3. Extract KEY CONCEPTS (3–6 per lesson) with concise definitions.
4. For each lesson, generate 3–5 active-recall quiz questions. Use a mix of types: multiple choice (with 4 options), fill-in-the-blank, and short answer.
5. CRITICAL — every claim must be traceable: reference the exact source passage using the chunk tags given in the document text, e.g. "§ [12]" refers to chunk 12. Never invent a citation. If a claim is not in the document, omit it.

The document is provided as numbered chunks:
{% chunks %}

Respond with ONLY valid JSON matching this exact schema (no markdown fences):
{
  "curriculum": {
    "title": "…",
    "description": "…",
    "modules": [
      {
        "title": "…",
        "description": "…",
        "lessons": [
          {
            "title": "…",
            "content": "concise guided explanation grounded in the source",
            "objectives": ["…", "…"],
            "concepts": [{"name": "…", "definition": "…", "sourceRef": "§ [12]"}],
            "quizzes": [
              {"type": "mcq", "question": "…", "options": ["a","b","c","d"], "answer": "…", "explanation": "…", "sourceRef": "§ [12]"}
            ]
          }
        ]
      }
    ]
  }
}`;

export const TIPS = [
  'Spacing practice out over time builds far more durable memory than cramming — that’s why Lumora schedules your next review automatically.',
  'Active recall (answering questions) is roughly twice as effective for retention as re-reading.',
  'Explaining a concept in your own words is the strongest test of whether you truly understand it.',
  'Making mistakes during practice is a feature: retrieval failure followed by feedback strengthens memory.',
  'Interleaving topics during practice improves long-term retention more than blocked practice.',
  'Sleep consolidates memory — the neurons involved in learning fire again during deep sleep.',
  'The “testing effect”: each time you retrieve a fact, you strengthen the neural pathway to it.',
  'Desirable difficulty: slightly hard retrieval feels worse but produces stronger learning.',
  'Your brain is a prediction engine — questions that surprise you are the ones you remember.',
  'Mastery isn’t knowing it once; it’s knowing it after a gap. Lumora schedules those gaps.',
];

export function randomTip(): string {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}

export function buildChunksBlock(chunks: { index: number; text: string }[]): string {
  const MAX_CHARS = 24000;
  let total = 0;
  const parts: string[] = [];
  for (const c of chunks) {
    const t = c.text.trim();
    if (!t) continue;
    if (total + t.length > MAX_CHARS) break;
    parts.push(`[${c.index}] ${t}`);
    total += t.length + 6;
  }
  return parts.join('\n\n');
}
