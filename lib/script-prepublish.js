(function() {
  'use strict';
  var FS, PATH, WG, log, match, path, readme, ref, rpr;

  //===========================================================================================================
  WG = require('./main');

  ({rpr} = WG.trm);

  ({log} = console);

  FS = require('fs');

  PATH = require('path');

  log(__filename);

  path = PATH.resolve(PATH.join(__dirname, '../README-types.md'));

  log(path);

  readme = FS.readFileSync(path, {
    encoding: 'utf-8'
  });

  ref = readme.matchAll(/^#### `([^`]+)`/ug);
  for (match of ref) {
    log(match);
  }

}).call(this);

//# sourceMappingURL=script-prepublish.js.map