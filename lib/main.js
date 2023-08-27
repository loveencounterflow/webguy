(function() {
  'use strict';
  var A, B, GUY, a, after, alert, b, debug, defer, echo, getAllPropertyNames_2, help, info, inspect, log, plain, praise, rpr, sleep, urge, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('iterate-the-right-kind-of-properties'));

  ({rpr, inspect, echo, log} = GUY.trm);

  //...........................................................................................................
  // { isa
  //   declare
  //   type_of
  //   validate
  //   equals }                = types
  ({after, defer, sleep} = GUY.async);

  A = class A {
    constructor() {
      this.number = 18;
      return void 0;
    }

    a_f() {}

  };

  B = class B extends A {
    constructor() {
      super();
      this.text = 'abcd';
      return void 0;
    }

    b_f() {}

  };

  a = new A();

  b = new B();

  
function getAllPropertyNames( obj ) {
    var props = [];

    do {
        Object.getOwnPropertyNames( obj ).forEach(function ( prop ) {
            if ( props.indexOf( prop ) === -1 ) {
                props.push( prop );
            }
        });
    } while ( obj = Object.getPrototypeOf( obj ) );

    return props;
}
;

  getAllPropertyNames_2 = function(obj) {
    /* thx to https://stackoverflow.com/a/8024294/7568091 */
    var R, i, len, name, ref;
    R = new Set();
    while (true) {
      ref = Object.getOwnPropertyNames(obj);
      for (i = 0, len = ref.length; i < len; i++) {
        name = ref[i];
        R.add(name);
      }
      obj = Object.getPrototypeOf(obj);
      if (obj == null) {
        break;
      }
      debug('^345^', obj);
      if (obj === Object.prototype) {
        break;
      }
    }
    return [...R];
  };

  info('^1-1^', a);

  // info '^1-3^', ( Reflect.ownKeys a ).concat ( Reflect.ownKeys p ) if ( p = Object.getPrototypeOf a )?
  // info '^1-3^', getAllPropertyNames a
  info('^1-3^', getAllPropertyNames_2(a));

  info('^1-7^');

  info('^1-1^', b);

  // info '^1-3^', ( Reflect.ownKeys b ).concat ( Reflect.ownKeys p ) if ( p = Object.getPrototypeOf b )?
  // info '^1-3^', getAllPropertyNames b
  info('^1-3^', getAllPropertyNames_2(b));

  info('^1-7^');

}).call(this);

//# sourceMappingURL=main.js.map