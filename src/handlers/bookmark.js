import { h } from 'hastscript';
import { transformRichText } from './rich-text.js';

export function bookmark(block, parent) {
  const url = new URL(block.bookmark.url);

  // if the bookmark url is from p5 web editor
  // import it as an embedded sketch
  if (url.hostname === 'editor.p5js.org') {
    const node = h('figure', [
      h(
        'div',
        {
          dataType: 'embed',
          'data-p5-editor': url.href,
        },
        [],
      ),
      h('figcaption', block.bookmark.caption.map(transformRichText)),
    ]);
    parent.children.push(node);
  }

  // if the parent is an video link callout
  // set the parent tag's href property
  if (parent.properties.dataType === 'video-link')
    parent.properties.href = block.bookmark.url;

  return null;
}
