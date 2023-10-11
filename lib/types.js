(function() {
  'use strict';
  var Isa, Types, _Types, debug, defaults, props;

  //===========================================================================================================
  props = null;

  ({debug} = console);

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
      var ref;
      return ((Object.prototype.toString.call(x)) === '[object Function]') && ((ref = Object.getOwnPropertyDescriptor(x, 'prototype')) != null ? ref.writable : void 0) === false;
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
      return (Object.prototype.toString.call(x)) === '[object Function]';
    }

    asyncfunction(x) {
      return (Object.prototype.toString.call(x)) === '[object AsyncFunction]';
    }

    symbol(x) {
      return (typeof x) === 'symbol';
    }

    keyowner(x) {
      var _;
      for (_ in x != null ? x : {}) {
        return true;
      }
      return false;
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

    //=========================================================================================================
    // Declaration Types
    //---------------------------------------------------------------------------------------------------------
    $type_declaration(x) {
      return (this.isa.$known_type_name(x)) || (this.isa.$type_declaration_function(x)) || (this.isa.$type_declaration_object(x));
    }

    //---------------------------------------------------------------------------------------------------------
    $type_declaration_function(x) {
      return (this.isa.function(x)) && (x.length === 1);
    }

    $known_type_name(x) {
      return (this.isa.jsidentifier(x)) && (this.isa.$type_declaration_function(this.isa[x]));
    }

    //---------------------------------------------------------------------------------------------------------
    $type_declaration_object(x) {
      var k, v;
      if (!(this.isa.object(x))) {
        return false;
      }
      for (k in x) {
        v = x[k];
        if (!this.isa.jsidentifier(k)) {
          return false;
        }
        if (!this.isa.$type_declaration(x)) {
          return false;
        }
      }
      return true;
    }

    //---------------------------------------------------------------------------------------------------------
    /* NOTE to be rewitten in object style */
    $type_declaration_object(x) {
      if (!this.isa.keyowner(x)) {
        return false;
      }
      if (!this.isa.optional_$type_declaration_function(x.isa)) {
        return false;
      }
      if (!this.isa.optional_$type_declaration_function(x.create)) {
        return false;
      }
      if (!this.isa.optional_$type_declaration_object(x.fields)) {
        return false;
      }
      if (!this.isa.optional_$type_declaration_template(x.template)) {
        return false;
      }
      if (!this.isa.optional_function(x.cast)) {
        return false;
      }
      return true;
    }

  };

  //===========================================================================================================
  defaults = Object.freeze({
    types_cfg: {
      declarations: Isa.prototype
    }
  });

  //===========================================================================================================
  _Types = class _Types {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      cfg = {...defaults.types_cfg, ...cfg};
      this._collect_and_generate_declarations(cfg.declarations);
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    _isa_optional(key, type, x) {
      return (x == null) || (this.isa[type](x));
    }

    //---------------------------------------------------------------------------------------------------------
    _validate(key, type, x) {
      if (this.isa[type](x)) {
        // debug '^_Types::_validate@1^', "#{key} #{type} #{x}"
        return x;
      }
      /* TAINT put message into a resource object? */
      throw new Error(`expected a ${key}, got a ${this.type_of(x)}`);
    }

    //---------------------------------------------------------------------------------------------------------
    _validate_optional(key, type, x) {
      if ((x == null) || (this.isa[type](x))) {
        return x;
      }
      /* TAINT put message into a resource object? */
      throw new Error(`expected a ${key}, got a ${this.type_of(x)}`);
    }

    //---------------------------------------------------------------------------------------------------------
    _collect_and_generate_declarations(declarations) {
      var cfg, me;
      if (props == null) {
        props = require('./props');
      }
      this.isa = {};
      this.validate = {};
      props.hide(this, '_isa_methods', []);
      me = this;
      //.......................................................................................................
      cfg = {
        descriptor: {
          enumerable: true
        },
        overwrite: false,
        // filter: ({ key, }) -> not key.startsWith '_'
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
          yield (function(key, type) {
            var value;
            value = function(x) {
              return me._isa_optional(key, type, x);
            };
            descriptor = {...descriptor, value};
            return {
              target: me.isa,
              key,
              descriptor
            };
          })(`optional_${type}`, type);
          //...................................................................................................
          // validate_$type
          yield (function(key, type) {
            var value;
            value = (x) => {
              return me._validate(key, type, x);
            };
            descriptor = {...descriptor, value};
            return {
              target: me.validate,
              key,
              descriptor
            };
          })(type, type);
          //...................................................................................................
          // validate_optional_$type
          yield (function(key, type) {
            var value;
            value = (x) => {
              return me._validate_optional(key, type, x);
            };
            descriptor = {...descriptor, value};
            return {
              target: me.validate,
              key,
              descriptor
            };
          })(`optional_${type}`, type);
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
  Types = class Types extends _Types {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      super(cfg);
      this._transform_and_validate_declarations();
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    _collect_and_generate_declarations(declarations) {
      if (props == null) {
        props = require('./props');
      }
      props.hide(this, '_types', new _Types());
      declarations = this._types.isa.class(declarations) ? declarations.prototype : declarations;
      return super._collect_and_generate_declarations(declarations);
    }

    //---------------------------------------------------------------------------------------------------------
    _transform_and_validate_declarations() {
      var k, ref, v;
      ref = this.isa;
      // debug '^Types::_transform_and_validate_declarations@1^'
      for (k in ref) {
        v = ref[k];
        // debug '^Types::_transform_and_validate_declarations@1^', k, v
        if (!(this.validate.jsidentifier(k))) {
          null;
        }
        if (!(this.validate.$type_declaration(k))) {
          null;
        }
      }
      return null;
    }

  };

  //===========================================================================================================
  module.exports = new Types();

  module.exports.Isa = Isa;

  module.exports.Types = Types;

}).call(this);

//# sourceMappingURL=types.js.map