// Checks every case write-up (src/data/projects.json: description, description_en, description_es) and summary
// against the content standard in docs/desenvolvimento.md ("Padrão das descrições"). Runs before every build (npm run build) and on
// its own with `npm run check:content`; any break stops the build with the project, language and rule.
import { readFileSync } from 'node:fs';
import { checkProject } from './description-rules.mjs';

const projects = JSON.parse(readFileSync(new URL('../src/data/projects.json', import.meta.url), 'utf8'));

const errors = projects.flatMap(checkProject);

if (errors.length) {
  console.error(`[content] ${errors.length} problema(s) nas descrições (docs/desenvolvimento.md, "Padrão das descrições"):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`[content] ${projects.length} descrições no padrão, nos três idiomas.`);
