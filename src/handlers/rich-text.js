import { h } from 'hastscript';
import { toString } from 'hast-util-to-string';
import { fromHtml } from 'hast-util-from-html';

/**
 * @param {NotionRichText} richText
 * @param {{allowHtml: boolean, wrapUnderlineBlank: boolean}} options
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

      // ignore empty rich text
      if (!content) return null;

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
        if (annotations.strikethrough) {
          node = h('s', [node]);
        }
        if (annotations.code) {
          node = h('code', [node]);
        }
      }

      // Option: wrap underline richText in <span class="blank">
      // This step adds mark to `fill-in-blank text`
      if (options.wrapUnderlineBlank === true) {
        if (annotations && annotations.underline) {
          node = h('span.blank', [node]);
        }
      }

      if (href) {
        node = h('a', { href }, [node]);
      }

      // transform code styled <br /> into a br element
      if (node.tagName === 'code' && /^<br\s*\/?>$/.test(toString(node))) {
        node = h('br', []);
      }

      return node;

    case 'equation':
      return h('span', { dataType: 'equation' }, richText.equation.expression);

    default:
      console.warn('missing handler for rich_text:', richText.type);
      return null;
  }
}
