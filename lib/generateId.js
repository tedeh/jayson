'use strict';

module.exports = function () {
  const crypto =
    typeof globalThis !== 'undefined'
      ? globalThis.crypto
      : typeof self !== 'undefined'
        ? self.crypto
        : typeof window !== 'undefined'
          ? window.crypto
          : undefined;

  if (crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  if (crypto && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, function (byte) {
      return byte.toString(16).padStart(2, '0');
    }).join('');
    return (
      hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20)
    );
  }

  throw new Error('The "crypto" module is unavailable. provide options.generator to generate request IDs');
};
