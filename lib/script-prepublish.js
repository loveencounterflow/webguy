(function() {
  'use strict';
  var FS, PATH, WG, documented_types, implemented_types, log, m, path, readme, rpr, type, undocumented_types,
    indexOf = [].indexOf;

  //===========================================================================================================
  WG = require('./main');

  ({rpr} = WG.trm);

  ({log} = console);

  FS = require('fs');

  PATH = require('path');

  //===========================================================================================================
  path = PATH.resolve(PATH.join(__dirname, '../README-types.md'));

  readme = FS.readFileSync(path, {
    encoding: 'utf-8'
  });

  documented_types = (function() {
    var ref, results;
    ref = readme.matchAll(/\n#### `([^`]+)`/ugs);
    results = [];
    for (m of ref) {
      results.push(m[1]);
    }
    return results;
  })();

  implemented_types = (function() {
    var results;
    results = [];
    for (type in (require('./types')).isa) {
      results.push(type);
    }
    return results;
  })();

  implemented_types = (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = implemented_types.length; i < len; i++) {
      type = implemented_types[i];
      if (!type.startsWith('optional_')) {
        results.push(type);
      }
    }
    return results;
  })();

  implemented_types = (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = implemented_types.length; i < len; i++) {
      type = implemented_types[i];
      if (!type.startsWith('$')) {
        results.push(type);
      }
    }
    return results;
  })();

  undocumented_types = (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = implemented_types.length; i < len; i++) {
      type = implemented_types[i];
      if (indexOf.call(documented_types, type) < 0) {
        results.push(type);
      }
    }
    return results;
  })();

  //===========================================================================================================
  // log documented_types
  // log implemented_types
  if (undocumented_types.length > 0) {
    log('===========================================================');
    log(__filename);
    log("Undocumented types:");
    log('===========================================================');
    log(undocumented_types.join(', '));
  }

}).call(this);

//# sourceMappingURL=script-prepublish.js.map