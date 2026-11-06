const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/resonance-bridge.js', 'utf8');
function surface() {
  const listeners = new Map();
  return {
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    emit(type, event) { listeners.get(type)?.forEach(fn => fn(event)); }
  };
}
function load(window) {
  vm.runInNewContext(source, { window, localStorage: { getItem: () => '0' }, setTimeout, clearTimeout, setInterval, clearInterval });
  return window.ResonanceBridge;
}
(async () => {
  const parent = surface(), child = surface();
  const parentProxy = { postMessage: data => queueMicrotask(() => parent.emit('message', { source: childProxy, data })) };
  // Reproduce file:// access restrictions without relaxing browser security.
  Object.defineProperty(parentProxy, 'ResonanceShell', { get() { throw new Error('SecurityError'); } });
  const childProxy = { postMessage: data => queueMicrotask(() => child.emit('message', { source: parentProxy, data })) };
  child.parent = parentProxy;
  const bridge = load(parent), client = load(child);
  let state = { current: 0, sourceId: 'resonance', playing: false, favorites: [] }, subscriber;
  const api = {
    getState: () => state,
    getNavigation: () => ({ previous: state.current - 1, next: state.current + 1 }),
    subscribe(fn) { subscriber = fn; fn(state); return () => { subscriber = null; }; },
    setTrack(index, playing) { state = { ...state, current: index, playing }; subscriber(state); },
    toggleFavorite(index) { state = { ...state, favorites: [index] }; subscriber(state); }
  };
  // The child can start before the shell is ready; its next handshake connects.
  const pending = client.connect();
  await new Promise(resolve => setTimeout(resolve, 20));
  const disposeHost = bridge.host(api, { contentWindow: childProxy });
  const remote = await pending;
  assert(remote, 'Delayed parent must connect');
  let latest;
  remote.subscribe(value => { latest = value; });
  remote.setTrack(4, true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(latest.current, 4);
  assert.equal(latest.playing, true);
  assert.equal(remote.getNavigation().next, 5);
  remote.toggleFavorite(4);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(latest.favorites[0], 4);
  const before = latest;
  parent.emit('message', { source: {}, data: { channel: 'resonance-player-v1', type: 'connect', client: 'spoof' } });
  parent.emit('message', { source: {}, data: { channel: 'resonance-player-v1', type: 'command', client: 'spoof', method: 'setTrack', args: [9, true] } });
  assert.equal(latest, before, 'Unrelated windows must not control playback');
  child.emit('pagehide');
  api.setTrack(2, false);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(latest, before, 'Unloaded library must stop receiving updates');
  disposeHost();
  const direct = surface(); direct.parent = { ResonanceShell: api };
  assert.equal(await load(direct).connect(), api);
  console.log('Bridge: file-origin restrictions, delayed initialization, playback, favorites, navigation, sender validation and cleanup passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
