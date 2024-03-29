import * as core from '@actions/core';
import * as io from '@actions/io';
import { promises as fs } from 'node:fs';
import { toHtml } from 'hast-util-to-html';
import { lowerCase } from 'lodash-es';
import rehypeFormat from 'rehype-format';
import 'dotenv/config';

import { fetchPublishedPages, fetchBlockChildren } from './notion-api.js';
import { fromNotion } from './hast-from-notion.js';
import { importExamples } from './import-examples.js';
import { importImages } from './import-images.js';
import { handlePagesInternalLinks } from './internal-links.js';
import { mergeSideBySideFigures } from './plugins/side-by-side-figures.js';
import {
  joinAdjacentAnchors,
  joinAdjacentCode,
} from './plugins/adjacent-elements.js';

const formatHast = rehypeFormat();

main();

async function main() {
  try {
    const notionDatabaseId = core.getInput('notion-database-id', {
      required: true,
    });

    await fs.mkdir('.temp', { recursive: true });

    const pages = await fetchPublishedPages(notionDatabaseId);

    // Import db & all pages
    await saveIndex(pages);

    for (let page of pages) {
      await transformPage(page);
    }

    // add internal links
    handlePagesInternalLinks(pages);

    for (let page of pages) {
      await savePage(page);
    }

    const outputFolder = core.getInput('output-folder') || 'content/';

    await io.rmRF(outputFolder);
    await io.mkdirP(outputFolder);
    await io.cp('.temp', outputFolder, {
      recursive: true,
      copySourceDirectory: false,
    });
    await io.rmRF('.temp');
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function saveIndex(pageList) {
  const chapters = pageList
    .filter((page) => page.status === 'Published')
    .map((page) => {
      return {
        title: page.title,
        type: lowerCase(page.type),
        src: `./${page.fileName}.html`,
        slug: page.slug || page.fileName,
      };
    });

  await fs.writeFile('.temp/content.json', JSON.stringify(chapters));
}

async function transformPage(page) {
  // Get all page content recursively
  const pageContent = await fetchBlockChildren({
    blockId: page.id,
    recursive: true,
  });

  // Transform Notion content to hast
  const pageTitle = (page.type === 'Chapter' ? 'Chapter ' : '') + page.title;
  const pageType = lowerCase(page.type);
  const hast = fromNotion(pageContent, pageTitle, pageType);

  // Apply post processing plugin
  mergeSideBySideFigures(hast);
  joinAdjacentAnchors(hast);
  joinAdjacentCode(hast);

  // Format using plugin
  formatHast(hast);

  page.hast = hast;
}

async function savePage({ fileName, hast }) {
  // Import images & examples to local folders
  await importImages({
    hast,
    slug: fileName,
  });
  await importExamples({
    hast,
    slug: fileName,
  });

  core.info(`Creating file: ${fileName}.html`);
  await fs.writeFile(`.temp/${fileName}.html`, toHtml(hast));
}
