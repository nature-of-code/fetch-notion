import { h } from 'hastscript';
import { transformRichText } from './rich-text.js';

export function code(block, parent) {
  const node = h(
    'pre',
    {
      class: 'codesplit',
      dataCodeLanguage: block.code.language,
    },
    block.code.rich_text.map((text) =>
      transformRichText(text, { wrapUnderlineBlank: true }),
    ),
  );
  parent.children.push(node);

  return null;
}
