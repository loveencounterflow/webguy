

'use strict'


#-----------------------------------------------------------------------------------------------------------
@_excluded_public_keys = Object.freeze [ 'constructor', ]

#-----------------------------------------------------------------------------------------------------------
@public_keys = ( owner ) ->
  ### thx to https://stackoverflow.com/a/8024294/7568091 ###
  return [] unless owner?
  R = new Set()
  loop
    for name in Object.getOwnPropertyNames owner
      continue if ( typeof name ) is 'symbol'
      continue if name in @_excluded_public_keys
      continue if name.startsWith '_'
      R.add name
    owner = Object.getPrototypeOf owner
    break unless owner?
    break if owner is Object::
  return [ R..., ];

