import { h } from 'hastscript';
import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';

export function mergeSideBySideFigures(tree) {
  visit(tree, { tagName: 'div' }, (node, index, parent) => {
    if (
      !node.properties.className ||
      !node.properties.className.includes('col-list')
    )
      return;

    // Check if all the column `div`s contain only one figure element
    for (let column of node.children) {
      if (
        column.children.length !== 1 ||
        column.children[0].tagName !== 'figure'
      ) {
        return;
      }
    }

    // join the content and the captions
    const content = node.children.map((column) => {
      return h(
        'div',
        column.children[0].children.filter((e) => e.tagName !== 'figcaption'),
      );
    });
    const captions = node.children.reduce((result, column) => {
      return result.concat(
        column.children[0].children.filter((e) => e.tagName === 'figcaption')[0]
          .children,
      );
    }, []);

    const mergedElement = h('figure', [
      h('div.col-list', content),
      h('figcaption', captions),
    ]);

    parent.children[index] = mergedElement;
  });
}
