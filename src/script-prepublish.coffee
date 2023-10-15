

'use strict'

#===========================================================================================================
WG                        = require './main'
{ rpr }                   = WG.trm
{ log }                   = console
FS                        = require 'fs'
PATH                      = require 'path'

#===========================================================================================================
path                = PATH.resolve PATH.join __dirname, '../README-types.md'
readme              = FS.readFileSync path, { encoding: 'utf-8', }
documented_types    = ( m[ 1 ] for m from readme.matchAll /\n#### `([^`]+)`/ugs )
implemented_types   = ( type for type of ( require './types' ).isa )
implemented_types   = ( type for type in implemented_types when not type.startsWith 'optional_' )
implemented_types   = ( type for type in implemented_types when not type.startsWith '$' )
undocumented_types  = ( type for type in implemented_types when type not in documented_types )

#===========================================================================================================
# log documented_types
# log implemented_types
if undocumented_types.length > 0
  log '==========================================================='
  log __filename
  log "Undocumented types:"
  log '==========================================================='
  log undocumented_types.join ', '
  log '==========================================================='

