

'use strict'


############################################################################################################
GUY                       = require 'guy'
{ alert
  debug
  help
  info
  plain
  praise
  urge
  warn
  whisper }               = GUY.trm.get_loggers 'iterate-the-right-kind-of-properties'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
#...........................................................................................................
# { isa
#   declare
#   type_of
#   validate
#   equals }                = types
{ after
  defer
  sleep }                 = GUY.async



class A
  constructor: ->
    @number = 18
    return undefined
  a_f: ->

class B extends A
  constructor: ->
    super()
    @text = 'abcd'
    return undefined
  b_f: ->

a = new A()
b = new B()

```
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
```

getAllPropertyNames_2 = ( obj ) ->
  ### thx to https://stackoverflow.com/a/8024294/7568091 ###
  R = new Set()
  loop
    R.add name for name in Object.getOwnPropertyNames obj
    obj = Object.getPrototypeOf obj
    break unless obj?
    debug '^345^', obj
    break if obj is Object::
  return [ R..., ];

info '^1-1^', a
# info '^1-3^', ( Reflect.ownKeys a ).concat ( Reflect.ownKeys p ) if ( p = Object.getPrototypeOf a )?
# info '^1-3^', getAllPropertyNames a
info '^1-3^', getAllPropertyNames_2 a
info '^1-7^'
info '^1-1^', b
# info '^1-3^', ( Reflect.ownKeys b ).concat ( Reflect.ownKeys p ) if ( p = Object.getPrototypeOf b )?
# info '^1-3^', getAllPropertyNames b
info '^1-3^', getAllPropertyNames_2 b
info '^1-7^'

