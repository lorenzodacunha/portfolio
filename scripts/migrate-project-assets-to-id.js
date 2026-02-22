#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJECT_FILES = {
  pt: path.join(ROOT, 'data', 'projects', 'projects.json'),
  en: path.join(ROOT, 'data', 'projects', 'projects-en.json'),
  es: path.join(ROOT, 'data', 'projects', 'projects-es.json'),
};

const THUMBS_DIR = path.join(ROOT, 'assets', 'images', 'thumbs');
const PROJECTS_DIR = path.join(ROOT, 'assets', 'images', 'projects');

function normalizeAssetPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function relFromRoot(absPath) {
  return normalizeAssetPath(path.relative(ROOT, absPath));
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, value) {
  const body = `${JSON.stringify(value, null, 4)}\n`;
  await fs.writeFile(filePath, body, 'utf8');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function moveFileSafe(source, target) {
  if (source === target) return { moved: false, reason: 'same' };
  await fs.mkdir(path.dirname(target), { recursive: true });
  if (await fileExists(target)) {
    return { moved: false, reason: 'target_exists' };
  }
  await fs.rename(source, target);
  return { moved: true, reason: 'renamed' };
}

async function copyFileSafe(source, target) {
  if (source === target) return { copied: false, reason: 'same' };
  await fs.mkdir(path.dirname(target), { recursive: true });
  if (await fileExists(target)) {
    return { copied: false, reason: 'target_exists' };
  }
  await fs.copyFile(source, target);
  return { copied: true, reason: 'copied' };
}

function ensureLocaleShape(dataByLocale) {
  const categories = Object.keys(dataByLocale.pt);
  for (const locale of ['en', 'es']) {
    for (const category of categories) {
      if (!Array.isArray(dataByLocale[locale][category])) {
        throw new Error(`Categoria ausente/invalida em ${locale}: ${category}`);
      }
      if (dataByLocale[locale][category].length !== dataByLocale.pt[category].length) {
        throw new Error(`Quantidade divergente na categoria ${category} em ${locale}.`);
      }
    }
  }
  return categories;
}

async function run() {
  const dataByLocale = {
    pt: await readJson(PROJECT_FILES.pt),
    en: await readJson(PROJECT_FILES.en),
    es: await readJson(PROJECT_FILES.es),
  };
  const categories = ensureLocaleShape(dataByLocale);

  let thumbMigrated = 0;
  let galleryMigrated = 0;
  const errors = [];
  const movedSources = new Set();

  for (const category of categories) {
    const ptList = dataByLocale.pt[category];
    for (let index = 0; index < ptList.length; index += 1) {
      const projects = {
        pt: dataByLocale.pt[category][index],
        en: dataByLocale.en[category][index],
        es: dataByLocale.es[category][index],
      };
      const id = projects.pt.id;
      if (!id) {
        errors.push(`[${category}#${index}] projeto sem id.`);
        continue;
      }

      const thumbSources = ['pt', 'en', 'es']
        .map((locale) => normalizeAssetPath(projects[locale].image))
        .filter(Boolean);
      const thumbSource = thumbSources[0];
      if (!thumbSource) {
        errors.push(`[${id}] thumb ausente no JSON.`);
        continue;
      }

      const thumbTargetAbs = path.join(THUMBS_DIR, `${id}.webp`);
      const thumbTargetRel = relFromRoot(thumbTargetAbs);
      const thumbSourceAbs = path.join(ROOT, thumbSource);
      if (!(await fileExists(thumbSourceAbs))) {
        if (!(await fileExists(thumbTargetAbs))) {
          errors.push(`[${id}] arquivo thumb inexistente: ${thumbSource}`);
        }
      } else if (!movedSources.has(thumbSourceAbs)) {
        const thumbMoveResult = await moveFileSafe(thumbSourceAbs, thumbTargetAbs);
        if (thumbMoveResult.moved) {
          thumbMigrated += 1;
          movedSources.add(thumbSourceAbs);
        }
      }

      const canonicalImages = Array.isArray(projects.pt.images) ? projects.pt.images : [];
      const newGalleryPaths = [];
      const galleryTargetDirAbs = path.join(PROJECTS_DIR, id);
      await fs.mkdir(galleryTargetDirAbs, { recursive: true });

      for (let imageIndex = 0; imageIndex < canonicalImages.length; imageIndex += 1) {
        const sourceRel = normalizeAssetPath(canonicalImages[imageIndex]);
        const sourceAbs = path.join(ROOT, sourceRel);
        const targetAbs = path.join(
          galleryTargetDirAbs,
          `${id}__${String(imageIndex + 1).padStart(3, '0')}.webp`
        );
        const targetRel = relFromRoot(targetAbs);

        if (!(await fileExists(sourceAbs))) {
          if (await fileExists(targetAbs)) {
            newGalleryPaths.push(targetRel);
            continue;
          }

          // Caso especial: a galeria apontava para a mesma imagem da thumb e ela ja foi movida.
          const thumbSourceMatches = sourceRel === thumbSource;
          if (thumbSourceMatches && (await fileExists(thumbTargetAbs))) {
            const copyResult = await copyFileSafe(thumbTargetAbs, targetAbs);
            if (copyResult.copied) {
              galleryMigrated += 1;
            }
            newGalleryPaths.push(targetRel);
            continue;
          }

          const isFirstIdFramePath =
            sourceRel === targetRel &&
            path.posix.basename(targetRel) === `${id}__001.webp`;
          if (isFirstIdFramePath && (await fileExists(thumbTargetAbs))) {
            const copyResult = await copyFileSafe(thumbTargetAbs, targetAbs);
            if (copyResult.copied) {
              galleryMigrated += 1;
            }
            newGalleryPaths.push(targetRel);
            continue;
          }

          errors.push(`[${id}] imagem inexistente: ${sourceRel}`);
          newGalleryPaths.push(targetRel);
          continue;
        }
        if (!movedSources.has(sourceAbs)) {
          const moveResult = await moveFileSafe(sourceAbs, targetAbs);
          if (moveResult.moved) {
            galleryMigrated += 1;
            movedSources.add(sourceAbs);
          }
        }
        newGalleryPaths.push(targetRel);
      }

      for (const locale of ['pt', 'en', 'es']) {
        projects[locale].image = thumbTargetRel;
        projects[locale].images = [...newGalleryPaths];
      }
    }
  }

  await writeJson(PROJECT_FILES.pt, dataByLocale.pt);
  await writeJson(PROJECT_FILES.en, dataByLocale.en);
  await writeJson(PROJECT_FILES.es, dataByLocale.es);

  // Validacao final de referencias
  let missingRefs = 0;
  for (const category of Object.keys(dataByLocale.pt)) {
    for (const project of dataByLocale.pt[category]) {
      const refs = [project.image, ...(Array.isArray(project.images) ? project.images : [])];
      for (const ref of refs) {
        const abs = path.join(ROOT, normalizeAssetPath(ref));
        if (!(await fileExists(abs))) {
          missingRefs += 1;
          errors.push(`[${project.id}] referencia ausente apos migracao: ${ref}`);
        }
      }
    }
  }

  console.log('=== MIGRACAO DE ASSETS PARA ID CONCLUIDA ===');
  console.log(`Thumbs migradas: ${thumbMigrated}`);
  console.log(`Imagens de galeria migradas: ${galleryMigrated}`);
  console.log(`Referencias faltantes apos migracao: ${missingRefs}`);
  console.log(`Itens com erro: ${errors.length}`);
  if (errors.length > 0) {
    console.log('--- Detalhes dos erros ---');
    errors.forEach((line) => console.log(line));
  }
}

run().catch((error) => {
  console.error('[migrate-project-assets-to-id] erro:', error.message || error);
  process.exit(1);
});
