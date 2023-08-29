import { h } from 'hastscript';
import { transformRichText } from './rich-text.js';

export function image(block, parent) {
  const { caption } = block.image;

  const node = h('figure', [
    h('img', {
      src: block.image[block.image.type].url,
      alt: caption.map(({ plain_text }) => plain_text).join(''),
    }),
    h('figcaption', caption.map(transformRichText)),
  ]);
  parent.children.push(node);

  return null;
}
