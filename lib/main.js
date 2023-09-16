(function() {
  'use strict';
  var Guy;

  Guy = (function() {
    //===========================================================================================================
    class Guy {
      //---------------------------------------------------------------------------------------------------------
      // constructor: ( target = null ) ->
      constructor(cfg = null) {
        this.cfg = cfg;
        //.......................................................................................................
        // props.def_oneoff @, 'watch',    { enumerable: true, }, -> require './watch'
        return void 0;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Guy.prototype.props = require('./props');

    Guy.prototype.time = require('./time');

    Guy.prototype.environment = require('./environment');

    Guy.prototype.trm = require('./trm');

    return Guy;

  }).call(this);

  //===========================================================================================================
  module.exports = new Guy();

}).call(this);

//# sourceMappingURL=main.js.map