const ts = require('typescript');
const fs = require('node:fs');
const assert = require('node:assert/strict');

// Native rejects even a same-line whitespace child outside Text. Web accepts it.
const files = ['App.tsx', ...fs.readdirSync('src').filter(file => file.endsWith('.tsx')).map(file => `src/${file}`)];
const problems = [];
for (const file of files) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isJsxText(node)) {
      const parent = node.parent;
      const tag = ts.isJsxElement(parent) ? parent.openingElement.tagName.getText(source) : 'Fragment';
      const raw = node.getText(source);
      if (tag !== 'Text' && raw && (!/[\r\n]/.test(raw) || raw.trim())) {
        problems.push(`${file}:${source.getLineAndCharacterOfPosition(node.pos).line + 1}: raw text under ${tag}: ${JSON.stringify(raw)}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
assert.deepEqual(problems, [], problems.join('\n'));
console.log('Native JSX text checks passed for all app screens.');
