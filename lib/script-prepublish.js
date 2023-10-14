(function() {
  'use strict';
  var FS, WG, log, rpr;

  //===========================================================================================================
  WG = require('./main');

  ({rpr} = WG.trm);

  ({log} = console);

  FS = require('fs');

  log(__filename);

  log(FS.readFileSync('../README-types.md', {
    encoding: 'utf-8'
  }));

}).call(this);

//# sourceMappingURL=script-prepublish.js.map