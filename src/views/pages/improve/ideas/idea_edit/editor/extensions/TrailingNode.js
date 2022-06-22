import { Extension } from '@tiptap/core';
import { PluginKey, Plugin } from 'prosemirror-state';
import { uniqueArray, includes } from '@remirror/core-helpers';

const trailingNodePluginKey = new PluginKey('trailingNode');

export function trailingNode(options) {
  const { ignoredNodes = [], nodeName = 'paragraph' } = options ?? {};

  // The names of the nodes for which this rule should not be applied.
  const ignoredNodeNames = uniqueArray([...ignoredNodes, nodeName]);

  // The node that will be inserted when the criteria match.
  let type;

  // The list of nodes for this schema that should have content injected after them.
  let types;

  return new Plugin({
    key: trailingNodePluginKey,
    appendTransaction(_, __, state) {
      const { doc: { content, lastChild }, tr } = state;

      const shouldInsertNodeAtEnd = trailingNodePluginKey.getState(state) || (lastChild.type.name === 'paragraph' && lastChild.textContent.trim().length);

      const endPosition = content.size;

      if (!shouldInsertNodeAtEnd) return
      console.log(endPosition)

      return tr.insert(endPosition, type.create());
    },
    state: {
      init: (_, { doc, schema }) => {
        const nodeType = schema.nodes[nodeName];

        if (!nodeType) {
          throw new Error(`Invalid node being used for trailing node extension: '${nodeName}'`);
        }

        // Save the type for continued use.
        type = nodeType;
        types = Object.values(schema.nodes)
          .map((node) => node)
          .filter((node) => !ignoredNodeNames.includes(node.name));

        return includes(types, doc.lastChild?.type);
      },
      apply: (tr, value) => {
        if (!tr.docChanged) return value

        const { doc: { lastChild } } = tr

        const shouldApply = (lastChild.type.name === 'paragraph' && lastChild.textContent.trim().length);

        return includes(types, lastChild?.type) || shouldApply;
      },
    },
  });
}


export const TrailingNode = Extension.create({
  name: 'trailingNode',

  addProseMirrorPlugins: () => [trailingNode({ ignoredNodes: [], nodeName: 'paragraph' })],
});
