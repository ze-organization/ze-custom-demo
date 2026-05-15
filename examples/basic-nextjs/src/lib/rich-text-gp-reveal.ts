import DOMPurify from 'isomorphic-dompurify';
import { HTMLElement, parse, TextNode } from 'node-html-parser';

const WRAP_CLASS = 'gp-reveal-word';

function hasAncestorTag(start: HTMLElement | null, tagName: string): boolean {
  let cur: HTMLElement | null = start;
  while (cur) {
    if (cur.tagName === tagName) return true;
    cur = cur.parentNode as HTMLElement | null;
  }
  return false;
}

function isInsideGpRevealWord(textNode: TextNode): boolean {
  const parent = textNode.parentNode as HTMLElement | null;
  if (!parent || parent.tagName !== 'SPAN') return false;
  const cls = parent.getAttribute('class') ?? '';
  return cls.split(/\s+/).includes(WRAP_CLASS);
}

function shouldWrapTextNode(textNode: TextNode): boolean {
  const parent = textNode.parentNode as HTMLElement | null;
  if (!parent) return false;
  if (isInsideGpRevealWord(textNode)) return false;
  if (hasAncestorTag(parent, 'A')) return false;
  if (hasAncestorTag(parent, 'PRE') || hasAncestorTag(parent, 'CODE')) return false;
  if (hasAncestorTag(parent, 'SCRIPT') || hasAncestorTag(parent, 'STYLE')) return false;
  return /\S/.test(textNode.rawText);
}

function replaceTextNodeWithWordSpans(textNode: TextNode): void {
  const parent = textNode.parentNode as HTMLElement | null;
  if (!parent) return;

  const raw = textNode.rawText;
  const parts = raw.split(/(\s+)/);
  const nodes: (TextNode | HTMLElement)[] = [];

  for (const part of parts) {
    if (part === '') continue;
    if (/^\s+$/.test(part)) {
      nodes.push(new TextNode(part));
      continue;
    }
    const span = parse(`<span class="${WRAP_CLASS}"></span>`).querySelector('span');
    if (!span) continue;
    span.appendChild(new TextNode(part));
    nodes.push(span);
  }

  if (nodes.length === 0) return;

  const idx = parent.childNodes.indexOf(textNode);
  if (idx < 0) return;

  parent.removeChild(textNode);

  // node-html-parser does not maintain nextSibling; insert by index on childNodes.
  const mutableChildren = parent.childNodes as unknown as Array<TextNode | HTMLElement>;
  nodes.forEach((node, offset) => {
    mutableChildren.splice(idx + offset, 0, node);
    Object.assign(node, { parentNode: parent });
  });
}

function walkAndWrapTextNodes(root: HTMLElement): void {
  const snapshot = [...root.childNodes];
  for (const child of snapshot) {
    if (child instanceof TextNode) {
      if (shouldWrapTextNode(child)) replaceTextNodeWithWordSpans(child);
    } else if (child instanceof HTMLElement) {
      walkAndWrapTextNodes(child);
    }
  }
}

/**
 * Sanitize Sitecore-authored HTML, then wrap each whitespace-delimited word (outside of
 * anchors, code, pre, and already-wrapped spans) in `<span class="gp-reveal-word">`.
 */
export function wrapWordsForGpReveal(html: string): string {
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  if (!clean.trim()) return '';

  const shell = parse(`<div data-gp-reveal-root>${clean}</div>`);
  const root = shell.querySelector('[data-gp-reveal-root]') as HTMLElement | null;
  if (!root) return clean;

  walkAndWrapTextNodes(root);
  return DOMPurify.sanitize(root.innerHTML, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['span'],
    ADD_ATTR: ['class'],
  });
}
