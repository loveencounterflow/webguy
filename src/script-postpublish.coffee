

'use strict'

#===========================================================================================================
WG                        = require './main'
{ rpr }                   = WG.trm
{ log }                   = console
PATH                      = require 'node:path'
FS                        = require 'node:fs'

log '==========================================================='
log __filename
log "Updating WebGuy version in InterType"
log '==========================================================='
webguy_pkgjson                        = require '../package.json'
intertype_pkgjson_path                = PATH.resolve PATH.join __dirname, '../../intertype-banzai/package.json'
intertype_pkgjson                     = require intertype_pkgjson_path
intertype_pkgjson.dependencies       ?= {}
intertype_pkgjson.dependencies.webguy = "^#{webguy_pkgjson.version}"
intertype_pkgjson_text                = JSON.stringify intertype_pkgjson, null, '  '
FS.writeFileSync intertype_pkgjson_path, intertype_pkgjson_text
log "InterType dependencies:"
log intertype_pkgjson.dependencies

f = ->
  { $: zx, cd, }       = await import( 'zx' )
  cd '../intertype-banzai'
  # await zx"pwd"
  # await zx"git status -sb"
  await zx"git add package.json"
  try await zx"git commit -m'bumped webguy version'" catch error
    rpr error.message
  await zx"git push"
  # log '^543-6^', await zx"ls ."
  # log '^543-7^', await zx"cd ../intertype-banzai && ls ."
  return null

await f()
log '==========================================================='
log __filename
log "Done"
log '==========================================================='

