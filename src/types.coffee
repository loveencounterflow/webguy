

'use strict'


#===========================================================================================================
class Isa

  #=========================================================================================================
  # Bottom Types
  #---------------------------------------------------------------------------------------------------------
  null:          ( x ) -> x is null
  undefined:     ( x ) -> x is undefined
  bottom:        ( x ) -> ( x is undefined ) or ( x is null )


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
  codepointid:   ( x ) -> @isa.integer x and ( 0x00000 <= x <= 0x1ffff )
  regex:         ( x ) -> ( Object::toString.call x ) is '[object RegExp]'
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
  list:          ( x ) -> Array.isArray x
  set:           ( x ) -> x instanceof Set
  map:           ( x ) -> x instanceof Map
  sized:         ( x ) -> ( @size_of x, @_signals.nothing ) isnt @_signals.nothing
  iterable:      ( x ) -> x? and x[ Symbol.iterator ]?
  container:     ( x ) -> ( typeof x ) isnt 'string' and ( @iterable x ) and ( @sized x )

  #=========================================================================================================
  # Numeric Types
  #---------------------------------------------------------------------------------------------------------
  numeric:       ( x ) -> ( Number.isFinite x ) or ( typeof x is 'bigint' )
  float:         ( x ) -> Number.isFinite x
  bigint:        ( x ) -> typeof x is 'bigint'
  integer:       ( x ) -> Number.isInteger x
  cardinal:      ( x ) -> ( Number.isInteger x ) and ( x >= 0 )
  zero:          ( x ) -> x is 0 ### NOTE true for -0 as well ###
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
  function:      ( x ) -> ( Object::toString.call x ) is '[object Function]'

  #---------------------------------------------------------------------------------------------------------
  @class
    isa:        ( x ) -> ( ( Object::toString.call x ) is '[object Function]' ) and \
      ( Object.getOwnPropertyDescriptor x, 'prototype' )?.writable is false
    # template:   ->

  #---------------------------------------------------------------------------------------------------------
  @asyncfunction
    isa:        ( x ) -> ( Object::toString.call x ) is '[object AsyncFunction]'
    template:   ->

  #---------------------------------------------------------------------------------------------------------
  @symbol
    isa:        ( x ) -> ( typeof x ) is 'symbol'
    template:   Symbol ''
    create:     ( x ) -> Symbol x

  #---------------------------------------------------------------------------------------------------------
  @knowntype
    isa:        ( x ) ->
      return false unless ( @isa.text x ) and ( x.length > 0 )
      return GUY.props.has @registry, x


