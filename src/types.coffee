

'use strict'

#===========================================================================================================
props                     = null
{ debug }                 = console


#===========================================================================================================
class Isa

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
  zero:          ( x ) -> x is 0 ### NOTE true for -0 as well ###
  nan:           ( x ) -> Number.isNaN x
  nonzero:       ( x ) -> ( @isa.numeric x ) and ( not @isa.zero x )

  #---------------------------------------------------------------------------------------------------------
  even:          ( x ) -> ( Number.isInteger x ) and ( ( x % 2 ) is   0 )
  odd:           ( x ) -> ( Number.isInteger x ) and ( ( x % 2 ) isnt 0 )

  #=========================================================================================================
  # Classes
  #---------------------------------------------------------------------------------------------------------
  class:          ( x ) ->
    ( ( Object::toString.call x ) is '[object Function]' ) and \
      ( Object.getOwnPropertyDescriptor x, 'prototype' )?.writable is false

  #=========================================================================================================
  # Other Types
  #---------------------------------------------------------------------------------------------------------
  boolean:        ( x ) -> ( x is true ) or ( x is false )
  object:         ( x ) -> x? and ( typeof x is 'object' ) and ( ( Object::toString.call x ) is '[object Object]' )
  buffer:         ( x ) -> if globalThis.Buffer? then Buffer.isBuffer x else false
  function:       ( x ) -> ( Object::toString.call x ) is '[object Function]'
  asyncfunction:  ( x ) -> ( Object::toString.call x ) is '[object AsyncFunction]'
  symbol:         ( x ) -> ( typeof x ) is 'symbol'
  keyowner:       ( x ) -> return true for _ of x ? {}; return false

  #=========================================================================================================
  # Existential Types
  #---------------------------------------------------------------------------------------------------------
  nothing:        ( x ) -> not x?
  something:      ( x ) -> x?
  anything:       ( x ) -> true

  #=========================================================================================================
  # Declaration Types
  #---------------------------------------------------------------------------------------------------------
  $type_declaration: ( x ) ->
    ( @isa.$known_type_name x ) or \
    ( @isa.$type_declaration_function x ) or \
    ( @isa.$type_declaration_object x )

  #---------------------------------------------------------------------------------------------------------
  $type_declaration_function: ( x ) -> ( @isa.function x ) and ( x.length is 1 )
  $known_type_name: ( x ) -> ( @isa.jsidentifier x ) and ( @isa.$type_declaration_function @isa[ x ] )

  #---------------------------------------------------------------------------------------------------------
  $type_declaration_object: ( x ) ->
    return false unless ( @isa.object x )
    for k, v of x
      return false unless @isa.jsidentifier k
      return false unless @isa.$type_declaration x
    return true

  #---------------------------------------------------------------------------------------------------------
  ### NOTE to be rewitten in object style ###
  $type_declaration_object: ( x ) ->
    return false unless @isa.keyowner                             x
    return false unless @isa.optional_$type_declaration_function  x.isa
    return false unless @isa.optional_$type_declaration_function  x.create
    return false unless @isa.optional_$type_declaration_object    x.fields
    return false unless @isa.optional_$type_declaration_template  x.template
    return false unless @isa.optional_function                    x.cast
    return true


#===========================================================================================================
defaults                  = Object.freeze
  types_cfg:
    declarations: Isa::


#===========================================================================================================
class _Types

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    cfg = { defaults.types_cfg..., cfg..., }
    @_collect_and_generate_declarations cfg.declarations
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _isa_optional: ( key, type, x ) -> ( not x? ) or ( @isa[ type ] x )

  #---------------------------------------------------------------------------------------------------------
  _validate: ( key, type, x ) ->
    # debug '^_Types::_validate@1^', "#{key} #{type} #{x}"
    return x if ( @isa[ type ] x )
    ### TAINT put message into a resource object? ###
    throw new Error "expected a #{key}, got a #{@type_of x}"

  #---------------------------------------------------------------------------------------------------------
  _validate_optional: ( key, type, x ) ->
    return x if ( not x? ) or ( @isa[ type ] x )
    ### TAINT put message into a resource object? ###
    throw new Error "expected a #{key}, got a #{@type_of x}"

  #---------------------------------------------------------------------------------------------------------
  _collect_and_generate_declarations: ( declarations ) ->
    props        ?= require './props'
    @isa          = {}
    @validate     = {}
    props.hide @, '_isa_methods', []
    me            = @
    #.......................................................................................................
    cfg =
      descriptor: { enumerable: true, }
      overwrite:  false
      # filter: ({ key, }) -> not key.startsWith '_'
      #.....................................................................................................
      generator:  ({ target, owner, key, descriptor, }) ->
        type = key
        yield { target: me.isa, key, descriptor, }
        #...................................................................................................
        # optional_$type
        yield do ( key = "optional_#{type}", type ) ->
          value       = ( x ) -> me._isa_optional key, type, x
          descriptor  = { descriptor..., value, }
          return { target: me.isa, key, descriptor, }
        #...................................................................................................
        # validate_$type
        yield do ( key = type, type ) ->
          value       = ( x ) => me._validate key, type, x
          descriptor  = { descriptor..., value, }
          return { target: me.validate, key, descriptor, }
        #...................................................................................................
        # validate_optional_$type
        yield do ( key = "optional_#{type}", type ) ->
          value       = ( x ) => me._validate_optional key, type, x
          descriptor  = { descriptor..., value, }
          return { target: me.validate, key, descriptor, }
        #...................................................................................................
        return null
      #.....................................................................................................
      decorator:  ({ target, owner, key: type, descriptor: { value, }, }) ->
        switch target
          when me.isa
            value = props.nameit "isa_#{type}", value.bind me
            unless ( type.startsWith 'optional_' ) or ( type in [ 'nothing', 'something', 'anything', ] )
              me._isa_methods.push [ type, value, ]
          when me.validate
            value = props.nameit "validate_#{type}", value.bind me
        return { value, }
    #.......................................................................................................
    props.acquire_depth_first declarations, cfg
    return null

  #---------------------------------------------------------------------------------------------------------
  type_of: ( x ) ->
    for [ type, isa_method, ] in @_isa_methods
      return type if isa_method x
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
class Types extends _Types

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super cfg
    @_transform_and_validate_declarations()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _collect_and_generate_declarations: ( declarations ) ->
    props  ?= require './props'
    props.hide @, '_types', new _Types() ### NOTE could use custom declarations ###
    declarations  = if @_types.isa.class declarations then ( declarations:: ) else ( declarations )
    return super declarations

  #---------------------------------------------------------------------------------------------------------
  _transform_and_validate_declarations: ->
    # debug '^Types::_transform_and_validate_declarations@1^'
    for k, v of @isa
      # debug '^Types::_transform_and_validate_declarations@1^', k, v
      unless ( @validate.jsidentifier k ) then null
      unless ( @validate.$type_declaration k ) then null
    return null


#===========================================================================================================
module.exports          = new Types()
module.exports.Isa      = Isa
module.exports.Types    = Types

