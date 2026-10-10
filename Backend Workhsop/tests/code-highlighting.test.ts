import { describe, expect, it } from 'vitest';
import { highlightRows } from '../src/code-highlighting';
import { slides } from '../src/deck';
import sources from '../sources/notion-code.json';

const decode = (html: string) => html.replace(/<[^>]*>/g, '')
  .replace(/&(?:amp|lt|gt|quot|#x27);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'" })[entity]!);
function rendered(id: number) {
  const slide = slides.find(slide => slide.id === id)!, excerpt = slide.excerpt!;
  return highlightRows(sources[excerpt.block - 1].code, slide.code[0].lang, excerpt.rows);
}

describe('source-aware code highlighting', () => {
  it('keeps wrapped Python and embedded SQL comments in comment scope', () => {
    const python = rendered(23), sql = rendered(41024);
    expect(python[6]).toMatch(/class="hljs-comment">length, and regex patterns\./);
    expect(python[6]).not.toMatch(/hljs-keyword|hljs-built_in/);
    expect(sql[7]).toMatch(/class="hljs-comment">the same course twice\./);
    expect(sql[7]).not.toMatch(/hljs-keyword|hljs-string/);
    expect(python[7]).toContain('class="hljs-keyword">from');
  });
  it('highlights SQL inside Python across page boundaries and resumes Python afterward', () => {
    expect(rendered(41001)[7]).toContain('class="hljs-keyword">CREATE');
    expect(rendered(41001)[9]).toContain('class="hljs-comment">');
    expect(rendered(41016)[0]).toContain('class="hljs-keyword">CREATE');
    expect(rendered(41024)[8]).toContain('class="hljs-keyword">PRIMARY');
    expect(rendered(41095)[3]).toContain('class="hljs-keyword">SELECT');
    expect(rendered(41095)[6]).toContain('class="hljs-keyword">JOIN');
    expect(rendered(41047).find(row => decode(row).includes('INSERT INTO'))).toContain('class="hljs-keyword">INSERT');
    expect(rendered(42).find(row => decode(row).includes('connection.execute'))).toContain('class="hljs-keyword">PRAGMA');
    expect(rendered(41095)[10]).toContain('class="hljs-string">');
    expect(rendered(41095)[11]).toContain('class="hljs-comment">');
    expect(rendered(41109)[0]).toContain('class="hljs-keyword">for');
  });
  it('preserves ordinary strings, interpolation, and SQL text in Python comments', () => {
    const lines = highlightRows('path = "workshop.db"\n# SELECT title FROM courses\nmessage = "Use SELECT to query"\nvalue = f"{capacity}"\nquery = "SELECT title FROM courses WHERE capacity >= 20"', 'python');
    expect(lines[0]).toContain('class="hljs-string">');
    expect(lines[1]).not.toContain('hljs-keyword');
    expect(lines[2]).not.toContain('hljs-keyword');
    expect(lines[3]).toContain('class="hljs-subst">');
    expect(lines[4]).toContain('class="hljs-keyword">SELECT');
    expect(lines[4]).toContain('class="hljs-number">20');
  });
  it('preserves every displayed source character, including wrap indentation and escaped markup', () => {
    for (const slide of slides.filter(slide => slide.excerpt)) {
      const html = rendered(slide.id);
      expect(html.map(decode), slide.title).toEqual(slide.excerpt!.rows.map(row => row.text || ' '));
      for (const row of html) expect((row.match(/<span /g) ?? []).length).toBe((row.match(/<\/span>/g) ?? []).length);
    }
    const source = 'message = "<script>&\\\"</script>"\n# <img src=x> & goodbye';
    const html = highlightRows(source, 'python');
    expect(html.map(decode).join('\n')).toBe(source);
    expect(html.join('')).not.toMatch(/<script>|<img /);
  });
});
