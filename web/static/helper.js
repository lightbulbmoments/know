(function(){
    
    var accessModifier = {
        "public": {
            enumerable: false,
            writable: true,
            configurable: false
        },
        "protected": {
            enumerable: true,
            writable: false,
            configurable: false
        },
        "private": {
            enumerable: false,
            writable: false,
            configurable: false
        }
    };

    var _self = helper = {
        socket: null,

        socketCallbacks: {
        },

         getSocket: function(requestId, callback){
            var dfd = $.Deferred();
            _self.socketCallbacks[requestId] = callback;
            if(_self.socket && _self.socket.connected){
                dfd.resolve(_self.socket);
            }else{
                _self.socket= io.connect("http://localhost"+":"+"80", {multiplex:false});
                dfd.resolve(_self.socket);
                _self.socket.on("res", function(data){
                    console.log(data);
                    if(_self.socketCallbacks[data.reqid]){
                        _self.socketCallbacks[data.reqid](data);
                        delete _self.socketCallbacks[data.reqid];
                    }
                });
            }
            return dfd;
        },

        generateUUID: function(){
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        }
    }
    /**
     * Publicly accessible object.
     **/
    window['helper'] = helper;

     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties
    Object.defineProperties(helper, {
        
    });

    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
    Object.defineProperty(window, 'helper', accessModifier.private);
}());