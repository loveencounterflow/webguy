

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
  text:           ( x ) -> ( typeof x ) is 'string'
  chr:            ( x ) -> ( @isa.text x ) and      ( /// ^  .  $ ///us.test x )
  blank_text:     ( x ) -> ( @isa.text x ) and      ( /// ^ \s* $ ///us.test x )
  nonblank_text:  ( x ) -> ( @isa.text x ) and not  ( /// ^ \s* $ ///us.test x )
  # codepoint:      ( x ) -> ( @isa.text x ) and      ( /^.$/u.test x )
  int2text:       ( x ) => ( @isa.text x ) and ( x.match /^[01]+$/ )?
  int10text:      ( x ) => ( @isa.text x ) and ( x.match /^[0-9]+$/ )?
  int16text:      ( x ) => ( @isa.text x ) and ( x.match /^[0-9a-fA-F]+$/ )?
  regex:          ( x ) -> ( Object::toString.call x ) is '[object RegExp]'
  buffer:         ( x ) -> ( globalThis.Buffer?.isBuffer ? -> false ) x

  #---------------------------------------------------------------------------------------------------------
  arraybuffer:        ( x ) => ( Object::toString.call x ) is '[object ArrayBuffer]'
  int8array:          ( x ) => ( Object::toString.call x ) is '[object Int8Array]'
  uint8array:         ( x ) => ( Object::toString.call x ) is '[object Uint8Array]'
  uint8clampedarray:  ( x ) => ( Object::toString.call x ) is '[object Uint8ClampedArray]'
  int16array:         ( x ) => ( Object::toString.call x ) is '[object Int16Array]'
  uint16array:        ( x ) => ( Object::toString.call x ) is '[object Uint16Array]'
  int32array:         ( x ) => ( Object::toString.call x ) is '[object Int32Array]'
  uint32array:        ( x ) => ( Object::toString.call x ) is '[object Uint32Array]'
  float32array:       ( x ) => ( Object::toString.call x ) is '[object Float32Array]'
  float64array:       ( x ) => ( Object::toString.call x ) is '[object Float64Array]'

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
  infinity:       ( x ) -> ( x is +Infinity ) or ( x is -Infinity )
  float:          ( x ) -> Number.isFinite x
  infinitefloat:  ( x ) => ( @isa.float x ) or ( x is Infinity ) or ( x is -Infinity )
  int32:          ( x ) -> ( @isa.integer x ) and ( -2147483648 <= x <= 2147483647 )
  numeric:        ( x ) -> ( Number.isFinite x ) or ( typeof x is 'bigint' )
  bigint:         ( x ) -> typeof x is 'bigint'
  integer:        ( x ) -> Number.isInteger x
  safeinteger:    ( x ) => Number.isSafeInteger x
  codepointid:    ( x ) -> ( @isa.integer x ) and ( 0x00000 <= x <= 0x1ffff )
  cardinal:       ( x ) -> ( Number.isInteger x ) and ( x >= 0 )
  zero:           ( x ) -> x is 0 ### NOTE true for -0 as well ###
  nan:            ( x ) -> Number.isNaN x
  nonzero:        ( x ) -> ( @isa.numeric x ) and ( not @isa.zero x )

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
  date:           ( x ) => ( Object::toString.call x ) is '[object Date]'
  boolean:        ( x ) -> ( x is true ) or ( x is false )
  true:           ( x ) -> x is true
  false:          ( x ) -> x is false
  object:         ( x ) -> x? and ( typeof x is 'object' ) and ( ( Object::toString.call x ) is '[object Object]' )
  buffer:         ( x ) -> if globalThis.Buffer? then Buffer.isBuffer x else false
  symbol:         ( x ) -> ( typeof x ) is 'symbol'
  error:          ( x ) -> ( Object::toString.call x ) is 'error'
  global:         ( x ) -> x is globalThis
  #---------------------------------------------------------------------------------------------------------
  function:               ( x ) -> ( Object::toString.call x ) is '[object Function]'
  asyncfunction:          ( x ) -> ( Object::toString.call x ) is '[object AsyncFunction]'
  generatorfunction:      ( x ) => ( Object::toString.call x ) is 'generatorfunction'
  asyncgeneratorfunction: ( x ) => ( Object::toString.call x ) is 'asyncgeneratorfunction'
  asyncgenerator:         ( x ) => ( Object::toString.call x ) is 'asyncgenerator'
  generator:              ( x ) => ( Object::toString.call x ) is 'generator'
  #---------------------------------------------------------------------------------------------------------
  listiterator:           ( x ) => ( Object::toString.call x ) is '[object ArrayIterator]'
  textiterator:           ( x ) => ( Object::toString.call x ) is '[object StringIterator]'
  setiterator:            ( x ) => ( Object::toString.call x ) is '[object SetIterator]'
  mapiterator:            ( x ) => ( Object::toString.call x ) is '[object MapIterator]'

  #=========================================================================================================
  # Generics and Qualified Types
  #---------------------------------------------------------------------------------------------------------
  ### Almost anything in JS can be a `keyowner` (i.e. have one or more enumerable properties attached to it)
  so we test for this late in the chain: ###
  keyowner:               ( x ) -> return true for _ of x ? {}; return false
  frozen:                 ( x ) => Object.isFrozen      x
  sealed:                 ( x ) => Object.isSealed      x
  extensible:             ( x ) => Object.isExtensible  x
  ### These qualified types should never be returned by `type_of()`: ###
  empty_list:             ( x ) => ( @isa.list    x ) and ( x.length is 0 )
  empty_text:             ( x ) => ( @isa.text    x ) and ( x.length is 0 )
  empty_map:              ( x ) => ( @isa.map     x ) and ( x.size   is 0 )
  empty_set:              ( x ) => ( @isa.set     x ) and ( x.size   is 0 )
  empty_object:           ( x ) => ( @isa.object  x ) and ( not @isa.keyowner x )
  ### Generic types: ###
  truthy:                 ( x ) -> not not x
  falsy:                  ( x ) ->     not x

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
  $type_declaration_fields_object: ( x ) ->
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
class _Intertype

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    cfg = { defaults.types_cfg..., cfg..., }
    @_collect_and_generate_declarations cfg.declarations
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _isa_optional: ( key, type, x ) -> ( not x? ) or ( @isa[ type ] x )

  #---------------------------------------------------------------------------------------------------------
  _validate: ( key, type, x ) ->
    # debug '^_Intertype::_validate@1^', "#{key} #{type} #{x}"
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
            unless \
                ( type.startsWith 'optional_'                     ) or \
                ( type.startsWith '$'                             ) or \
                ( type in [ 'nothing', 'something', 'anything', ] )
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
class Intertype extends _Intertype

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super cfg
    @_transform_and_validate_declarations()
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _collect_and_generate_declarations: ( declarations ) ->
    props  ?= require './props'
    props.hide @, '_types', new _Intertype() ### NOTE could use custom declarations ###
    declarations  = if @_types.isa.class declarations then ( declarations:: ) else ( declarations )
    return super declarations

  #---------------------------------------------------------------------------------------------------------
  _transform_and_validate_declarations: ->
    # debug '^Intertype::_transform_and_validate_declarations@1^'
    for k, v of @isa
      # debug '^Intertype::_transform_and_validate_declarations@1^', k, v
      unless ( @validate.jsidentifier k ) then null
      unless ( @validate.$type_declaration k ) then null
    return null


#===========================================================================================================
module.exports            = new Intertype()
module.exports.Isa        = Isa
module.exports.Intertype  = Intertype

