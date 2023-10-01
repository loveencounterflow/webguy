

'use strict'

#===========================================================================================================
props                     = require './props'
isa_function              = ( x ) -> ( Object::toString.call x ) is '[object Function]'
{ debug }                 = console


#===========================================================================================================
@Isa = class Isa

  #=========================================================================================================
  # Bottom Types
  #---------------------------------------------------------------------------------------------------------
  null:          ( x ) -> x is null
  undefined:     ( x ) -> x is undefined

  #=========================================================================================================
  # Textual Types
  #---------------------------------------------------------------------------------------------------------
  text:          ( x ) ->
    debug '^text@1^', @constructor.name
    debug '^text@2^', @isa.constructor.name
  codepoint:     ( x ) -> ( ( typeof x ) is 'string' ) and /^.$/u.test x
  regex:         ( x ) -> ( Object::toString.call x ) is '[object RegExp]'
  buffer:        ( x ) -> ( globalThis.Buffer?.isBuffer ? -> false ) x

  #---------------------------------------------------------------------------------------------------------
  ### thx to https://github.com/mathiasbynens/mothereff.in/blob/master/js-variables/eff.js and
  https://mathiasbynens.be/notes/javascript-identifiers-es6 ###
  jsidentifier:  ( x ) ->
    debug '^jsidentifier@1^', @constructor.name
    debug '^jsidentifier@2^', @isa.constructor.name
    return false unless @isa.text x
    return ( x.match \
      /// ^ (?: [ $_ ] | \p{ID_Start} ) (?: [ $ _ \u{200c} \u{200d} ] | \p{ID_Continue} )* $ ///u )?

  #=========================================================================================================
  # Container Types
  #---------------------------------------------------------------------------------------------------------
  list:       ( x ) -> Array.isArray x
  set:        ( x ) -> x instanceof Set
  map:        ( x ) -> x instanceof Map
  # sized:      ( x ) -> try ( ( Reflect.has x, 'length' ) or ( Reflect.has x, 'size' ) ) catch error then false

  # container:  ( x ) -> ( typeof x ) isnt 'string' and ( @isa.iterable x ) and ( @isa.sized x )
  # iterable:   ( x ) -> ( ( typeof x ) is 'string' ) and try ( Reflect.has Symbol.iterator ) catch error then false

  #=========================================================================================================
  # Numeric Types
  #---------------------------------------------------------------------------------------------------------
  infinity:      ( x ) -> ( x is +Infinity ) or ( x is -Infinity )
  float:         ( x ) -> Number.isFinite x
  numeric:       ( x ) -> ( Number.isFinite x ) or ( typeof x is 'bigint' )
  bigint:        ( x ) -> typeof x is 'bigint'
  integer:       ( x ) -> Number.isInteger x
  codepointid:   ( x ) ->
    debug '^codepointid@1^', @constructor?.name ? '??????????????'
    debug '^codepointid@2^', @isa?.constructor?.name ? '??????????????'
    ( @isa.integer x ) and ( 0x00000 <= x <= 0x1ffff )
  cardinal:      ( x ) -> ( Number.isInteger x ) and ( x >= 0 )
  zero:          ( x ) -> ( x is 0 ) or ( x is 0n ) ### NOTE true for -0 as well ###
  nan:           ( x ) -> Number.isNaN x
  nonzero:       ( x ) -> ( @isa.numeric x ) and ( not @isa.zero x )

  #---------------------------------------------------------------------------------------------------------
  even:          ( x ) ->
    if ( Number.isInteger x )     then return ( x % 2  ) is   0
    else if typeof x is 'bigint'  then return ( x % 2n ) is   0n
    return false

  #---------------------------------------------------------------------------------------------------------
  odd:           ( x ) ->
    if ( Number.isInteger x )     then return ( x % 2  ) isnt 0
    else if typeof x is 'bigint'  then return ( x % 2n ) isnt 0n
    return false

  #=========================================================================================================
  # Classes
  #---------------------------------------------------------------------------------------------------------
  class:         ( x ) ->
    ( ( Object::toString.call x ) is '[object Function]' ) and \
      ( Object.getOwnPropertyDescriptor x, 'prototype' )?.writable is false

  #=========================================================================================================
  # Other Types
  #---------------------------------------------------------------------------------------------------------
  boolean:        ( x ) -> ( x is true ) or ( x is false )
  object:         ( x ) -> x? and ( typeof x is 'object' ) and ( ( Object::toString.call x ) is '[object Object]' )
  buffer:         ( x ) -> if globalThis.Buffer? then Buffer.isBuffer x else false
  function:       ( x ) -> isa_function x
  asyncfunction:  ( x ) -> ( Object::toString.call x ) is '[object AsyncFunction]'
  symbol:         ( x ) -> ( typeof x ) is 'symbol'

  #=========================================================================================================
  # Existential Types
  #---------------------------------------------------------------------------------------------------------
  nothing:        ( x ) -> not x?
  something:      ( x ) -> x?
  anything:       ( x ) -> true


#===========================================================================================================
do rename_isa_methods = =>
  for key in props.public_keys Isa::
    continue unless isa_function ( f = Isa::[ key ] )
    # do ( f ) =>
    props.nameit "isa_#{key}", f
      # return null
  # console.log 26575, Isa::[ key ] for key in props.public_keys Isa::
  return null


#===========================================================================================================
@Validate = class Validate

#===========================================================================================================
@Types = class Types

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    @_compile()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _compile: ->
    proto = {}
    @isa  = Object.create proto
    debug '^_compile@1^', @isa?.constructor?.name ? '????????????????????????????????????'
    @_isa_methods = []
    for type in props.public_keys Isa::
      method        = Isa::[ type ]
      continue unless isa_function method
      method        = method.bind @
      # if type is 'codepointid'
      #   debug '^_compile@2^', method 'xxx'
      #   debug '^_compile@2^', method ''
      #   debug '^_compile@2^', method 2
      otype           = "optional_#{type}"
      proto[ type   ] = method
      proto[ otype  ] = do ( type, method ) =>
        props.nameit "isa_#{otype}", ( x ) => ( not x? ) or ( method x )
      continue if type in [ 'nothing', 'something', 'anything', ]
      # continue if type.startsWith 'optional_'
      @_isa_methods.push [ type, method, ]
    return null

  #---------------------------------------------------------------------------------------------------------
  type_of: ( x ) ->
    for [ type, isa_method, ] in @_isa_methods
      return type if isa_method x
    # debug '^Types::type_of@1^', @get_denicola_device_name x
    return type.toLowerCase() unless ( type = @get_denicola_device_name x ) is '0'
    ### TAINT return class name? ###
    ### TAINT raise exception? ###
    return 'something'

  #---------------------------------------------------------------------------------------------------------
  get_miller_device_name:   ( x ) -> R = Object::toString.call x; R[ 8 ... R.length - 1 ]
  get_denicola_device_name: ( x ) -> x?.constructor.name ? '0'

  #---------------------------------------------------------------------------------------------------------
  get_carter_device_name: ( x, miller_device_name = null ) ->
    miller_device_name ?= Object::toString.call x
    return 'other'  unless miller_device_name in [ '[object Function]', 'Function', ]
    return 'fn'     unless ( descriptor = Object.getOwnPropertyDescriptor x, 'prototype' )?
    return 'fn'     if descriptor.writable
    return 'class'

  #---------------------------------------------------------------------------------------------------------
  get_type_signature: ( x ) -> [
    ( typeof                    x                   )
    ( @get_miller_device_name   x                   )
    ( @get_denicola_device_name x                   )
    ( @get_carter_device_name   x                   )
    ( if Number.isNaN           x then 'N' else '0' ) ].join '/'


#===========================================================================================================
module.exports          = new Types()
module.exports.Types    = Types
module.exports.Isa      = Isa
module.exports.Validate = Validate

