const fs = require('fs');
const path = require('path');

const enhancedResolver = (request, options) => {
  // Special handling for sss-wasm
  if (request === 'sss-wasm') {
    const wasmPath = path.resolve(__dirname, '../../node_modules/sss-wasm/lib/node.js');
    if (fs.existsSync(wasmPath)) {
      return wasmPath;
    }
  }

  // Call the default resolver for other modules
  return options.defaultResolver(request, options);
};

module.exports = enhancedResolver; 