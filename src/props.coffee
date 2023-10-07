

'use strict'

#===========================================================================================================
{ rpr   }                 = require './trm'
{ debug }                 = console


#===========================================================================================================
templates =
  acquire_depth_first:
    target:     null
    filter:     null
    generate:   ( x ) -> yield from [ x, ] ### 'generative identity element' ###
    decorator:  null
    descriptor: null
    overwrite:  false


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
    for key, descriptor of Object.getOwnPropertyDescriptors owner
      continue if key is 'constructor'
      yield { owner, key, descriptor, }
  return null

#-----------------------------------------------------------------------------------------------------------
@acquire_depth_first = ( source, cfg ) ->
  cfg   = { templates.acquire_depth_first..., cfg..., }
  R     = cfg.target ? {}
  seen  = new Set()
  for { owner, key, descriptor, } from @walk_depth_first_property_descriptors source
    if cfg.filter? then continue unless cfg.filter key
    if seen.has key
      switch cfg.overwrite
        when 'ignore' then continue
        when true then null
        when false
          throw new Error "^props.acquire_depth_first@1^ duplicate key #{rpr key} disallowed " + \
            "because `overwrite` set to `false`"
        else
          throw new Error "^props.acquire_depth_first@2^ illegal value for `overwrite` " + \
            "#{rpr cfg.overwrite}; expected one of `true`, `false`, `'ignore'`"
    seen.add key
    for g from cfg.generate { owner, key, descriptor, }
      Object.assign g.descriptor, cfg.descriptor            if cfg.descriptor?
      g.descriptor.value = cfg.decorator g.descriptor.value if cfg.decorator?
      Object.defineProperty R, g.key, g.descriptor
  return R
