

'use strict'


############################################################################################################
GUY                       = require 'guy'
{ debug
  log
  warn }                  = console

# class A
#   constructor: ->
#     @number = 18
#     return undefined
#   a_f: ->

# class B extends A
#   constructor: ->
#     super()
#     @text = 'abcd'
#     return undefined
#   b_f: ->

# a = new A()
# b = new B()

# ```
# function getAllPropertyNames( owner ) {
#     var props = [];

#     do {
#         Object.getOwnPropertyNames( owner ).forEach(function ( prop ) {
#             if ( props.indexOf( prop ) === -1 ) {
#                 props.push( prop );
#             }
#         });
#     } while ( owner = Object.getPrototypeOf( owner ) );

#     return props;
# }
# ```

@public_keys = ( owner ) ->
  ### thx to https://stackoverflow.com/a/8024294/7568091 ###
  return [] unless owner?
  R = new Set()
  loop
    R.add name for name in Object.getOwnPropertyNames owner
    owner = Object.getPrototypeOf owner
    break unless owner?
    break if owner is Object::
  return [ R..., ];

# info '^1-1^', a
# # info '^1-3^', ( Reflect.ownKeys a ).concat ( Reflect.ownKeys p ) if ( p = Object.getPrototypeOf a )?
# # info '^1-3^', getAllPropertyNames a
# info '^1-3^', getAllPropertyNames_2 a
# info '^1-7^'
# info '^1-1^', b
# # info '^1-3^', ( Reflect.ownKeys b ).concat ( Reflect.ownKeys p ) if ( p = Object.getPrototypeOf b )?
# # info '^1-3^', getAllPropertyNames b
# info '^1-3^', getAllPropertyNames_2 b
# info '^1-7^'

