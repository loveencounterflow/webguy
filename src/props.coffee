

'use strict'

#===========================================================================================================
{ debug } = console

#===========================================================================================================
templates =
  acquire_depth_first:
    target:     null
    filter:     null
    decorator:  null
    descriptor: null


#===========================================================================================================
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

#-----------------------------------------------------------------------------------------------------------
@nameit = ( name, f ) -> Object.defineProperty f, 'name', { value: name, }; f

#-----------------------------------------------------------------------------------------------------------
### TAINT code duplication with `GUY.props.hide()` ###
@hide = hide  = ( object, name, value ) => Object.defineProperty object, name,
    enumerable:   false
    writable:     true
    configurable: true
    value:        value

#-----------------------------------------------------------------------------------------------------------
### TAINT code duplication with `GUY.props.get_prototype_chain()` ###
obj_proto = Object.getPrototypeOf Object
@get_prototype_chain = ( x ) ->
  return [] unless x?
  R = [ x, ]
  loop
    break unless ( x = Object.getPrototypeOf x )?
    break if x in [ Object, Object::, obj_proto, ]
    R.push x
  return R

#-----------------------------------------------------------------------------------------------------------
@walk_depth_first_property_descriptors = ( x ) ->
  return null unless x?
  for owner in ( @get_prototype_chain x ).reverse()
    for key, dsc of Object.getOwnPropertyDescriptors owner
      continue if key is 'constructor'
      yield [ key, dsc, ]
  return null

#-----------------------------------------------------------------------------------------------------------
@acquire_depth_first = ( source, cfg ) ->
  cfg = { templates..., cfg..., }
  R   = cfg.target ? {}
  for [ key, dsc, ] from @walk_depth_first_property_descriptors source
    if cfg.filter? then continue unless cfg.filter key
    dsc.value = cfg.decorator dsc.value if cfg.decorator?
    Object.defineProperty R, key, dsc
  return R
