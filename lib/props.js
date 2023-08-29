(function() {
  'use strict';
  //-----------------------------------------------------------------------------------------------------------
  this.public_keys = function(owner) {
    var R, i, len, name, ref;
    /* thx to https://stackoverflow.com/a/8024294/7568091 */
    if (owner == null) {
      return [];
    }
    R = new Set();
    while (true) {
      ref = Object.getOwnPropertyNames(owner);
      for (i = 0, len = ref.length; i < len; i++) {
        name = ref[i];
        R.add(name);
      }
      owner = Object.getPrototypeOf(owner);
      if (owner == null) {
        break;
      }
      if (owner === Object.prototype) {
        break;
      }
    }
    return [...R];
  };

}).call(this);

//# sourceMappingURL=props.js.map