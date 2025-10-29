// streamSaverConfig.js
// ------------------------------------------------------
// This file preconfigures and initializes StreamSaver
// safely (no inline scripts needed anymore).
// ------------------------------------------------------

// Configure StreamSaver before loading the main library
window.streamSaverConfig = {
  mitm: 'https://jimmywarting.github.io/StreamSaver.js/mitm.html',
  writableStrategy: undefined,
  readableStrategy: undefined,
};

// Load StreamSaver script dynamically (instead of inline <script>)
(function loadStreamSaver() {
  const script = document.createElement('script');
  script.src =
    'https://cdn.jsdelivr.net/npm/streamsaver@2.0.6/StreamSaver.min.js';
  script.onload = () => {
    if (window.streamSaver) {
      window.streamSaver.mitm = window.streamSaverConfig.mitm;
    } else {
      console.error('StreamSaver failed to initialize');
    }
  };
  script.onerror = () => console.error('Failed to load StreamSaver library');
  document.head.appendChild(script);
})();
