import { visit } from 'unist-util-visit';

export function joinAdjacentAnchors(tree) {
  visit(tree, 'element', (node, index, parent) => {
    if (!parent || node.tagName !== 'a') return;

    let nextNode = parent.children[index + 1];
    while (
      nextNode &&
      nextNode.tagName === 'a' &&
      nextNode.properties.href === node.properties.href
    ) {
      // Combine children of the next node with the current node
      node.children = [...node.children, ...nextNode.children];

      // Remove the next node from the parent
      parent.children.splice(index + 1, 1);

      // Update nextNode to the new node at the current index + 1
      nextNode = parent.children[index + 1];
    }
  });
}
