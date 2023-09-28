(function() {
  'use strict';
  var Isa;

  Isa = (function() {
    //===========================================================================================================
    class Isa {
      //=========================================================================================================
      // Bottom Types
      //---------------------------------------------------------------------------------------------------------
      null(x) {
        return x === null;
      }

      undefined(x) {
        return x === void 0;
      }

      bottom(x) {
        return (x === void 0) || (x === null);
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
        return this.isa.integer(x && ((0x00000 <= x && x <= 0x1ffff)));
      }

      regex(x) {
        return (Object.prototype.toString.call(x)) === '[object RegExp]';
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
        return (this.size_of(x, this._signals.nothing)) !== this._signals.nothing;
      }

      iterable(x) {
        return (x != null) && (x[Symbol.iterator] != null);
      }

      container(x) {
        return (typeof x) !== 'string' && (this.iterable(x)) && (this.sized(x));
      }

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
        return x === 0/* NOTE true for -0 as well */;
      }

      nan(x) {
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
        return (Object.prototype.toString.call(x)) === '[object Function]';
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Isa.class({
      isa: function(x) {
        var ref;
        return ((Object.prototype.toString.call(x)) === '[object Function]') && ((ref = Object.getOwnPropertyDescriptor(x, 'prototype')) != null ? ref.writable : void 0) === false;
      }
    });

    // template:   ->

    //---------------------------------------------------------------------------------------------------------
    Isa.asyncfunction({
      isa: function(x) {
        return (Object.prototype.toString.call(x)) === '[object AsyncFunction]';
      },
      template: function() {}
    });

    //---------------------------------------------------------------------------------------------------------
    Isa.symbol({
      isa: function(x) {
        return (typeof x) === 'symbol';
      },
      template: Symbol(''),
      create: function(x) {
        return Symbol(x);
      }
    });

    //---------------------------------------------------------------------------------------------------------
    Isa.knowntype({
      isa: function(x) {
        if (!((this.isa.text(x)) && (x.length > 0))) {
          return false;
        }
        return GUY.props.has(this.registry, x);
      }
    });

    return Isa;

  }).call(this);

}).call(this);

//# sourceMappingURL=time.js.map