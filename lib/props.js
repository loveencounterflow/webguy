(function() {
  'use strict';
  var get_prototype_chain, hide, obj_proto, templates,
    indexOf = [].indexOf;

  //===========================================================================================================
  templates = {
    acquire_depth_first: {
      source: null,
      target: null,
      filter: null,
      decorator: null
    }
  };

  //===========================================================================================================
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

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT code duplication with `GUY.props.get_prototype_chain()` */
  obj_proto = Object.getPrototypeOf(Object);

  this.get_prototype_chain = get_prototype_chain = function(x) {
    var R;
    if (x == null) {
      return [];
    }
    R = [x];
    while (true) {
      if ((x = Object.getPrototypeOf(x)) == null) {
        break;
      }
      if (x === Object || x === Object.prototype || x === obj_proto) {
        break;
      }
      R.push(x);
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.walk_depth_first_property_descriptors = function*(x) {
    var dsc, i, key, len, proto, protos, ref, ref1;
    ref = protos = (this.get_prototype_chain(x)).reverse();
    for (i = 0, len = ref.length; i < len; i++) {
      proto = ref[i];
      ref1 = Object.getOwnPropertyDescriptors(proto);
      for (key in ref1) {
        dsc = ref1[key];
        if (key === 'constructor') {
          continue;
        }
        yield [key, dsc];
      }
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.acquire_depth_first = function(cfg) {
    var R, dsc, key, ref, ref1, y;
    cfg = {...templates, ...cfg};
    R = (ref = cfg.target) != null ? ref : {};
    ref1 = this.walk_depth_first_property_descriptors(cfg.source);
    for (y of ref1) {
      [key, dsc] = y;
      if (cfg.filter != null) {
        if (!cfg.filter(key)) {
          continue;
        }
      }
      if (cfg.decorator != null) {
        dsc.value = cfg.decorator(dsc.value);
      }
      Object.defineProperty(R, key, dsc);
    }
    return R;
  };

}).call(this);

//# sourceMappingURL=props.js.map