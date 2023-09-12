

'use strict'

#===========================================================================================================
defaults =
 count_digits:    3
 counter_joiner:  ':'
 ms_digits:       13
 ms_padder:       '0'
 format:          'milliseconds' # 'compact'

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
    return [ ( @stamp_s stamp_f ), ( count.toString().padStart @cfg.count_digits, '0' ), ]

  #---------------------------------------------------------------------------------------------------------
  monostamp_s1: ( stamp_f = null, count = null ) -> ( @monostamp_s2 stamp_f, count ).join @cfg.counter_joiner

TIME            = new Time()
TIME.Time       = Time
module.exports  = TIME
