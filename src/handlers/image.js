import { h } from 'hastscript';
import { transformRichText } from './rich-text.js';

export function image(block, parent) {
  const classNames = [];
  // get first code annotations before any text
  for (const text of block.image.caption) {
    if (!text.annotations.code) {
      break;
    }
    classNames.push(text.plain_text);
  }
  const className = classNames.join(' ');

  const caption = block.image.caption.slice(classNames.length);

  const node = h('figure', { class: className || null }, [
    h('img', {
      src: block.image[block.image.type].url,
      alt: caption.map(({ plain_text }) => plain_text).join(''),
    }),
    h('figcaption', caption.map(transformRichText)),
  ]);
  parent.children.push(node);

  return null;
}
