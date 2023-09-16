(function() {
  'use strict';
  var LOUPE, rpr;

  //===========================================================================================================
  LOUPE = require('../dependencies/loupe.js');

  //-----------------------------------------------------------------------------------------------------------
  this.rpr = rpr = (x) => {
    return LOUPE.inspect(x, {
      customInspect: false
    });
  };

}).call(this);

//# sourceMappingURL=trm.js.map