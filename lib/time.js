(function() {
  'use strict';
  var last_count, last_stamp;

  console.log('^9833847^', require('../dependencies/levithan-date-format.js'));

  //-----------------------------------------------------------------------------------------------------------
  this.stamp = function() {
    var utc_timestamp;
    return utc_timestamp = performance.timeOrigin + performance.now();
  };

  this.stamp_text = function() {
    return this.stamp().toFixed(3);
  };

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT consider to keep these memo values as `globalThis[some_symbol].last_stamp` to ensure it being
  shared as widely as possible, in the not-so unlikely event that two scripts make use of two different
  instances of `webguy`. */
  last_stamp = null;

  last_count = 0;

  this.stamp_and_count = function(count_digits = 3) {
    var stamp;
    if ((stamp = this.stamp_text()) === last_stamp) {
      last_count++;
    } else {
      last_stamp = stamp;
      last_count = 0;
    }
    return [last_stamp, last_count.toString().padStart(3, '0')];
  };

}).call(this);

//# sourceMappingURL=time.js.map