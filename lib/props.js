(function() {
  'use strict';
  var hide,
    indexOf = [].indexOf;

  //-----------------------------------------------------------------------------------------------------------
  this._excluded_public_keys = Object.freeze(['constructor']);

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
        if ((typeof name) === 'symbol') {
          continue;
        }
        if (indexOf.call(this._excluded_public_keys, name) >= 0) {
          continue;
        }
        if (name.startsWith('_')) {
          continue;
        }
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

  //-----------------------------------------------------------------------------------------------------------
  this.nameit = function(name, f) {
    Object.defineProperty(f, 'name', {
      value: name
    });
    return f;
  };

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT code duplication with `GUY.props.hide()` */
  this.hide = hide = (object, name, value) => {
    return Object.defineProperty(object, name, {
      enumerable: false,
      writable: true,
      configurable: true,
      value: value
    });
  };

}).call(this);

//# sourceMappingURL=props.js.map