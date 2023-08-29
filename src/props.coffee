

'use strict'


#-----------------------------------------------------------------------------------------------------------
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

