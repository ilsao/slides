import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import http from 'highlight.js/lib/languages/http';
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';

const highlighter = hljs.newInstance();
const sqlite: typeof sql = api => {
  const grammar = sql(api);
  // SQLite's PRAGMA is absent from the standard SQL grammar.
  grammar.contains?.unshift({ scope: 'keyword', match: /\bPRAGMA\b/, relevance: 0 });
  return grammar;
};
for (const [name, grammar] of Object.entries({ python, sql: sqlite, json, http, bash, powershell }))
  highlighter.registerLanguage(name, grammar);

type DisplayRow = { text: string; sourceLine: number; continuation: boolean; continuationIndent: number };
type Token = { start: number; end: number; scopes: string[] };
const entities: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'" };
const decode = (html: string) => html.replace(/&(?:amp|lt|gt|quot|#x27);/g, entity => entities[entity]);
const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[char]!);

function embeddedSql(html: string) {
  // Python has already identified these complete string literals. SQL-looking
  // text in comments, f-string expressions and ordinary prose stays Python.
  return html.replace(/<span class="hljs-string">([^<]*)<\/span>/g, (original, encoded: string) => {
    const text = decode(encoded), opening = text.match(/^[uUrRbB]*("""|'''|"|')/);
    if (!opening) return original;
    const quote = opening[1], closed = text.endsWith(quote) && text.length >= opening[0].length + quote.length;
    const body = text.slice(opening[0].length, closed ? -quote.length : undefined);
    const statement = body.replace(/^(?:\s|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)+/, '');
    if (!/^(?:SELECT\b|CREATE\s+TABLE\b|INSERT\s+INTO\b|UPDATE\b|DELETE\s+FROM\b|PRAGMA\b|WITH\b|ALTER\s+TABLE\b|DROP\s+TABLE\b)/i.test(statement)) return original;
    return `<span class="hljs-string">${escape(opening[0])}</span>`
      + highlighter.highlight(body, { language: 'sql' }).value
      + (closed ? `<span class="hljs-string">${escape(quote)}</span>` : '');
  });
}

function tokensFor(source: string, language: string): Token[] {
  let html = highlighter.getLanguage(language) ? highlighter.highlight(source, { language }).value : escape(source);
  if (language === 'python') html = embeddedSql(html);
  const tokens: Token[] = [], scopes: string[] = [];
  let offset = 0;
  // Only parse spans emitted by the highlighter; source markup is escaped.
  for (const match of html.matchAll(/<span class="([^"]+)">|<\/span>|([^<]+)/g)) {
    if (match[1]) scopes.push(match[1]);
    else if (match[0] === '</span>') scopes.pop();
    else {
      const length = decode(match[2]).length;
      tokens.push({ start: offset, end: offset + length, scopes: [...scopes] });
      offset += length;
    }
  }
  return tokens;
}

export function highlightRows(source: string, language: string, rows?: DisplayRow[]): string[] {
  const tokens = tokensFor(source, language), lines = source.split('\n'), starts: number[] = [];
  let offset = 0;
  for (const line of lines) { starts.push(offset); offset += line.length + 1; }
  const display = rows ?? lines.map((text, index) => ({ text, sourceLine: index + 1, continuation: false, continuationIndent: 0 }));
  const consumed = new Map<number, number>();
  return display.map(row => {
    const indent = row.continuation ? row.continuationIndent : 0;
    const length = row.text.length - indent;
    const start = starts[row.sourceLine - 1] + (consumed.get(row.sourceLine) ?? 0), end = start + length;
    consumed.set(row.sourceLine, (consumed.get(row.sourceLine) ?? 0) + length);
    let html = escape(row.text.slice(0, indent));
    for (const token of tokens) {
      if (token.end <= start || token.start >= end) continue;
      const text = escape(source.slice(Math.max(start, token.start), Math.min(end, token.end)));
      html += token.scopes.reduceRight((content, scope) => `<span class="${scope}">${content}</span>`, text);
    }
    return html || ' ';
  });
}
