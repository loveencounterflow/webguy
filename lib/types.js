(function() {
  'use strict';
  var Isa, Types, Validate, isa_function, props, rename_isa_methods;

  //===========================================================================================================
  props = require('./props');

  isa_function = function(x) {
    return (Object.prototype.toString.call(x)) === '[object Function]';
  };

  //===========================================================================================================
  Isa = class Isa {
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
    // Existential Types
    //---------------------------------------------------------------------------------------------------------
    anything(x) {
      return true;
    }

    something(x) {
      return x != null;
    }

    nothing(x) {
      return x == null;
    }

    //=========================================================================================================
    // Textual Types
    //---------------------------------------------------------------------------------------------------------
    text(x) {
      return (typeof x) === 'string';
    }

    codepoint(x) {
      return ((typeof x) === 'string') && /^.$/u.test(x);
    }

    codepointid(x) {
      return (this.integer(x)) && ((0x00000 <= x && x <= 0x1ffff));
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
      if (!this.text(x)) {
        return false;
      }
      return (x.match(/^(?:[$_]|\p{ID_Start})(?:[$_\u{200c}\u{200d}]|\p{ID_Continue})*$/u)) != null;
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

    sized(x) {
      var error;
      try {
        return (Reflect.has(x, 'length')) || (Reflect.has(x, 'size'));
      } catch (error1) {
        error = error1;
        return false;
      }
    }

    // container:  ( x ) -> ( typeof x ) isnt 'string' and ( @iterable x ) and ( @sized x )
    // iterable:   ( x ) -> ( ( typeof x ) is 'string' ) and try ( Reflect.has Symbol.iterator ) catch error then false

      //=========================================================================================================
    // Numeric Types
    //---------------------------------------------------------------------------------------------------------
    numeric(x) {
      return (Number.isFinite(x)) || (typeof x === 'bigint');
    }

    float(x) {
      return Number.isFinite(x);
    }

    bigint(x) {
      return typeof x === 'bigint';
    }

    integer(x) {
      return Number.isInteger(x);
    }

    cardinal(x) {
      return (Number.isInteger(x)) && (x >= 0);
    }

    zero(x) {
      return (x === 0) || (x === 0n);
    }

    /* NOTE true for -0 as well */    nan(x) {
      return Number.isNaN(x);
    }

    //---------------------------------------------------------------------------------------------------------
    even(x) {
      if (Number.isInteger(x)) {
        return (x % 2) === 0;
      } else if (typeof x === 'bigint') {
        return (x % 2n) === 0n;
      }
      return false;
    }

    //---------------------------------------------------------------------------------------------------------
    odd(x) {
      if (Number.isInteger(x)) {
        return (x % 2) !== 0;
      } else if (typeof x === 'bigint') {
        return (x % 2n) !== 0n;
      }
      return false;
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

    function(x) {
      return isa_function(x);
    }

    asyncfunction(x) {
      return (Object.prototype.toString.call(x)) === '[object AsyncFunction]';
    }

    symbol(x) {
      return (typeof x) === 'symbol';
    }

    //---------------------------------------------------------------------------------------------------------
    class(x) {
      var ref;
      return ((Object.prototype.toString.call(x)) === '[object Function]') && ((ref = Object.getOwnPropertyDescriptor(x, 'prototype')) != null ? ref.writable : void 0) === false;
    }

  };

  //===========================================================================================================
  (rename_isa_methods = () => {
    var f, i, key, len, ref;
    ref = props.public_keys(Isa.prototype);
    for (i = 0, len = ref.length; i < len; i++) {
      key = ref[i];
      if (!isa_function((f = Isa.prototype[key]))) {
        continue;
      }
      ((f) => {
        props.nameit(`isa_${key}`, f);
        /* TAINT `isa` methods should be called in the context of their `types` instance */
        Isa.prototype[`optional_${key}`] = props.nameit(`isa_optional_${key}`, function(x) {
          return (x == null) || (f.call(this, x));
        });
        return null;
      })(f);
    }
    // console.log 26575, Isa::[ key ] for key in props.public_keys Isa::
    return null;
  })();

  Validate = (function() {
    var clasz;

    //===========================================================================================================
    class Validate extends Isa {
      //---------------------------------------------------------------------------------------------------------
      static create_proxy(x) {
        return new Proxy(x, {
          get: (target, key, receiver) => {
            var R, ast;
            if (Reflect.has(target, accessor)) {
              return target[accessor];
            }
            if ((typeof accessor) !== 'string') {
              return target[accessor];
            }
            if (accessor.startsWith('_')) {
              return target[accessor];
            }
            if (Reflect.has(target, '__get_handler')) {
              ast = (Reflect.has(target, '__parser')) ? target.__parser.parse(accessor) : null;
              if ((R = target.__get_handler(accessor, ast)) != null) {
                R = target.__nameit('###' + accessor, R);
                GUY.props.hide(target, accessor, R);
                return R;
              }
            }
            throw new E.Unknown_accessor('^Intervoke_proxy/proxy.get@1^', accessor);
          }
        });
      }

    };

    //---------------------------------------------------------------------------------------------------------
    clasz = Validate;

    return Validate;

  }).call(this);

  Types = (function() {
    var clasz;

    //---------------------------------------------------------------------------------------------------------
    // constructor: -> clasz.create_proxy @

      //===========================================================================================================
    class Types {
      // #---------------------------------------------------------------------------------------------------------
      // @create_proxy: ( x ) -> new Proxy x,
      //   get: ( target, key, receiver ) =>
      //     return target[ accessor ] if Reflect.has target, accessor
      //     return target[ accessor ] if ( typeof accessor ) isnt 'string'
      //     return target[ accessor ] if accessor.startsWith '_'
      //     if Reflect.has target, '__get_handler'
      //       ast = if ( Reflect.has target, '__parser' ) then target.__parser.parse accessor else null
      //       if ( R = target.__get_handler accessor, ast )?
      //         R = target.__nameit '###' + accessor, R
      //         GUY.props.hide target, accessor, R
      //         return R
      //     throw new E.Unknown_accessor '^Intervoke_proxy/proxy.get@1^', accessor

        //---------------------------------------------------------------------------------------------------------
      constructor() {
        this.isa = new Isa();
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

    //---------------------------------------------------------------------------------------------------------
    clasz = Types;

    return Types;

  }).call(this);

  (() => {    //===========================================================================================================
    return module.exports = {
      Isa: Isa,
      Validate: Validate,
      Types: Types,
      isa: new Isa(),
      validate: new Validate(),
      types: new Types()
    };
  })();

}).call(this);

//# sourceMappingURL=types.js.map