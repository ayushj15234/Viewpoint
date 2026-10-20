const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { comparisonBounds, personalScore, filterHikes } = require('../src/ranking.ts');
const hike = (id, sentiment = 'Loved it') => ({ id: String(id), name: `Trail ${id}`, enjoyment: 0, difficulty: 3, notes: '', sentiment, location: 'New York', durationMinutes: 120, lengthMiles: 4 });
const ranked = Array.from({ length: 7 }, (_, i) => hike(i));
assert.equal(personalScore('0', ranked.slice(0, 6)), undefined);
assert.equal(personalScore('0', ranked), 10);
assert.equal(personalScore('6', ranked), 0);
assert.equal(personalScore('3', ranked), 5);
assert.equal(personalScore('unknown', ranked), undefined);
assert.deepEqual(comparisonBounds([], 'Loved it'), { low: 0, high: 0 });
const tiers = [hike(0), hike(1), hike(2, 'It was okay'), hike(3, 'Not for me')];
assert.deepEqual(comparisonBounds(tiers, 'It was okay'), { low: 2, high: 3 });
// Simulate comparison choices for every insertion position, including both ends.
for (let position = 0; position <= ranked.length; position++) {
  let { low, high } = comparisonBounds(ranked, 'Loved it');
  let comparisons = 0;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (position <= mid) high = mid; else low = mid + 1;
    comparisons++;
  }
  assert.equal(low, position);
  assert.ok(comparisons <= 3);
}
const filters = { location: 'new YORK', difficulty: 3, duration: 120, length: 4 };
assert.equal(filterHikes(ranked, filters).length, 7);
for (const mismatch of [{ location: 'Jersey' }, { difficulty: 1 }, { duration: 119 }, { length: 3.9 }]) assert.equal(filterHikes(ranked, { ...filters, ...mismatch }).length, 0);
assert.equal(filterHikes([{ ...hike(0), lengthMiles: undefined }], filters).length, 0);
console.log('Ranking, seven-hike unlock, insertion boundaries, and combined filters passed.');
