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
          tableHead.table_row.cells.map((cell) =>
            h('th', cell.map(transformRichText)),
          ),
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
