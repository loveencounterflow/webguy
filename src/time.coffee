

'use strict'


#-----------------------------------------------------------------------------------------------------------
@stamp      = -> utc_timestamp = performance.timeOrigin + performance.now()
@stamp_text = -> @stamp().toFixed 3

#-----------------------------------------------------------------------------------------------------------
### TAINT consider to keep these memo values as `globalThis[some_symbol].last_stamp` to ensure it being
shared as widely as possible, in the not-so unlikely event that two scripts make use of two different
instances of `webguy`. ###
last_stamp        = null
last_count        = 0
@stamp_and_count  = ( count_digits = 3 ) ->
  if ( stamp = @stamp_text() ) is last_stamp
    last_count++
  else
    last_stamp  = stamp
    last_count  = 0
  return [ last_stamp, ( last_count.toString().padStart 3, '0' ), ]
