#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const PROJECT_FILES = {
  pt: path.join(ROOT, 'data', 'projects', 'projects.json'),
  en: path.join(ROOT, 'data', 'projects', 'projects-en.json'),
  es: path.join(ROOT, 'data', 'projects', 'projects-es.json'),
};

function createProjectId() {
  return `prj_${crypto.randomUUID().replace(/-/g, '')}`;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, value) {
  const body = `${JSON.stringify(value, null, 4)}\n`;
  await fs.writeFile(filePath, body, 'utf8');
}

function ensureSameCategories(dataByLocale) {
  const categoriesPt = Object.keys(dataByLocale.pt);
  for (const locale of ['en', 'es']) {
    const categories = Object.keys(dataByLocale[locale]);
    const missing = categoriesPt.filter((category) => !categories.includes(category));
    if (missing.length > 0) {
      throw new Error(`Categorias ausentes em ${locale}: ${missing.join(', ')}`);
    }
  }
  return categoriesPt;
}

async function run() {
  const dataByLocale = {
    pt: await readJson(PROJECT_FILES.pt),
    en: await readJson(PROJECT_FILES.en),
    es: await readJson(PROJECT_FILES.es),
  };

  const categories = ensureSameCategories(dataByLocale);
  let totalProjects = 0;
  let createdIds = 0;
  let keptIds = 0;
  const collisions = [];
  const consistencyErrors = [];

  for (const category of categories) {
    const ptList = dataByLocale.pt[category];
    const enList = dataByLocale.en[category];
    const esList = dataByLocale.es[category];

    if (!Array.isArray(ptList) || !Array.isArray(enList) || !Array.isArray(esList)) {
      throw new Error(`Categoria inválida: ${category}`);
    }

    if (ptList.length !== enList.length || ptList.length !== esList.length) {
      throw new Error(
        `Quantidade divergente na categoria "${category}" (pt=${ptList.length}, en=${enList.length}, es=${esList.length}).`
      );
    }

    for (let index = 0; index < ptList.length; index += 1) {
      totalProjects += 1;
      const trio = [ptList[index], enList[index], esList[index]];
      const existingIds = trio
        .map((project) => (typeof project.id === 'string' ? project.id.trim() : ''))
        .filter(Boolean);
      const uniqueExisting = Array.from(new Set(existingIds));

      if (uniqueExisting.length > 1) {
        consistencyErrors.push(
          `IDs diferentes no mesmo projeto (${category}[${index}]): ${uniqueExisting.join(', ')}`
        );
        continue;
      }

      const id = uniqueExisting[0] || createProjectId();
      if (!uniqueExisting[0]) {
        createdIds += 1;
      } else {
        keptIds += 1;
      }

      trio.forEach((project) => {
        project.id = id;
      });
    }
  }

  if (consistencyErrors.length > 0) {
    throw new Error(`Falhas de consistência:\n- ${consistencyErrors.join('\n- ')}`);
  }

  const allIds = [];
  for (const category of categories) {
    dataByLocale.pt[category].forEach((project) => {
      allIds.push(project.id);
    });
  }
  const idSet = new Set();
  for (const id of allIds) {
    if (idSet.has(id)) {
      collisions.push(id);
    } else {
      idSet.add(id);
    }
  }

  if (collisions.length > 0) {
    throw new Error(`Colisão de IDs detectada: ${Array.from(new Set(collisions)).join(', ')}`);
  }

  await writeJson(PROJECT_FILES.pt, dataByLocale.pt);
  await writeJson(PROJECT_FILES.en, dataByLocale.en);
  await writeJson(PROJECT_FILES.es, dataByLocale.es);

  console.log('=== MIGRACAO DE IDS CONCLUIDA ===');
  console.log(`Total de projetos: ${totalProjects}`);
  console.log(`IDs criados: ${createdIds}`);
  console.log(`IDs mantidos: ${keptIds}`);
  console.log(`Colisoes: ${collisions.length}`);
  console.log('Consistencia entre locales: OK');
}

run().catch((error) => {
  console.error('[migrate-project-ids] erro:', error.message || error);
  process.exit(1);
});
