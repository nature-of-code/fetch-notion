import { h } from 'hastscript';
import { fromHtml } from 'hast-util-from-html';

/**
 * @param {NotionRichText} richText
 * @param {{allowHtml: boolean}} options
 * @returns {HastNode}
 */
export function transformRichText(richText, options = {}) {
  switch (richText.type) {
    case 'text':
      const {
        text: { content },
        annotations,
        href,
      } = richText;

      // Option: allow Html inside RichText to render
      if (options.allowHtml === true) {
        const { children } = fromHtml(content, { fragment: true });
        for (let child of children) {
          if (child.type === 'element') return children;
        }
      }

      let node = {
        type: 'text',
        value: content,
      };

      if (annotations) {
        if (annotations.italic) {
          node = h('em', [node]);
        }
        if (annotations.bold) {
          node = h('strong', [node]);
        }
        if (annotations.code) {
          node = h('code', [node]);
        }
      }

      if (href) {
        node = h('a', { href }, [node]);
      }

      return node;

    case 'equation':
      return h('span', { dataType: 'equation' }, richText.equation.expression);

    default:
      console.warn('missing handler for rich_text:', richText.type);
      return null;
  }
}
