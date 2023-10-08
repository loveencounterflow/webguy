(function() {
  'use strict';
  var Isa, Types, debug, defaults, isa_class, isa_function, props, rename_isa_methods;

  //===========================================================================================================
  props = null;

  ({debug} = console);

  //-----------------------------------------------------------------------------------------------------------
  isa_function = function(x) {
    return (Object.prototype.toString.call(x)) === '[object Function]';
  };

  isa_class = function(x) {
    var ref;
    return ((Object.prototype.toString.call(x)) === '[object Function]') && ((ref = Object.getOwnPropertyDescriptor(x, 'prototype')) != null ? ref.writable : void 0) === false;
  };

  //===========================================================================================================
  this.Isa = Isa = class Isa {
    //=========================================================================================================
    // Bottom Types
    //---------------------------------------------------------------------------------------------------------
    null(x) {
      return x === null;
    }

    undefined(x) {
      return x === void 0;
    }

    //=========================================================================================================
    // Textual Types
    //---------------------------------------------------------------------------------------------------------
    text(x) {
      return (typeof x) === 'string';
    }

    codepoint(x) {
      return (this.isa.text(x)) && (/^.$/u.test(x));
    }

    regex(x) {
      return (Object.prototype.toString.call(x)) === '[object RegExp]';
    }

    buffer(x) {
      var ref, ref1;
      return ((ref = (ref1 = globalThis.Buffer) != null ? ref1.isBuffer : void 0) != null ? ref : function() {
        return false;
      })(x);
    }

    //---------------------------------------------------------------------------------------------------------
    /* thx to https://github.com/mathiasbynens/mothereff.in/blob/master/js-variables/eff.js and
     https://mathiasbynens.be/notes/javascript-identifiers-es6 */
    jsidentifier(x) {
      return (this.isa.text(x)) && ((x.match(/^(?:[$_]|\p{ID_Start})(?:[$_\u{200c}\u{200d}]|\p{ID_Continue})*$/u)) != null);
    }

    //=========================================================================================================
    // Container Types
    //---------------------------------------------------------------------------------------------------------
    list(x) {
      return Array.isArray(x);
    }

    set(x) {
      return x instanceof Set;
    }

    map(x) {
      return x instanceof Map;
    }

    // sized:      ( x ) -> try ( ( Reflect.has x, 'length' ) or ( Reflect.has x, 'size' ) ) catch error then false

      // container:  ( x ) -> ( typeof x ) isnt 'string' and ( @isa.iterable x ) and ( @isa.sized x )
    // iterable:   ( x ) -> ( ( typeof x ) is 'string' ) and try ( Reflect.has Symbol.iterator ) catch error then false

      //=========================================================================================================
    // Numeric Types
    //---------------------------------------------------------------------------------------------------------
    infinity(x) {
      return (x === +2e308) || (x === -2e308);
    }

    float(x) {
      return Number.isFinite(x);
    }

    numeric(x) {
      return (Number.isFinite(x)) || (typeof x === 'bigint');
    }

    bigint(x) {
      return typeof x === 'bigint';
    }

    integer(x) {
      return Number.isInteger(x);
    }

    codepointid(x) {
      return (this.isa.integer(x)) && ((0x00000 <= x && x <= 0x1ffff));
    }

    cardinal(x) {
      return (Number.isInteger(x)) && (x >= 0);
    }

    zero(x) {
      return x === 0/* NOTE true for -0 as well */;
    }

    nan(x) {
      return Number.isNaN(x);
    }

    nonzero(x) {
      return (this.isa.numeric(x)) && (!this.isa.zero(x));
    }

    //---------------------------------------------------------------------------------------------------------
    even(x) {
      return (Number.isInteger(x)) && ((x % 2) === 0);
    }

    odd(x) {
      return (Number.isInteger(x)) && ((x % 2) !== 0);
    }

    //=========================================================================================================
    // Classes
    //---------------------------------------------------------------------------------------------------------
    class(x) {
      return isa_class(x);
    }

    //=========================================================================================================
    // Other Types
    //---------------------------------------------------------------------------------------------------------
    boolean(x) {
      return (x === true) || (x === false);
    }

    object(x) {
      return (x != null) && (typeof x === 'object') && ((Object.prototype.toString.call(x)) === '[object Object]');
    }

    buffer(x) {
      if (globalThis.Buffer != null) {
        return Buffer.isBuffer(x);
      } else {
        return false;
      }
    }

    function(x) {
      return isa_function(x);
    }

    asyncfunction(x) {
      return (Object.prototype.toString.call(x)) === '[object AsyncFunction]';
    }

    symbol(x) {
      return (typeof x) === 'symbol';
    }

    //=========================================================================================================
    // Existential Types
    //---------------------------------------------------------------------------------------------------------
    nothing(x) {
      return x == null;
    }

    something(x) {
      return x != null;
    }

    anything(x) {
      return true;
    }

  };

  //===========================================================================================================
  (rename_isa_methods = () => {
    var f, i, key, len, ref;
    if (props == null) {
      props = require('./props');
    }
    ref = props.public_keys(Isa.prototype);
    for (i = 0, len = ref.length; i < len; i++) {
      key = ref[i];
      if (!isa_function((f = Isa.prototype[key]))) {
        continue;
      }
      // do ( f ) =>
      props.nameit(`isa_${key}`, f);
    }
    // return null
    // console.log 26575, Isa::[ key ] for key in props.public_keys Isa::
    return null;
  })();

  //===========================================================================================================
  defaults = Object.freeze({
    types_cfg: {
      declarations: Isa
    }
  });

  //===========================================================================================================
  this.Types = Types = class Types {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      cfg = {...defaults.types_cfg, ...cfg};
      // debug '^constructor@1^', cfg.declarations.constructor.name, cfg.declarations
      this._compile(cfg.declarations);
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    * _walk_keys_and_methods(x) {
      var i, key, len, method, ref, top;
      /* Iterate over enumerable `[ key, method, ]` pairs of `x` and its prototypes. The iteration will start
         with `x.prototype` ) `x::` if `x` is a class and with `x` itself otherwise. */
      if (props == null) {
        props = require('./props');
      }
      top = isa_class(x) ? x.prototype : x;
      ref = props.public_keys(top);
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        method = top[key];
        if (!isa_function(method)) {
          continue;
        }
        yield [key, method];
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _compile(declarations) {
      var cfg, me;
      if (props == null) {
        props = require('./props');
      }
      this.isa = {};
      this.validate = {};
      props.hide(this, '_isa_methods', []);
      declarations = isa_class ? declarations.prototype : declarations;
      me = this;
      //.......................................................................................................
      cfg = {
        descriptor: {
          enumerable: false
        },
        overwrite: false,
        //.....................................................................................................
        generator: function*({target, owner, key, descriptor}) {
          var type;
          type = key;
          yield ({
            target: me.isa,
            key,
            descriptor
          });
          //...................................................................................................
          // optional_$type
          yield (function(key) {
            var value;
            value = function(x) {
              return (x == null) || (me.isa[type](x));
            };
            descriptor = {...descriptor, value};
            return {
              target: me.isa,
              key,
              descriptor
            };
          })(`optional_${type}`);
          //...................................................................................................
          // validate_$type
          yield (function(key) {
            var value;
            value = (x) => {
              if (me.isa[type](x)) {
                return x;
              }
              throw new Error(`expected a ${key} got a ${me.type_of(x)}`);
            };
            descriptor = {...descriptor, value};
            return {
              target: me.validate,
              key,
              descriptor
            };
          })(type);
          //...................................................................................................
          // validate_optional_$type
          yield (function(key) {
            var value;
            value = (x) => {
              if ((x == null) || (me.isa[type](x))) {
                return x;
              }
              throw new Error(`expected an ${key} got a ${me.type_of(x)}`);
            };
            descriptor = {...descriptor, value};
            return {
              target: me.validate,
              key,
              descriptor
            };
          })(`optional_${type}`);
          //...................................................................................................
          return null;
        },
        //.....................................................................................................
        decorator: function({
            target,
            owner,
            key: type,
            descriptor: {value}
          }) {
          switch (target) {
            case me.isa:
              value = props.nameit(`isa_${type}`, value.bind(me));
              if (!((type.startsWith('optional_')) || (type === 'nothing' || type === 'something' || type === 'anything'))) {
                me._isa_methods.push([type, value]);
              }
              break;
            case me.validate:
              value = props.nameit(`validate_${type}`, value.bind(me));
          }
          return {value};
        }
      };
      //.......................................................................................................
      props.acquire_depth_first(declarations, cfg);
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    type_of(x) {
      var i, isa_method, len, ref, type;
      ref = this._isa_methods;
      for (i = 0, len = ref.length; i < len; i++) {
        [type, isa_method] = ref[i];
        if (isa_method(x)) {
          return type;
        }
      }
      if ((type = this.get_denicola_device_name(x)) !== '0') {
        // debug '^Types::type_of@1^', @get_denicola_device_name x
        return type.toLowerCase();
      }
      /* TAINT return class name? */
      /* TAINT raise exception? */
      return 'something';
    }

    //---------------------------------------------------------------------------------------------------------
    get_miller_device_name(x) {
      var R;
      R = Object.prototype.toString.call(x);
      return R.slice(8, R.length - 1);
    }

    get_denicola_device_name(x) {
      var ref;
      return (ref = x != null ? x.constructor.name : void 0) != null ? ref : '0';
    }

    //---------------------------------------------------------------------------------------------------------
    get_carter_device_name(x, miller_device_name = null) {
      var descriptor;
      if (miller_device_name == null) {
        miller_device_name = Object.prototype.toString.call(x);
      }
      if (miller_device_name !== '[object Function]' && miller_device_name !== 'Function') {
        return 'other';
      }
      if ((descriptor = Object.getOwnPropertyDescriptor(x, 'prototype')) == null) {
        return 'fn';
      }
      if (descriptor.writable) {
        return 'fn';
      }
      return 'class';
    }

    //---------------------------------------------------------------------------------------------------------
    get_type_signature(x) {
      return [typeof x, this.get_miller_device_name(x), this.get_denicola_device_name(x), this.get_carter_device_name(x), (Number.isNaN(x) ? 'N' : '0')].join('/');
    }

  };

  //===========================================================================================================
  module.exports = new Types();

  module.exports.Isa = Isa;

  module.exports.Types = Types;

}).call(this);

//# sourceMappingURL=types.js.map