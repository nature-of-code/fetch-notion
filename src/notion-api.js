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

async function retryRequest(request, retryTimes = 5) {
  while (retryTimes > 0) {
    try {
      const result = await request();
      return result;
    } catch (error) {
      if (retryTimes === 1) throw error;
      await new Promise((res) => setTimeout(res, 1000));
      retryTimes--;
    }
  }
}

export async function fetchPublishedPages(databaseId) {
  core.info(`Fetching database: ${databaseId}`);

  const { results } = await retryRequest(() =>
    notion.databases.query({
      database_id: databaseId,
      filter: {
        or: [
          {
            property: 'Status',
            select: {
              equals: 'Published',
            },
          },
          {
            property: 'Status',
            select: {
              equals: 'PDF-Only',
            },
          },
        ],
      },
      sorts: [
        {
          property: 'File Name',
          direction: 'ascending',
        },
      ],
    }),
  );

  const pages = [];

  for (const page of results) {
    pages.push({
      id: page.id,
      title: stringifyProperty(page.properties['Title']),
      status: stringifyProperty(page.properties['Status']),
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
  const response = await retryRequest(() =>
    notion.blocks.children.list({
      block_id: blockId,
      start_cursor: startCursor,
      page_size: 100,
    }),
  );

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
