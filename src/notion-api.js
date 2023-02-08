import * as core from '@actions/core';
import { Client } from '@notionhq/client';

const notionSecret = core.getInput('notion-secret', { required: true });
const notion = new Client({ auth: notionSecret });

function stringifyProperty(property) {
  if (!property) throw new Error(`unknown property`);

  switch (property.type) {
    case 'select':
      return property[property.type].name;
    case 'title':
    case 'rich_text':
      return property[property.type]
        .map((richText) => richText.plain_text)
        .join();
    default:
      throw new Error(`property type '${property.type}' not supported`);
  }
}

export async function fetchPublishedPages(databaseId) {
  core.info(`Fetching database: ${databaseId}`);

  const { results } = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: {
        equals: 'Published',
      },
    },
    sorts: [
      {
        property: 'File Name',
        direction: 'ascending',
      },
    ],
  });

  const pages = [];

  for (const page of results) {
    pages.push({
      id: page.id,
      title: stringifyProperty(page.properties['Title']),
      fileName: stringifyProperty(page.properties['File Name']),
      slug: stringifyProperty(page.properties['Slug']),
      type: stringifyProperty(page.properties['Type']),
    });
  }

  return pages;
}

export async function fetchBlockChildren({
  blockId,
  startCursor,
  recursive = false,
}) {
  core.info(
    `Fetching block: ${blockId} ${startCursor ? `@ ${startCursor}` : ''}`,
  );
  const response = await notion.blocks.children.list({
    block_id: blockId,
    start_cursor: startCursor,
    page_size: 100,
  });

  const blockChildren = response.results;

  if (!recursive) return blockChildren;

  for (let i = 0; i < blockChildren.length; i++) {
    if (blockChildren[i].has_children) {
      blockChildren[i].children = await fetchBlockChildren({
        blockId: blockChildren[i].id,
        recursive: true,
      });
    }
  }

  if (response.has_more) {
    const nextBlockChildren = await fetchBlockChildren({
      blockId,
      startCursor: response.next_cursor,
      recursive: true,
    });

    blockChildren.push(...nextBlockChildren);
  }

  return blockChildren;
}
