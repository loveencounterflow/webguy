

'use strict'

#===========================================================================================================
WG                        = require './main'
{ rpr }                   = WG.trm
{ log }                   = console
FS                        = require 'fs'
PATH                      = require 'path'

log __filename
path = PATH.resolve PATH.join __dirname, '../README-types.md'
log path
readme = FS.readFileSync path, { encoding: 'utf-8', }

for match from readme.matchAll /^#### `([^`]+)`/ugs
                                 #### `function`
  log match


