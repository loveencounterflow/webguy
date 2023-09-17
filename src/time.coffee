

'use strict'

#===========================================================================================================
_dayjs = null

#-----------------------------------------------------------------------------------------------------------
dayjs = ( P... ) =>
  unless _dayjs?
    _dayjs            = require 'dayjs'
    utc               = require 'dayjs/plugin/utc';               _dayjs.extend utc
    # relativeTime      = require 'dayjs/plugin/relativeTime';      _dayjs.extend relativeTime
    # toObject          = require 'dayjs/plugin/toObject';          _dayjs.extend toObject
    # customParseFormat = require 'dayjs/plugin/customParseFormat'; _dayjs.extend customParseFormat
    # duration          = require 'dayjs/plugin/duration';          _dayjs.extend duration
  return _dayjs P...

#===========================================================================================================
defaults =
  ### TAINT validate that count_digits > 0 ###
  count_digits:    3
  counter_joiner:  ':'
  ms_digits:       13
  ms_padder:       '0'
  format:          'iso'

#-----------------------------------------------------------------------------------------------------------
constants =
  ms_decimals:    3

#-----------------------------------------------------------------------------------------------------------
### TAINT consider to keep these memo values as `globalThis[some_symbol].last_stamp_f` to ensure it being
shared as widely as possible, in the not-so unlikely event that two scripts make use of two different
instances of `webguy`. ###
memo =
  last_stamp_f: null
  last_count:   0

#===========================================================================================================
class Time

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    cfg               = { defaults..., cfg..., }
    cfg.ms_padlength  = cfg.ms_digits + constants.ms_decimals + 1
    @cfg              = Object.freeze cfg
    return undefined

  #---------------------------------------------------------------------------------------------------------
  stamp_f:                    -> utc_timestamp = performance.timeOrigin + performance.now()
  stamp_s: ( stamp_f = null ) -> (
    ( stamp_f ? @stamp_f() ).toFixed constants.ms_decimals ).padStart @cfg.ms_padlength, @cfg.ms_padder

  #---------------------------------------------------------------------------------------------------------
  monostamp_f2: ->
    if ( stamp_f = @stamp_f() ) is memo.last_stamp_f
      memo.last_count++
    else
      memo.last_stamp_f = stamp_f
      memo.last_count   = 0
    return [ memo.last_stamp_f, memo.last_count, ]

  #---------------------------------------------------------------------------------------------------------
  monostamp_s2: ( stamp_f = null, count = null ) ->
    if stamp_f?
      count ?= 0
    else
      [ stamp_f, count, ] = @monostamp_f2()
    count_s = count.toString().padStart @cfg.count_digits, '0'
    switch @cfg.format
      when 'milliseconds'
        return [ ( @stamp_s stamp_f ), count_s, ]
      else
        stamp_decimals  = stamp_f.toFixed constants.ms_decimals
        stamp_decimals  = stamp_decimals.replace /^.*([0-9]{3})\.([0-9]+)/, '$1$2'
        switch @cfg.format
          when 'iso'
            stamp_s         = ( new Date stamp_f ).toISOString()
            stamp_s         = stamp_s.replace /...Z/, "#{stamp_decimals}Z"
          when 'compact'
            stamp_s         = ( dayjs stamp_f ).utc().format 'YYYYMMDDHHmmssµ'
            stamp_s         = stamp_s.replace /µ/g, "#{stamp_decimals}"
          else
            stamp_s         = ( dayjs stamp_f ).utc().format @cfg.format
            stamp_s         = stamp_s.replace /µ/g, "#{stamp_decimals}"
        return [ stamp_s, count_s, ]
    throw new Error "unknown format #{@cfg.format}"


  #---------------------------------------------------------------------------------------------------------
  monostamp_s1: ( stamp_f = null, count = null  ) -> ( @monostamp_s2 stamp_f, count ).join @cfg.counter_joiner
  stamp:        ( P...                          ) -> @monostamp_s1 P...


#===========================================================================================================
TIME            = new Time()
TIME.Time       = Time
module.exports  = TIME
