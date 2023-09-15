

'use strict'

### thx to https://raw.githubusercontent.com/flexdinesh/browser-or-node/master/src/index.js ###

#===========================================================================================================
```
const browser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

const nodejs =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

const webworker =
  typeof self === "object" &&
  self.constructor &&
  self.constructor.name === "DedicatedWorkerGlobalScope";

/**
 * @see https://github.com/jsdom/jsdom/releases/tag/12.0.0
 * @see https://github.com/jsdom/jsdom/issues/1537
 */
const jsdom =
  (typeof window !== "undefined" && window.name === "nodejs") ||
  (typeof navigator !== "undefined" &&
    (navigator.userAgent.includes("Node.js") ||
      navigator.userAgent.includes("jsdom")));

const deno =
  typeof Deno !== "undefined" &&
  typeof Deno.version !== "undefined" &&
  typeof Deno.version.deno !== "undefined";

// export { isBrowser, isWebWorker, isNode, isJsDom, isDeno };
```

name  = 'browser'   if browser
name  = 'nodejs'    if nodejs
name  = 'webworker' if webworker
name  = 'jsdom'     if jsdom
name  = 'deno'      if deno
name ?= null
module.exports = { browser, nodejs, webworker, jsdom, deno, name, }

