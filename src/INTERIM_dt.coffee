

'use strict'


############################################################################################################
### https://day.js.org ###
@_dayjs                             = require 'dayjs'
@_timestamp_input_template          = 'YYYYMMDD-HHmmssZ'
@_timestamp_output_template         = 'YYYYMMDD-HHmmss[Z]'
defaults                            = {}

#===========================================================================================================
do =>
  utc               = require 'dayjs/plugin/utc';               @_dayjs.extend utc
  relativeTime      = require 'dayjs/plugin/relativeTime';      @_dayjs.extend relativeTime
  toObject          = require 'dayjs/plugin/toObject';          @_dayjs.extend toObject
  customParseFormat = require 'dayjs/plugin/customParseFormat'; @_dayjs.extend customParseFormat
  duration          = require 'dayjs/plugin/duration';          @_dayjs.extend duration

#===========================================================================================================
# H.types.declare 'guy_dt_valid_dayjs', tests:
#   "( @type_of x ) is 'm'":  ( x ) -> ( @type_of x ) is 'm'
#   "@isa.float x.$y":        ( x ) -> @isa.float x.$y
#   "@isa.float x.$M":        ( x ) -> @isa.float x.$M
#   "@isa.float x.$D":        ( x ) -> @isa.float x.$D
#   "@isa.float x.$W":        ( x ) -> @isa.float x.$W
#   "@isa.float x.$H":        ( x ) -> @isa.float x.$H
#   "@isa.float x.$m":        ( x ) -> @isa.float x.$m
#   "@isa.float x.$s":        ( x ) -> @isa.float x.$s
#   "@isa.float x.$ms":       ( x ) -> @isa.float x.$ms

# #-----------------------------------------------------------------------------------------------------------
# H.types.declare 'guy_dt_timestamp', tests:
#   "@isa.text x":                    ( x ) -> @isa.text x
#   "( /^\\d{8}-\\d{6}Z$/ ).test x":  ( x ) -> ( /^\d{8}-\d{6}Z$/ ).test x
@_isa_guy_dt_timestamp = ( x ) -> ( typeof x is 'string' ) and ( /^\d{8}-\d{6}Z$/ ).test x

# #-----------------------------------------------------------------------------------------------------------
# H.types.declare 'guy_dt_now_cfg', tests:
#   "@isa.object x":                    ( x ) -> @isa.object x
defaults.guy_dt_now_cfg =
    subtract:       null
    add:            null


#===========================================================================================================
# DATETIME
#-----------------------------------------------------------------------------------------------------------
@from_now = ( srts ) ->
  return ( @parse srts ).fromNow()

#-----------------------------------------------------------------------------------------------------------
@now = ( cfg ) ->
  # H.types.validate.guy_dt_now_cfg ( cfg = { defaults.guy_dt_now_cfg..., cfg..., } )
  cfg = { defaults.guy_dt_now_cfg..., cfg..., }
  R = @_dayjs().utc()
  R = R.subtract cfg.subtract...  if cfg.subtract?
  R = R.add      cfg.add...       if cfg.add?
  return R.format @_timestamp_output_template

#-----------------------------------------------------------------------------------------------------------
@srts_from_isots = ( isots ) -> ( @_dayjs isots ).utc().format @_timestamp_output_template

#-----------------------------------------------------------------------------------------------------------
@parse = ( srts ) ->
  # H.types.validate.guy_dt_timestamp srts
  R = ( @_dayjs srts, @_timestamp_input_template ).utc()
  console.log '^5353^', R
  throw new Error "^guy.datetime.dt_parse@1^ not a valid SRTS: #{srts}" unless @_isa_guy_dt_timestamp R
  return R

#-----------------------------------------------------------------------------------------------------------
@format = ( srts, P... ) ->
  R = @parse srts
  return R.format P...

#-----------------------------------------------------------------------------------------------------------
@isots_from_srts = ( srts ) -> ( @parse srts ).format()



