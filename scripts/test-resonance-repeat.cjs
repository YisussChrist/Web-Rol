const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const shell = fs.readFileSync('resonance-shell.js', 'utf8');
const app = fs.readFileSync('OST/app.js', 'utf8');
function functionSource(source, name) {
  const start = source.indexOf(`  function ${name}(`);
  assert(start >= 0);
  const end = source.indexOf('\n  }', start);
  return source.slice(start, end + 4);
}
const storage = new Map();
let renders = 0, notifications = 0;
const context = vm.createContext({state: {repeat:false}, audio: {loop:false},
  localStorage:{setItem:(k,v)=>storage.set(k,v)},
  renderPlayer:()=>renders++, notify:()=>notifications++});
vm.runInContext(functionSource(shell,'setRepeat'),context);
context.setRepeat(true);
assert.equal(context.audio.loop,true);
assert.equal(context.state.repeat,true);
assert.equal(storage.get('resonanceRepeat'),'true');
context.setRepeat(false);
assert.equal(context.audio.loop,false);
assert.equal(storage.get('resonanceRepeat'),'false');
assert.equal(renders,2); assert.equal(notifications,2);
for (const shared of [false,true]) {
  let sharedRepeat = null;
  const library = vm.createContext({state:{repeat:false},audio:{loop:false},
    sharedShell:shared?{setRepeat:value=>{sharedRepeat=value;context.setRepeat(value);}}:null,
    localStorage:{setItem:(k,v)=>storage.set(k,v)},renderPlayer:()=>{}});
  vm.runInContext(functionSource(app,'toggleRepeat'),library);
  library.toggleRepeat();
  assert.equal(library.state.repeat,true);
  assert.equal(shared?sharedRepeat:library.audio.loop,true);
  library.toggleRepeat();
  assert.equal(shared?context.audio.loop:library.audio.loop,false);
}
assert(shell.includes('repeat: state.repeat'));
assert(app.includes('state.repeat = sharedState.repeat;'));
assert(shell.includes('audio.loop = state.repeat;'));
console.log('Repeat: native audio loop, persistence, notifications and shared/standalone toggles passed.');
