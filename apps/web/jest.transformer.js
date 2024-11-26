const { createHash } = require('crypto');
const path = require('path');

module.exports = {
  process(sourceText, sourcePath, options) {
    // Handle ESM syntax
    const dirname = path.dirname(sourcePath);
    
    // Replace ESM-specific code with CommonJS equivalents
    const transformedCode = sourceText
      .replace(
        /globalThis\.__dirname = import\.meta\.url\.match\([^)]+\)\[1\]\.replace\([^)]+\)/,
        `globalThis.__dirname = __dirname`
      )
      .replace(/import\.meta\.url/g, `'file://' + __dirname`)
      .replace(/export default ([^;]+);/, 'module.exports = $1;')
      .replace(/export const ([^=]+)=/g, 'exports.$1 =')
      .replace(/export function ([^(]+)/, 'exports.$1 = function $1')
      .replace(/export class ([^ ]+)/, 'exports.$1 = class $1')
      .replace(/import \* as ([^ ]+) from ['"]([^'"]+)['"]/g, 'const $1 = require("$2")')
      .replace(/import ([^ ]+) from ['"]([^'"]+)['"]/g, 'const $1 = require("$2")');

    // Return the transformed code
    return {
      code: transformedCode,
    };
  },
  getCacheKey(fileData, filename, configString, options) {
    return createHash('md5')
      .update(fileData)
      .update(configString)
      .digest('hex');
  },
}; 