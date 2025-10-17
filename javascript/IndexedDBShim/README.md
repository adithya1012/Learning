# IndexedDBShim Learning Guide

## What is IndexedDBShim?

IndexedDBShim is a polyfill that provides IndexedDB support for browsers that don't natively support it, or have incomplete implementations. It's essentially a JavaScript library that emulates the IndexedDB API using other storage mechanisms like WebSQL or localStorage as fallbacks.

## Why Use IndexedDBShim?

1. **Cross-browser compatibility** - Ensures IndexedDB works in older browsers
2. **Consistent API** - Same IndexedDB API across all browsers
3. **Fallback mechanism** - Uses WebSQL or localStorage when IndexedDB isn't available
4. **Testing** - Useful for testing IndexedDB code in environments without native support

## Key Features

- Full IndexedDB API implementation
- Automatic fallback to WebSQL or localStorage
- Support for transactions, cursors, and indexes
- Promise-based and callback-based APIs
- Works in Node.js environments for testing

## Installation

```bash
npm install indexeddbshim
```

Or include via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/indexeddbshim@latest/dist/indexeddbshim.min.js"></script>
```

## Files in this folder:

1. `basic-example.html` - Basic IndexedDB operations with shim
2. `advanced-example.js` - Advanced features and patterns
3. `node-example.js` - Using IndexedDBShim in Node.js
4. `comparison.js` - Native vs Shimmed IndexedDB
5. `testing-example.js` - Unit testing with IndexedDBShim
6. `performance-test.js` - Performance comparison
