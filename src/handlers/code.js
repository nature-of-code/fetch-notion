import { h } from 'hastscript';
import { transformRichText } from './rich-text.js';

export function code(block, parent) {
  // annotate inline code
  const richTexts = parseCodeInRichText(block.code.rich_text);

  const node = h(
    'pre',
    {
      class: 'codesplit',
      dataCodeLanguage: block.code.language,
    },
    richTexts.map((text) =>
      transformRichText(text, { wrapUnderlineBlank: true }),
    ),
  );
  parent.children.push(node);

  return null;
}

function parseCodeInRichText(richTexts) {
  return richTexts.flatMap((richText) => {
    if (richText.type !== 'text') {
      return richText;
    }

    // find code wrapped in backticks e.g. `const value = 1`
    return richText.text.content.split(/(`[^`]+`)/).map((content) => {
      const inlineCodeMatch = /`([^`]+)`/.exec(content);
      return {
        ...richText,
        annotations: {
          ...richText.annotations,
          code: !!inlineCodeMatch,
        },
        text: {
          ...richText.text,
          content: inlineCodeMatch ? inlineCodeMatch[1] : content,
        },
        plain_text: inlineCodeMatch ? inlineCodeMatch[1] : content,
      };
    });
  });
}
