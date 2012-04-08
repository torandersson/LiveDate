(function( $ ){
  var elements = [];

  var dateComparer = {

    //Milliseconds
    hour : 3600000,
    minute : 60000,
    second : 1000,
    day : 86400000,
    

    getTotalDiff : function(d1,d2) {     
      var result = {},
          future = false,
          diff = d1 - d2;

      if(diff < 0){
        future = true;
        diff *= -1;
      }

      result.days = parseInt(diff/dateComparer.day);
      result.hours = parseInt(diff/dateComparer.hour);
      result.minutes = parseInt(diff/dateComparer.minute);
      result.seconds = parseInt(diff/dateComparer.second);
      result.milliseconds = parseInt(diff);
      result.future = future;

      return result;
    },

    getGreedyDiff : function(d1,d2) {   
      var diff = d1 - d2,
          result = {},
          future = false;

      if(diff < 0){
        future = true;
        diff *= -1;
      }

      result.days = parseInt(diff/dateComparer.day);
      diff = diff % dateComparer.day;
      result.hours = parseInt(diff/dateComparer.hour);
      diff = diff % dateComparer.hour;
      result.minutes = parseInt(diff/dateComparer.minute);
      diff = diff % dateComparer.minute;  
      result.seconds = parseInt(diff/dateComparer.second);
      diff = diff % dateComparer.second;
      result.milliseconds = diff;
      result.future = future;

      return result; 
    }
  };

  var timer = {
    callbacks : {},

    init : function(interval) {
      this.interval= interval || 500; // ms
    },

    domReady : function() {
      var closure = this.bind(this.step);
      setInterval(closure, this.interval);
    },

    bind : function(method) {
      var _this = this;
      return(
        function(){
          return( method.apply( _this, arguments ) );
        }
      );
    },

    register : function(callback) {
      this.callbacks[callback] = callback;
    },

    remove : function(callback) {
      delete this.callbacks[callback];
    },

    step: function(){
      for(var id in this.callbacks){
          this.callbacks[id].apply(this,arguments);
      }
    }
  };

  var methods = {
    init : function( options ) { 
      
      var that = this;
      

      var settings = $.extend( {
        'mode' : 'default',
        'interval': 500
      }, options);

      //Create timer and start it
      timer.init(settings.interval);
      timer.register(methods.publish);
      timer.domReady();

      this.each(function() {
        $this = $(this);  
        elements.push({context:$this,dateSelector:settings.dateSelector, callback:settings.callback, mode:settings.mode});
      });
    },

    publish : function(args){
      //No elements
      if(elements.length === 0){
        return false;
      }

      for(var i = 0; i<elements.length;i++){
        var subscription = elements[i],
            el = $(subscription.context).find(subscription.dateSelector),
            date = new Date($(el).html()),      
            result = {};

        if(subscription.mode == "countdown")
          result = dateComparer.getGreedyDiff(new Date(),date);
        else
          result = dateComparer.getTotalDiff(new Date(),date);

        subscription.callback.apply(subscription.context,[result]);
      } 
    },

    destroy : function() {
       return this.each(function(){
         $(window).unbind('.tooltip');
       })
    }
  };

  $.fn.liveDate = function( method ) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.liveDate' );
    }   
  };

})( jQuery );
