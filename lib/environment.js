(function() {
  'use strict';
  
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
  /* thx to https://raw.githubusercontent.com/flexdinesh/browser-or-node/master/src/index.js */
  //===========================================================================================================
;
  var name;

  if (browser) {
    name = 'browser';
  }

  if (nodejs) {
    name = 'nodejs';
  }

  if (webworker) {
    name = 'webworker';
  }

  if (jsdom) {
    name = 'jsdom';
  }

  if (deno) {
    name = 'deno';
  }

  if (name == null) {
    name = null;
  }

  module.exports = {browser, nodejs, webworker, jsdom, deno, name};

}).call(this);

//# sourceMappingURL=environment.js.map