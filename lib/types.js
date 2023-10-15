(function() {
  'use strict';
  var All_of, Any_of, Intertype, Isa, Iterator, Optional, _Intertype, _types, debug, defaults, nothing, props;

  //===========================================================================================================
  props = null;

  ({debug} = console);

  nothing = Symbol('nothing');

  //===========================================================================================================
  Optional = class Optional {
    constructor() {
      this.get();
      void 0;
    }

    set(x) {
      this.value = x;
      return this;
    }

    get() {
      var R;
      [R, this.value] = [this.value, nothing];
      return R;
    }

  };

  //===========================================================================================================
  Iterator = class Iterator {
    constructor(x) {
      var R, me, type;
      me = this;
      this.value = x;
      this.iterator = (function() {
        switch (type = _types.type_of(this.value)) {
          case 'list':
            return this.value.values();
          case 'text':
            return (function*() {
              return (yield* me.value);
            })();
          default:
            if ((R = x != null ? x[Symbol.iterator] : void 0) != null) {
              R;
            }
            throw new Error(`unable to iterate over a ${type}`);
        }
      }).call(this);
      return void 0;
    }

    [Symbol.iterator]() {
      return this.iterator;
    }

  };

  All_of = class All_of extends Iterator {};

  Any_of = class Any_of extends Iterator {};

  //===========================================================================================================
  Isa = class Isa {
    constructor() {
      // codepoint:      ( x ) -> ( @isa.text x ) and      ( /^.$/u.test x )
      this.int2text = this.int2text.bind(this);
      this.int10text = this.int10text.bind(this);
      this.int16text = this.int16text.bind(this);
      //---------------------------------------------------------------------------------------------------------
      this.arraybuffer = this.arraybuffer.bind(this);
      this.int8array = this.int8array.bind(this);
      this.uint8array = this.uint8array.bind(this);
      this.uint8clampedarray = this.uint8clampedarray.bind(this);
      this.int16array = this.int16array.bind(this);
      this.uint16array = this.uint16array.bind(this);
      this.int32array = this.int32array.bind(this);
      this.uint32array = this.uint32array.bind(this);
      this.float32array = this.float32array.bind(this);
      this.float64array = this.float64array.bind(this);
      this.infinitefloat = this.infinitefloat.bind(this);
      this.proper_fraction = this.proper_fraction.bind(this);
      this.safeinteger = this.safeinteger.bind(this);
      //=========================================================================================================
      // Other Types
      //---------------------------------------------------------------------------------------------------------
      this.date = this.date.bind(this);
      this.generatorfunction = this.generatorfunction.bind(this);
      this.asyncgeneratorfunction = this.asyncgeneratorfunction.bind(this);
      this.asyncgenerator = this.asyncgenerator.bind(this);
      this.generator = this.generator.bind(this);
      //---------------------------------------------------------------------------------------------------------
      this.listiterator = this.listiterator.bind(this);
      this.textiterator = this.textiterator.bind(this);
      this.setiterator = this.setiterator.bind(this);
      this.mapiterator = this.mapiterator.bind(this);
      //---------------------------------------------------------------------------------------------------------
      this.promise = this.promise.bind(this);
      this.nativepromise = this.nativepromise.bind(this);
      this.thenable = this.thenable.bind(this);
      this.frozen = this.frozen.bind(this);
      this.sealed = this.sealed.bind(this);
      this.extensible = this.extensible.bind(this);
      /* These qualified types should never be returned by `type_of()`: */
      this.empty_list = this.empty_list.bind(this);
      this.empty_text = this.empty_text.bind(this);
      this.empty_map = this.empty_map.bind(this);
      this.empty_set = this.empty_set.bind(this);
      this.nonempty_list = this.nonempty_list.bind(this);
      this.nonempty_text = this.nonempty_text.bind(this);
      this.nonempty_map = this.nonempty_map.bind(this);
      this.nonempty_set = this.nonempty_set.bind(this);
      this.empty_object = this.empty_object.bind(this);
      this.nonempty_object = this.nonempty_object.bind(this);
    }

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

    chr(x) {
      return (this.isa.text(x)) && (/^.$/us.test(x));
    }

    blank_text(x) {
      return (this.isa.text(x)) && (/^\s*$/us.test(x));
    }

    nonblank_text(x) {
      return (this.isa.text(x)) && !(/^\s*$/us.test(x));
    }

    int2text(x) {
      return (this.isa.text(x)) && ((x.match(/^[01]+$/)) != null);
    }

    int10text(x) {
      return (this.isa.text(x)) && ((x.match(/^[0-9]+$/)) != null);
    }

    int16text(x) {
      return (this.isa.text(x)) && ((x.match(/^[0-9a-fA-F]+$/)) != null);
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

    arraybuffer(x) {
      return (Object.prototype.toString.call(x)) === '[object ArrayBuffer]';
    }

    int8array(x) {
      return (Object.prototype.toString.call(x)) === '[object Int8Array]';
    }

    uint8array(x) {
      return (Object.prototype.toString.call(x)) === '[object Uint8Array]';
    }

    uint8clampedarray(x) {
      return (Object.prototype.toString.call(x)) === '[object Uint8ClampedArray]';
    }

    int16array(x) {
      return (Object.prototype.toString.call(x)) === '[object Int16Array]';
    }

    uint16array(x) {
      return (Object.prototype.toString.call(x)) === '[object Uint16Array]';
    }

    int32array(x) {
      return (Object.prototype.toString.call(x)) === '[object Int32Array]';
    }

    uint32array(x) {
      return (Object.prototype.toString.call(x)) === '[object Uint32Array]';
    }

    float32array(x) {
      return (Object.prototype.toString.call(x)) === '[object Float32Array]';
    }

    float64array(x) {
      return (Object.prototype.toString.call(x)) === '[object Float64Array]';
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

    weakmap(x) {
      return (Object.prototype.toString.call(x)) === '[object WeakMap]';
    }

    weakset(x) {
      return (Object.prototype.toString.call(x)) === '[object WeakSet]';
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

    infinitefloat(x) {
      return (this.isa.float(x)) || (x === 2e308) || (x === -2e308);
    }

    int32(x) {
      return (this.isa.integer(x)) && ((-2147483648 <= x && x <= 2147483647));
    }

    proper_fraction(x) {
      return (this.isa.float(x)) && ((0 <= x && x <= 1));
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

    safeinteger(x) {
      return Number.isSafeInteger(x);
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

    date(x) {
      return (Object.prototype.toString.call(x)) === '[object Date]';
    }

    boolean(x) {
      return (x === true) || (x === false);
    }

    true(x) {
      return x === true;
    }

    false(x) {
      return x === false;
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

    symbol(x) {
      return (typeof x) === 'symbol';
    }

    error(x) {
      return (Object.prototype.toString.call(x)) === 'error';
    }

    global(x) {
      return x === globalThis;
    }

    //---------------------------------------------------------------------------------------------------------
    function(x) {
      return (Object.prototype.toString.call(x)) === '[object Function]';
    }

    asyncfunction(x) {
      return (Object.prototype.toString.call(x)) === '[object AsyncFunction]';
    }

    generatorfunction(x) {
      return (Object.prototype.toString.call(x)) === 'generatorfunction';
    }

    asyncgeneratorfunction(x) {
      return (Object.prototype.toString.call(x)) === 'asyncgeneratorfunction';
    }

    asyncgenerator(x) {
      return (Object.prototype.toString.call(x)) === 'asyncgenerator';
    }

    generator(x) {
      return (Object.prototype.toString.call(x)) === 'generator';
    }

    listiterator(x) {
      return (Object.prototype.toString.call(x)) === '[object ArrayIterator]';
    }

    textiterator(x) {
      return (Object.prototype.toString.call(x)) === '[object StringIterator]';
    }

    setiterator(x) {
      return (Object.prototype.toString.call(x)) === '[object SetIterator]';
    }

    mapiterator(x) {
      return (Object.prototype.toString.call(x)) === '[object MapIterator]';
    }

    promise(x) {
      return (this.isa.nativepromise(x)) || (this.isa.thenable(x));
    }

    nativepromise(x) {
      return x instanceof Promise;
    }

    thenable(x) {
      var ref;
      return this.isa.function(this.type_of((ref = x != null ? x.then : void 0) != null ? ref : null));
    }

    //=========================================================================================================
    // Generics and Qualified Types
    //---------------------------------------------------------------------------------------------------------
    /* Almost anything in JS can be a `$keyowner` (i.e. have one or more enumerable properties attached to it)
     so we test for this late in the chain: */
    $keyowner(x) {
      var _;
      for (_ in x != null ? x : {}) {
        return true;
      }
      return false;
    }

    frozen(x) {
      return Object.isFrozen(x);
    }

    sealed(x) {
      return Object.isSealed(x);
    }

    extensible(x) {
      return Object.isExtensible(x);
    }

    empty_list(x) {
      return (this.isa.list(x)) && (x.length === 0);
    }

    empty_text(x) {
      return (this.isa.text(x)) && (x.length === 0);
    }

    empty_map(x) {
      return (this.isa.map(x)) && (x.size === 0);
    }

    empty_set(x) {
      return (this.isa.set(x)) && (x.size === 0);
    }

    nonempty_list(x) {
      return (this.isa.list(x)) && (x.length !== 0);
    }

    nonempty_text(x) {
      return (this.isa.text(x)) && (x.length !== 0);
    }

    nonempty_map(x) {
      return (this.isa.map(x)) && (x.size !== 0);
    }

    nonempty_set(x) {
      return (this.isa.set(x)) && (x.size !== 0);
    }

    empty_object(x) {
      return (this.isa.object(x)) && (!this.isa.$keyowner(x));
    }

    nonempty_object(x) {
      return (this.isa.object(x)) && (this.isa.$keyowner(x));
    }

    /* Generic types: */
    truthy(x) {
      return !!x;
    }

    falsy(x) {
      return !x;
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
    $type_declaration_fields_object(x) {
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
  _Intertype = class _Intertype {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      if (props == null) {
        props = require('./props');
      }
      cfg = {...defaults.types_cfg, ...cfg};
      this._collect_and_generate_declarations(cfg.declarations);
      this._optional = new Optional();
      props.hide(this, 'optional', this.optional.bind(this));
      props.hide(this, 'type_of', this.type_of.bind(this));
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    _isa(key, type, x, isa) {
      var element, ref, ref1;
      if (x === this._optional) {
        return true;
      }
      //.......................................................................................................
      if (x instanceof All_of) {
        ref = x.value;
        for (element of ref) {
          if (!isa.call(this, element)) {
            return false;
          }
        }
        return true;
      //.......................................................................................................
      } else if (x instanceof Any_of) {
        ref1 = x.value;
        for (element of ref1) {
          if (isa.call(this, element)) {
            return true;
          }
        }
        return false;
      }
      //.......................................................................................................
      return isa.call(this, x);
    }

    //---------------------------------------------------------------------------------------------------------
    _validate(key, type, x) {
      if (x === this._optional) {
        // debug '^_Intertype::_validate@1^', "#{key} #{type} #{x}"
        return x.value;
      }
      if (this.isa[type](x)) {
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
          var isa, type, value;
          type = key;
          isa = descriptor.value;
          value = function(x) {
            return me._isa(key, type, x, isa);
          };
          descriptor = {...descriptor, value};
          yield ({
            target: me.isa,
            key,
            descriptor
          });
          //...................................................................................................
          // validate_$type
          yield (function(key, type) {
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
              if (!((type.startsWith('optional_')) || (type.startsWith('$')) || (type === 'nothing' || type === 'something' || type === 'anything'))) {
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
    optional(x) {
      if (x != null) {
        return x;
      } else {
        return this._optional.set(x);
      }
    }

    all_of(x) {
      return new All_of(x);
    }

    any_of(x) {
      return new Any_of(x);
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
  Intertype = class Intertype extends _Intertype {
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
      props.hide(this, '_types', new _Intertype());
      declarations = this._types.isa.class(declarations) ? declarations.prototype : declarations;
      return super._collect_and_generate_declarations(declarations);
    }

    //---------------------------------------------------------------------------------------------------------
    _transform_and_validate_declarations() {
      var k, ref, v;
      ref = this.isa;
      // debug '^Intertype::_transform_and_validate_declarations@1^'
      for (k in ref) {
        v = ref[k];
        // debug '^Intertype::_transform_and_validate_declarations@1^', k, v
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
  _types = new _Intertype();

  module.exports = new Intertype();

  module.exports.Isa = Isa;

  module.exports.Intertype = Intertype;

  module.exports.Optional = Optional;

  module.exports.Iterator = Iterator;

  module.exports.All_of = All_of;

  module.exports.Any_of = Any_of;

}).call(this);

//# sourceMappingURL=types.js.map