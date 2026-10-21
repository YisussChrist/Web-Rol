/* Stable share identifiers use the audio path, not the catalogue position. */
window.ResonanceSharing = {
  key(track) {
    return btoa(Array.from(new TextEncoder().encode(track.audio), byte => String.fromCharCode(byte)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  },
  url(track, root) {
    const url=new URL('index.html',root);
    url.hash='route='+encodeURIComponent('OST/index.html?track='+this.key(track));
    return url.href;
  }
};
