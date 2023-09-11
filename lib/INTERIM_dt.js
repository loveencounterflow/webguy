(function() {
  'use strict';
  var defaults;

  //###########################################################################################################
  /* https://day.js.org */
  this._dayjs = require('dayjs');

  this._timestamp_input_template = 'YYYYMMDD-HHmmssZ';

  this._timestamp_output_template = 'YYYYMMDD-HHmmss[Z]';

  defaults = {};

  (() => {    //===========================================================================================================
    var customParseFormat, duration, relativeTime, toObject, utc;
    utc = require('dayjs/plugin/utc');
    this._dayjs.extend(utc);
    relativeTime = require('dayjs/plugin/relativeTime');
    this._dayjs.extend(relativeTime);
    toObject = require('dayjs/plugin/toObject');
    this._dayjs.extend(toObject);
    customParseFormat = require('dayjs/plugin/customParseFormat');
    this._dayjs.extend(customParseFormat);
    duration = require('dayjs/plugin/duration');
    return this._dayjs.extend(duration);
  })();

  //===========================================================================================================
  // H.types.declare 'guy_dt_valid_dayjs', tests:
  //   "( @type_of x ) is 'm'":  ( x ) -> ( @type_of x ) is 'm'
  //   "@isa.float x.$y":        ( x ) -> @isa.float x.$y
  //   "@isa.float x.$M":        ( x ) -> @isa.float x.$M
  //   "@isa.float x.$D":        ( x ) -> @isa.float x.$D
  //   "@isa.float x.$W":        ( x ) -> @isa.float x.$W
  //   "@isa.float x.$H":        ( x ) -> @isa.float x.$H
  //   "@isa.float x.$m":        ( x ) -> @isa.float x.$m
  //   "@isa.float x.$s":        ( x ) -> @isa.float x.$s
  //   "@isa.float x.$ms":       ( x ) -> @isa.float x.$ms

  // #-----------------------------------------------------------------------------------------------------------
  // H.types.declare 'guy_dt_timestamp', tests:
  //   "@isa.text x":                    ( x ) -> @isa.text x
  //   "( /^\\d{8}-\\d{6}Z$/ ).test x":  ( x ) -> ( /^\d{8}-\d{6}Z$/ ).test x
  this._isa_guy_dt_timestamp = function(x) {
    return (typeof x === 'string') && /^\d{8}-\d{6}Z$/.test(x);
  };

  // #-----------------------------------------------------------------------------------------------------------
  // H.types.declare 'guy_dt_now_cfg', tests:
  //   "@isa.object x":                    ( x ) -> @isa.object x
  defaults.guy_dt_now_cfg = {
    subtract: null,
    add: null
  };

  //===========================================================================================================
  // DATETIME
  //-----------------------------------------------------------------------------------------------------------
  this.from_now = function(srts) {
    return (this.parse(srts)).fromNow();
  };

  //-----------------------------------------------------------------------------------------------------------
  this.now = function(cfg) {
    var R;
    // H.types.validate.guy_dt_now_cfg ( cfg = { defaults.guy_dt_now_cfg..., cfg..., } )
    cfg = {...defaults.guy_dt_now_cfg, ...cfg};
    R = this._dayjs().utc();
    if (cfg.subtract != null) {
      R = R.subtract(...cfg.subtract);
    }
    if (cfg.add != null) {
      R = R.add(...cfg.add);
    }
    return R.format(this._timestamp_output_template);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.srts_from_isots = function(isots) {
    return (this._dayjs(isots)).utc().format(this._timestamp_output_template);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.parse = function(srts) {
    var R;
    // H.types.validate.guy_dt_timestamp srts
    R = (this._dayjs(srts, this._timestamp_input_template)).utc();
    console.log('^5353^', R);
    if (!this._isa_guy_dt_timestamp(R)) {
      throw new Error(`^guy.datetime.dt_parse@1^ not a valid SRTS: ${srts}`);
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.format = function(srts, ...P) {
    var R;
    R = this.parse(srts);
    return R.format(...P);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.isots_from_srts = function(srts) {
    return (this.parse(srts)).format();
  };

}).call(this);

//# sourceMappingURL=INTERIM_dt.js.map