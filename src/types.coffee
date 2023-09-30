

'use strict'

#===========================================================================================================
props                     = require './props'
isa_function              = ( x ) -> ( Object::toString.call x ) is '[object Function]'
{ debug }                 = console


#===========================================================================================================
class Isa

  #=========================================================================================================
  # Bottom Types
  #---------------------------------------------------------------------------------------------------------
  null:          ( x ) -> x is null
  undefined:     ( x ) -> x is undefined


  #=========================================================================================================
  # Existential Types
  #---------------------------------------------------------------------------------------------------------
  anything:      ( x ) -> true
  something:     ( x ) -> x?
  nothing:       ( x ) -> not x?


  #=========================================================================================================
  # Textual Types
  #---------------------------------------------------------------------------------------------------------
  text:          ( x ) -> ( typeof x ) is 'string'
  codepoint:     ( x ) -> ( ( typeof x ) is 'string' ) and /^.$/u.test x
  codepointid:   ( x ) -> ( @integer x ) and ( 0x00000 <= x <= 0x1ffff )
  regex:         ( x ) -> ( Object::toString.call x ) is '[object RegExp]'
  buffer:        ( x ) -> ( globalThis.Buffer?.isBuffer ? -> false ) x

  #---------------------------------------------------------------------------------------------------------
  ### thx to https://github.com/mathiasbynens/mothereff.in/blob/master/js-variables/eff.js and
  https://mathiasbynens.be/notes/javascript-identifiers-es6 ###
  jsidentifier:  ( x ) ->
    return false unless @text x
    return ( x.match \
      /// ^ (?: [ $_ ] | \p{ID_Start} ) (?: [ $ _ \u{200c} \u{200d} ] | \p{ID_Continue} )* $ ///u )?


  #=========================================================================================================
  # Container Types
  #---------------------------------------------------------------------------------------------------------
  list:       ( x ) -> Array.isArray x
  set:        ( x ) -> x instanceof Set
  map:        ( x ) -> x instanceof Map
  sized:      ( x ) -> try ( ( Reflect.has x, 'length' ) or ( Reflect.has x, 'size' ) ) catch error then false

  # container:  ( x ) -> ( typeof x ) isnt 'string' and ( @iterable x ) and ( @sized x )
  # iterable:   ( x ) -> ( ( typeof x ) is 'string' ) and try ( Reflect.has Symbol.iterator ) catch error then false

  #=========================================================================================================
  # Numeric Types
  #---------------------------------------------------------------------------------------------------------
  numeric:       ( x ) -> ( Number.isFinite x ) or ( typeof x is 'bigint' )
  float:         ( x ) -> Number.isFinite x
  bigint:        ( x ) -> typeof x is 'bigint'
  integer:       ( x ) -> Number.isInteger x
  cardinal:      ( x ) -> ( Number.isInteger x ) and ( x >= 0 )
  zero:          ( x ) -> ( x is 0 ) or ( x is 0n ) ### NOTE true for -0 as well ###
  nan:           ( x ) -> Number.isNaN x

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
  # Other Types
  #---------------------------------------------------------------------------------------------------------
  boolean:       ( x ) -> ( x is true ) or ( x is false )
  object:        ( x ) -> x? and ( typeof x is 'object' ) and ( ( Object::toString.call x ) is '[object Object]' )
  function:      ( x ) -> isa_function x
  asyncfunction: ( x ) -> ( Object::toString.call x ) is '[object AsyncFunction]'
  symbol:        ( x ) -> ( typeof x ) is 'symbol'

  #---------------------------------------------------------------------------------------------------------
  class:         ( x ) ->
    ( ( Object::toString.call x ) is '[object Function]' ) and \
      ( Object.getOwnPropertyDescriptor x, 'prototype' )?.writable is false

#===========================================================================================================
do rename_isa_methods = =>
  for key in props.public_keys Isa::
    continue unless isa_function ( f = Isa::[ key ] )
    do ( f ) =>
      props.nameit "isa_#{key}", f
      ### TAINT `isa` methods should be called in the context of their `types` instance ###
      Isa::[ "optional_#{key}" ] = props.nameit "isa_optional_#{key}", ( x ) -> ( not x? ) or ( f.call @, x )
      return null
  # console.log 26575, Isa::[ key ] for key in props.public_keys Isa::
  return null


#===========================================================================================================
class Validate extends Isa

  #---------------------------------------------------------------------------------------------------------
  clasz = @

  #---------------------------------------------------------------------------------------------------------
  @create_proxy: ( x ) -> new Proxy x,
    get: ( target, key, receiver ) =>
      return target[ accessor ] if Reflect.has target, accessor
      return target[ accessor ] if ( typeof accessor ) isnt 'string'
      return target[ accessor ] if accessor.startsWith '_'
      if Reflect.has target, '__get_handler'
        ast = if ( Reflect.has target, '__parser' ) then target.__parser.parse accessor else null
        if ( R = target.__get_handler accessor, ast )?
          R = target.__nameit '###' + accessor, R
          GUY.props.hide target, accessor, R
          return R
      throw new E.Unknown_accessor '^Intervoke_proxy/proxy.get@1^', accessor

  #---------------------------------------------------------------------------------------------------------
  # constructor: -> clasz.create_proxy @

#===========================================================================================================
class Types

  #---------------------------------------------------------------------------------------------------------
  clasz = @

  # #---------------------------------------------------------------------------------------------------------
  # @create_proxy: ( x ) -> new Proxy x,
  #   get: ( target, key, receiver ) =>
  #     return target[ accessor ] if Reflect.has target, accessor
  #     return target[ accessor ] if ( typeof accessor ) isnt 'string'
  #     return target[ accessor ] if accessor.startsWith '_'
  #     if Reflect.has target, '__get_handler'
  #       ast = if ( Reflect.has target, '__parser' ) then target.__parser.parse accessor else null
  #       if ( R = target.__get_handler accessor, ast )?
  #         R = target.__nameit '###' + accessor, R
  #         GUY.props.hide target, accessor, R
  #         return R
  #     throw new E.Unknown_accessor '^Intervoke_proxy/proxy.get@1^', accessor

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    @isa = new Isa()

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
do =>
  module.exports =
    Isa:        Isa
    Validate:   Validate
    Types:      Types
    isa:        new Isa()
    validate:   new Validate()
    types:      new Types()

