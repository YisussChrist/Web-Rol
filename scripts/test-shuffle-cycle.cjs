const assert = require('node:assert/strict');
const create = require('../assets/js/shuffle-cycle.js');
for (const random of [()=>0,()=>.999999,Math.random]) {
  const cycle=create(random), pool=[0,1,2,3,4];let current=0;
  const round=[current];for(let i=0;i<4;i++){current=cycle.next(pool,current);round.push(current);}
  assert.equal(new Set(round).size,5);
  for(let round=0;round<20;round++){const seen=[current];for(let i=0;i<4;i++){const next=cycle.next(pool,current);assert.notEqual(next,current);current=next;seen.push(current);}assert.equal(new Set(seen).size,5);}
  assert.equal(cycle.next([],current),null);
  assert.equal(cycle.next([9],9),9);
  assert.equal(cycle.next([4,5],4),5);
  assert.equal(cycle.next([4,5],5),4);
}
console.log('Shuffle cycles: no repeated track within a round; empty, single and changed pools passed.');
