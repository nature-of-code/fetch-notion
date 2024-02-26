import { h } from 'hastscript';
import { transformRichText } from './rich-text.js';

export function heading(tagName) {
  return function (block, parent) {
    const attr = {};

    if (block.id) {
      attr.dataNotionId = block.id.replace(/-/g, '');
    }

    const node = h(
      tagName,
      attr,
      block[block.type].rich_text.map(transformRichText),
    );
    parent.children.push(node);

    return null;
  };
}
