import { h } from 'hastscript';
import { transformRichText } from './rich-text.js';

export function table(block, parent) {
  const tableRows = block.children;
  let tableHead = null;
  if (block.table.has_column_header) {
    tableHead = tableRows[0];
    tableRows.shift();
  }

  const node = h('table', [
    tableHead &&
      h(
        'thead',
        h(
          'tr',
          tableHead.table_row.cells.map((cell) => {
            const content = [];
            let inlineStyles = null;

            // Find custom styles in cell, e.g.`[width: 200px;]`
            for (let richText of cell) {
              if (richText.annotations.code) {
                const match = /\[([\s\S]+)\]/.exec(richText.text.content);
                if (match) {
                  inlineStyles = match[1];
                  continue;
                }
              }
              content.push(richText);
            }

            return h(
              'th',
              inlineStyles ? { style: inlineStyles } : {},
              content.map(transformRichText),
            );
          }),
        ),
      ),
    h(
      'tbody',
      tableRows.map((row) => {
        return h(
          'tr',
          row.table_row.cells.map((cell) => {
            const isSnippet = cell.reduce(
              (pre, cur) => pre && cur.annotations?.code,
              cell.length > 0,
            );

            // If a cell is full of inline code
            // -> Change it to snippet
            if (isSnippet) {
              return h(
                'td',
                h(
                  'pre',
                  h(
                    'code',
                    cell
                      .map((richText) => {
                        richText.annotations.code = false;
                        return richText;
                      })
                      .map(transformRichText),
                  ),
                ),
              );
            }

            return h(
              'td',
              cell.map((richText) => {
                return transformRichText(richText, { allowHtml: true });
              }),
            );
          }),
        );
      }),
    ),
  ]);
  parent.children.push(node);

  return null;
}
