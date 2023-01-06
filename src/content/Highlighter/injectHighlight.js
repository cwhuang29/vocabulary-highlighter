import {
  HIGHLIGHTER_CLASS,
  HIGHLIGHTER_DEF_CLASS,
  HIGHLIGHTER_DETAIL_CLASS,
  HIGHLIGHTER_DETAIL_ITEM_CLASS,
  HIGHLIGHTER_ICON_CLASS,
  // HIGHLIGHTER_LINK_CLASS,
  HIGHLIGHTER_ORG_WORD_CLASS,
  HIGHLIGHTER_TARGET_WORD_CLASS,
} from '@constants/index';
import { genHighlightSyntax } from '@utils/highlight';

export const findWordsInNodes = ({ value, words }) => {
  const parsed = value
    .replace(/[^a-z]/gi, ' ')
    .split(' ')
    .filter(val => val && words.has(val.toLowerCase()));
  return [...new Set(parsed)];
};

export const highlightMatchedWords = ({ config, nodeValue, matchedWords, words }) => {
  let value = nodeValue;
  matchedWords.forEach(word => {
    const arg = { config, orgWord: word, word: words.get(word.toLowerCase()) };
    value = value.replace(word, genHighlightSyntax(arg)); // TODO if target word is 'the', then 'therefore' will be effected
  });
  return value;
};

export const shouldAddHighlight = node =>
  node.parentNode != null &&
  node.parentNode.tagName !== 'STYLE' &&
  node.parentNode.tagName !== 'SCRIPT' &&
  node.parentNode.tagName !== 'NOSCRIPT' &&
  !node.parentNode.classList.contains(HIGHLIGHTER_CLASS) &&
  !node.parentNode.classList.contains(HIGHLIGHTER_ORG_WORD_CLASS) &&
  !node.parentNode.classList.contains(HIGHLIGHTER_TARGET_WORD_CLASS) &&
  !node.parentNode.classList.contains(HIGHLIGHTER_DETAIL_ITEM_CLASS) &&
  !node.parentNode.classList.contains(HIGHLIGHTER_DETAIL_CLASS) &&
  !node.parentNode.classList.contains(HIGHLIGHTER_DEF_CLASS) &&
  !node.parentNode.classList.contains(HIGHLIGHTER_ICON_CLASS) &&
  node.nodeValue &&
  node.nodeValue.trim().length;

export const parseAllNodes = (nodes, words, config) => {
  const map = new Map();
  let cnt = 0;
  nodes
    .filter(node => shouldAddHighlight(node))
    .forEach(node => {
      const matchedWords = findWordsInNodes({ value: node.nodeValue, words });
      if (matchedWords.length) {
        // If we update parent node right now, subsequent nodes with same parent node may lose their parent node (node.parentNode becomes null)
        const args = { config, nodeValue: node.nodeValue, matchedWords, words };
        map.set(cnt++, { parent: node.parentNode, orgValue: node.nodeValue, newValue: highlightMatchedWords(args) });
      }
    });
  // console.log(`[content] Update. number of nodes to update: ${map.size}`);
  for (const { parent, orgValue, newValue } of map.values()) {
    parent.innerHTML = parent.innerHTML.replace(orgValue, newValue);
  }
};