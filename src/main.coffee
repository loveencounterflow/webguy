
'use strict'




#===========================================================================================================
class Guy

  #---------------------------------------------------------------------------------------------------------
  # constructor: ( target = null ) ->
  constructor: ( @cfg = null ) ->
    #.......................................................................................................
    # props.def_oneoff @, 'watch',    { enumerable: true, }, -> require './watch'
    return undefined

  #---------------------------------------------------------------------------------------------------------
  props:        require './props'
  time:         require './time'
  environment:  require './environment'
  trm:          require './trm'


#===========================================================================================================
module.exports = new Guy()




