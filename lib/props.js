(function() {
  'use strict';
  var debug, hide, obj_proto, rpr, templates,
    indexOf = [].indexOf;

  //===========================================================================================================
  ({rpr} = require('./trm'));

  ({debug} = console);

  //===========================================================================================================
  templates = {
    acquire_depth_first: {
      target: null,
      filter: null,
      generate: function*(x) {
        return (yield* [x]);
      },
      /* 'generative identity element' */decorator: null,
      descriptor: null,
      overwrite: false
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

  this.get_prototype_chain = function(x) {
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
    var descriptor, i, key, len, owner, ref, ref1;
    if (x == null) {
      return null;
    }
    ref = (this.get_prototype_chain(x)).reverse();
    for (i = 0, len = ref.length; i < len; i++) {
      owner = ref[i];
      ref1 = Object.getOwnPropertyDescriptors(owner);
      for (key in ref1) {
        descriptor = ref1[key];
        if (key === 'constructor') {
          continue;
        }
        yield ({owner, key, descriptor});
      }
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.acquire_depth_first = function(source, cfg) {
    var R, descriptor, g, key, owner, ref, ref1, ref2, seen, y;
    cfg = {...templates.acquire_depth_first, ...cfg};
    R = (ref = cfg.target) != null ? ref : {};
    seen = new Set();
    ref1 = this.walk_depth_first_property_descriptors(source);
    for (y of ref1) {
      ({owner, key, descriptor} = y);
      if (cfg.filter != null) {
        if (!cfg.filter(key)) {
          continue;
        }
      }
      if (seen.has(key)) {
        switch (cfg.overwrite) {
          case 'ignore':
            continue;
          case true:
            null;
            break;
          case false:
            throw new Error(`^props.acquire_depth_first@1^ duplicate key ${rpr(key)} disallowed ` + "because `overwrite` set to `false`");
          default:
            throw new Error("^props.acquire_depth_first@2^ illegal value for `overwrite` " + `${rpr(cfg.overwrite)}; expected one of \`true\`, \`false\`, \`'ignore'\``);
        }
      }
      seen.add(key);
      ref2 = cfg.generate({
        target: R,
        owner,
        key,
        descriptor
      });
      for (g of ref2) {
        if (cfg.descriptor != null) {
          Object.assign(g.descriptor, cfg.descriptor);
        }
        if (cfg.decorator != null) {
          g.descriptor.value = cfg.decorator(g.descriptor.value);
        }
        Object.defineProperty(R, g.key, g.descriptor);
      }
    }
    return R;
  };

}).call(this);

//# sourceMappingURL=props.js.map