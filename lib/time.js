(function() {
  'use strict';
  var TIME, Time, _dayjs, constants, dayjs, defaults, memo;

  //===========================================================================================================
  _dayjs = null;

  //-----------------------------------------------------------------------------------------------------------
  dayjs = (...P) => {
    var utc;
    if (_dayjs == null) {
      _dayjs = require('dayjs');
      utc = require('dayjs/plugin/utc');
      _dayjs.extend(utc);
    }
    // relativeTime      = require 'dayjs/plugin/relativeTime';      _dayjs.extend relativeTime
    // toObject          = require 'dayjs/plugin/toObject';          _dayjs.extend toObject
    // customParseFormat = require 'dayjs/plugin/customParseFormat'; _dayjs.extend customParseFormat
    // duration          = require 'dayjs/plugin/duration';          _dayjs.extend duration
    return _dayjs(...P);
  };

  //===========================================================================================================
  defaults = {
    /* TAINT validate that count_digits > 0 */
    count_digits: 3,
    counter_joiner: ':',
    ms_digits: 13,
    ms_padder: '0',
    format: 'milliseconds' // 'compact'
  };

  
  //-----------------------------------------------------------------------------------------------------------
  constants = {
    ms_decimals: 3
  };

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT consider to keep these memo values as `globalThis[some_symbol].last_stamp_f` to ensure it being
  shared as widely as possible, in the not-so unlikely event that two scripts make use of two different
  instances of `webguy`. */
  memo = {
    last_stamp_f: null,
    last_count: 0
  };

  //===========================================================================================================
  Time = class Time {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      cfg = {...defaults, ...cfg};
      cfg.ms_padlength = cfg.ms_digits + constants.ms_decimals + 1;
      this.cfg = Object.freeze(cfg);
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    stamp_f() {
      var utc_timestamp;
      return utc_timestamp = performance.timeOrigin + performance.now();
    }

    stamp_s(stamp_f = null) {
      return ((stamp_f != null ? stamp_f : this.stamp_f()).toFixed(constants.ms_decimals)).padStart(this.cfg.ms_padlength, this.cfg.ms_padder);
    }

    //---------------------------------------------------------------------------------------------------------
    monostamp_f2() {
      var stamp_f;
      if ((stamp_f = this.stamp_f()) === memo.last_stamp_f) {
        memo.last_count++;
      } else {
        memo.last_stamp_f = stamp_f;
        memo.last_count = 0;
      }
      return [memo.last_stamp_f, memo.last_count];
    }

    //---------------------------------------------------------------------------------------------------------
    monostamp_s2(stamp_f = null, count = null) {
      var count_s, stamp_decimals, stamp_s;
      if (stamp_f != null) {
        if (count == null) {
          count = 0;
        }
      } else {
        [stamp_f, count] = this.monostamp_f2();
      }
      count_s = count.toString().padStart(this.cfg.count_digits, '0');
      switch (this.cfg.format) {
        case 'milliseconds':
          return [this.stamp_s(stamp_f), count_s];
        default:
          stamp_decimals = stamp_f.toFixed(constants.ms_decimals);
          stamp_decimals = stamp_decimals.replace(/^.*([0-9]{3})\.([0-9]+)/, '$1$2');
          switch (this.cfg.format) {
            case 'iso':
              stamp_s = (new Date(stamp_f)).toISOString();
              stamp_s = stamp_s.replace(/...Z/, `${stamp_decimals}Z`);
              break;
            default:
              stamp_s = (dayjs(stamp_f)).utc().format(this.cfg.format);
              stamp_s = stamp_s.replace(/µ/g, `${stamp_decimals}`);
          }
          return [stamp_s, count_s];
      }
      throw new Error(`unknown format ${this.cfg.format}`);
    }

    //---------------------------------------------------------------------------------------------------------
    monostamp_s1(stamp_f = null, count = null) {
      return (this.monostamp_s2(stamp_f, count)).join(this.cfg.counter_joiner);
    }

  };

  //===========================================================================================================
  TIME = new Time();

  TIME.Time = Time;

  module.exports = TIME;

}).call(this);

//# sourceMappingURL=time.js.map