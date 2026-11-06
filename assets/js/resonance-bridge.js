(() => {
  'use strict';
  const channel = 'resonance-player-v1';
  const commands = ['setTrack', 'toggle', 'toggleFavorite', 'setShuffle', 'setRepeat', 'next', 'previous', 'showTrackShare'];

  function host(api, frame) {
    let client = null;
    let resonanceCurrent = Number(localStorage.getItem('resonanceTrack') || 0);
    function send(state) {
      if (state.sourceId === 'resonance') resonanceCurrent = state.current;
      if (!client) return;
      frame.contentWindow?.postMessage({ channel, type: 'state', client, state,
        navigation: api.getNavigation('resonance', resonanceCurrent) }, '*');
    }
    const unsubscribe = api.subscribe(send);
    function receive(event) {
      const message = event.data;
      if (event.source !== frame.contentWindow || message?.channel !== channel) return;
      if (message.type === 'connect' && typeof message.client === 'string') {
        client = message.client;
        send(api.getState());
      } else if (message.type === 'command' && message.client === client && commands.includes(message.method) && Array.isArray(message.args)) {
        api[message.method](...message.args);
      }
    }
    window.addEventListener('message', receive);
    return () => { unsubscribe(); window.removeEventListener('message', receive); };
  }

  function connect() {
    if (window.parent === window) return Promise.resolve(null);
    try {
      if (window.parent.ResonanceShell) return Promise.resolve(window.parent.ResonanceShell);
    } catch { /* Local file frames have separate origins; use messages instead. */ }
    return new Promise(resolve => {
      const client = `${Date.now()}-${Math.random()}`;
      const subscribers = new Set();
      let state, navigation, connected = false;
      const api = {
        getState: () => state,
        getNavigation: () => navigation,
        subscribe(callback) { subscribers.add(callback); callback(state); return () => subscribers.delete(callback); }
      };
      for (const method of commands) api[method] = (...args) => window.parent.postMessage({ channel, type: 'command', client, method, args }, '*');
      function receive(event) {
        const message = event.data;
        if (event.source !== window.parent || message?.channel !== channel || message.type !== 'state' || message.client !== client) return;
        state = message.state;
        navigation = message.navigation;
        if (!connected) {
          connected = true;
          clearInterval(retry); clearTimeout(timeout);
          resolve(api);
        }
        subscribers.forEach(callback => callback(state));
      }
      function dispose() {
        clearInterval(retry); clearTimeout(timeout);
        window.removeEventListener('message', receive);
        subscribers.clear();
      }
      const request = () => window.parent.postMessage({ channel, type: 'connect', client }, '*');
      window.addEventListener('message', receive);
      const retry = setInterval(request, 250);
      const timeout = setTimeout(() => { dispose(); resolve(null); }, 12000);
      window.addEventListener('pagehide', dispose, { once: true });
      request();
    });
  }
  window.ResonanceBridge = { host, connect };
})();
