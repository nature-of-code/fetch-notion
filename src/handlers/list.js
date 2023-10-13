import { h } from 'hastscript';
import { transformRichText } from './rich-text.js';

const customIndexRegex = /\[number:\s*(\d+)\;*]/;

export function list(tagName) {
  return function (block, parent) {
    const richText = block[block.type].rich_text;

    // find if custom index exist: `[number: 5;]`
    let customIndex = null;
    for (let i = 0; i < richText.length; i++) {
      if (!richText[i].annotations.code) continue;

      const match = customIndexRegex.exec(richText[i].plain_text);
      if (match) {
        customIndex = match[1];
        richText.splice(i, 1);
        break;
      }
    }

    const node = h('li', richText.map(transformRichText));
    if (customIndex) {
      node.properties = node.properties || {};
      node.properties.value = customIndex;
    }

    const container = h(tagName, []);

    const previousSibling = parent.children[parent.children.length - 1];
    // If the previous sibling node (<ul> or <ol>) is the same kind of list,
    // make it a child instead of creating a new list
    if (previousSibling && previousSibling.tagName === container.tagName) {
      previousSibling.children.push(node);

      if (block.has_children) {
        return block.children.map((n) => [n, node]);
      }
      return null;
    }

    // or create a new list wrapper (<ul> or <ol>) when it is not the same as it's previous sibling
    container.children.push(node);
    parent.children.push(container);

    if (block.has_children) {
      return block.children.map((n) => [n, node]);
    }
    return null;
  };
}
