

'use strict'

#===========================================================================================================
props                     = null
{ debug }                 = console
#-----------------------------------------------------------------------------------------------------------
isa_function              = ( x ) -> ( Object::toString.call x ) is '[object Function]'
isa_class                 = ( x ) ->
  ( ( Object::toString.call x ) is '[object Function]' ) and \
    ( Object.getOwnPropertyDescriptor x, 'prototype' )?.writable is false


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
  text:          ( x ) -> ( typeof x ) is 'string'
  codepoint:     ( x ) -> ( @isa.text x ) and ( /^.$/u.test x )
  regex:         ( x ) -> ( Object::toString.call x ) is '[object RegExp]'
  buffer:        ( x ) -> ( globalThis.Buffer?.isBuffer ? -> false ) x

  #---------------------------------------------------------------------------------------------------------
  ### thx to https://github.com/mathiasbynens/mothereff.in/blob/master/js-variables/eff.js and
  https://mathiasbynens.be/notes/javascript-identifiers-es6 ###
  jsidentifier:  ( x ) -> ( @isa.text x ) and ( x.match \
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
  codepointid:   ( x ) -> ( @isa.integer x ) and ( 0x00000 <= x <= 0x1ffff )
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
  class:          ( x ) -> isa_class x

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
  props ?= require './props'
  for key in props.public_keys Isa::
    continue unless isa_function ( f = Isa::[ key ] )
    # do ( f ) =>
    props.nameit "isa_#{key}", f
      # return null
  # console.log 26575, Isa::[ key ] for key in props.public_keys Isa::
  return null


#===========================================================================================================
@Types = class Types

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    @_compile()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _walk_keys_and_methods: ( x ) ->
    ### Iterate over enumerable `[ key, method, ]` pairs of `x` and its prototypes. The iteration will start
    with `x.prototype` ) `x::` if `x` is a class and with `x` itself otherwise. ###
    props  ?= require './props'
    top     = if isa_class x then ( x:: ) else x
    for key in props.public_keys top
      method = top[ key ]
      continue unless isa_function method
      yield [ key, method, ]
    return null

  #---------------------------------------------------------------------------------------------------------
  _create_declaration_proxy: ( declare ) ->
    types = @
    return new Proxy declare,
      get: ( target, key, receiver ) =>
        return target[ key ] if ( typeof key ) isnt 'string'
        debug '^_create_declaration_proxy/Proxy/get@1^', { key, }, @isa[ key ]
        # return target[ key ] if Reflect.has target, key
        # return target[ key ] if key.startsWith '_'
        # if Reflect.has target, '__get_handler'
        #   ast = if ( Reflect.has target, '__parser' ) then target.__parser.parse key else null
        #   if ( R = target.__get_handler key, ast )?
        #     R = target.__nameit '###' + key, R
        #     GUY.props.hide target, key, R
        #     return R
        # throw new E.Unknown_accessor '^Intervoke_proxy/proxy.get@1^', key
        return ( dcl ) ->
          debug '^proxied-getter^', { dcl, }
          types._declare dcl
          return null

  #---------------------------------------------------------------------------------------------------------
  _declare: ( dcl ) ->
    debug '^Types::_declare@1^', { dcl, }
    return null

  #---------------------------------------------------------------------------------------------------------
  _compile: ->
    ### TAINT use `_declare()` where appropriate ###
    props        ?= require './props'
    proto_isa     = {}
    proto_vld     = {}
    @isa          = Object.create proto_isa
    @validate     = Object.create proto_vld
    @declare      = @_create_declaration_proxy {}
    props.hide @, '_isa_methods', []
    #.......................................................................................................
    for [ type, method, ] from @_walk_keys_and_methods Isa
      method              = method.bind @
      otype               = "optional_#{type}"
      proto_isa[ type   ] = method
      #.....................................................................................................
      do ( type, otype, method ) =>
        #...................................................................................................
        # isa_optional_$type
        proto_isa[ otype  ] = props.nameit "isa_#{otype}", ( x ) =>
          return ( not x? ) or ( method x )
        #...................................................................................................
        # validate_$type
        proto_vld[ type   ] = props.nameit "validate_#{type}", ( x ) =>
          return true if ( method x )
          throw new Error "expected a #{type} got a #{@type_of x}"
        #...................................................................................................
        # validate_optional_$type
        proto_vld[ otype  ] = props.nameit "validate_#{otype}", ( x ) =>
          return true if ( not x? ) or ( method x )
          throw new Error "expected an #{otype} got a #{@type_of x}"
      #.....................................................................................................
      continue if type in [ 'nothing', 'something', 'anything', ]
      @_isa_methods.push [ type, method, ]
    #.......................................................................................................
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

