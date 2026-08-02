/**
 * Engine smoke test — runs parse → local curriculum generation without a server.
 * Self-contained: uses an inline sample document (no fixture files needed).
 */
import { parseDocument } from '../src/engine/parse';
import { generateCurriculum } from '../src/engine';

const SAMPLE = `# The Science of Learning and Memory

## How Memory Works
Memory is the process by which information is encoded, stored, and later retrieved.
Working memory is the small amount of information that a person can hold in mind at one time.

## Spaced Repetition
Spaced repetition is the practice of reviewing material at gradually increasing intervals.
The spacing effect is one of the most robust findings in all of learning science.

## Retrieval Practice
Retrieval practice is the act of recalling information from memory rather than simply re-reading it.
The testing effect is the finding that retrieving information strengthens memory more than studying it again.`;

async function main() {
  const parsed = await parseDocument({ fileType: 'md', buffer: Buffer.from(SAMPLE) });
  console.log(`\nParsed "${parsed.title}" — ${parsed.wordCount} words, ${parsed.chunks.length} chunks`);
  console.log('Outline:', parsed.outline.slice(0, 8).join(' | '));

  const result = await generateCurriculum(parsed, { prefer: 'local' });
  const c = result.curriculum;
  console.log(`\nCurriculum: "${c.title}" — ${c.modules.length} modules`);
  for (const m of c.modules) {
    console.log(`  [M] ${m.title} (${m.lessons.length} lessons)`);
    for (const l of m.lessons) {
      console.log(`      - ${l.title}: concepts ${l.concepts.length}, quizzes ${l.quizzes.length}`);
    }
  }
  console.log(`\nFlashcards: ${result.flashcards.length}`);

  // Validation checks
  const noRefs: string[] = [];
  for (const m of c.modules)
    for (const l of m.lessons) {
      for (const k of l.concepts) if (!k.sourceRef) noRefs.push(`concept ${k.name}`);
      for (const q of l.quizzes) if (!q.sourceRef) noRefs.push(`quiz ${q.question.slice(0, 30)}`);
    }
  if (noRefs.length) {
    console.log('\n⚠ items missing citations:', noRefs.slice(0, 5));
    process.exitCode = 1;
  } else {
    console.log('\n✓ every generated item carries a source citation');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
