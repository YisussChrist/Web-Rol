const assert = require('node:assert/strict');
const create = require('../assets/js/track-navigation.js');
const pool = [0, 1, 2, 3, 4];

for (const shuffle of [false, true]) {
  const nav = create(() => 0);
  let current = 0;
  const heard = [current];
  for (let i = 0; i < 4; i++) {
    const expected = nav.preview(pool, current, shuffle).next;
    // Rendering repeatedly must not consume or reshuffle the preview.
    for (let j = 0; j < 10; j++) assert.equal(nav.preview(pool, current, shuffle).next, expected);
    current = nav.step(1, pool, current, shuffle);
    nav.select(current); // The player confirms the selected track.
    assert.equal(current, expected);
    assert.equal(nav.preview(pool, current, shuffle).previous, heard.at(-1));
    heard.push(current);
  }
  assert.equal(new Set(heard).size, pool.length);
  for (let i = heard.length - 2; i >= 0; i--) {
    current = nav.step(-1, pool, current, shuffle);
    nav.select(current);
    assert.equal(current, heard[i]);
  }
  for (let i = 1; i < heard.length; i++) {
    assert.equal(nav.preview(pool, current, shuffle).next, heard[i]);
    current = nav.step(1, pool, current, shuffle);
    assert.equal(current, heard[i]);
  }
  // A manual selection becomes the actual previous song, including outside filters.
  nav.select(20);
  assert.equal(nav.preview([20, 21], 20, shuffle).previous, current);
  assert.equal(nav.step(-1, [20, 21], 20, shuffle), current);
  assert.equal(nav.step(1, [20, 21], current, shuffle), 20);
}

const nav = create(() => 0);
assert.deepEqual(nav.preview([], 0, true), {previous:null, next:null});
assert.equal(nav.step(1, [9], 9, true), 9);
const wrap = create();
assert.equal(wrap.step(-1, pool, 0, false), 4);
assert.equal(wrap.step(1, pool, 4, false), 0);
const branch = create();
branch.select(0); branch.select(1); branch.select(2);
assert.equal(branch.step(-1, pool, 2, false), 1);
branch.select(4);
assert.equal(branch.step(-1, pool, 4, false), 1);
assert.equal(branch.step(1, pool, 1, false), 4);
const separateSource = create();
separateSource.select(3);
assert.equal(separateSource.preview(pool,3,false).previous,2);
assert.equal(branch.preview(pool,4,false).previous,1);
console.log('Navigation: stable previews, shuffle round, back/forward history, manual selection, source isolation, empty/single pools and wrap passed.');
