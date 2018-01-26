module.exports = Server;

function Server(config) {
	var self = this;
	self.init = init;
	self.authenticateUser = authenticateUser;
	self.createUser = createUser;
	self.createTask = createTask;
	self.fetchTasks = fetchTasks;
    var firebase = require('firebase');
    var app = firebase.initializeApp(config.firebase);
    
    function authenticateUser(data, callback){
    	var body = data.data;
    	var ref = firebase.database().ref(body.username);
	    ref.on("value", function(snapshot) {
	    	var user = snapshot.val();
	    	console.log(user)
	    	if(user && user.pwd == body.pwd){
	    		var href = "/user"
	    		if(user.type == "admin"){
	    			href = "/admin"
	    		}
	    		callback({status:200, reqid: data.reqid, href: href, user: body.username})
	    	}else{
	    		callback({status:404, reqid: data.reqid})
	    	}
	    }, function(error) {
	        console.log("Error: " + error.code);
	    });
    }

	function createUser(data, callback){
    	var body = data.data;
    	firebase.database().ref(body.username).set({
			pwd: body.pwd,
			type: "user"
		});  
		callback({status:200, reqid: data.reqid})
    }

    function createTask(data, callback){
    	var body = data.data;
    	console.log("we aer ere");
    	firebase.database().ref("tasks").push({
			name: body.name,
			type: body.type,
			id: new Date().getTime()
		});  
		callback({status:200, reqid: data.reqid})
    }

    function fetchTasks(data, callback){
    	var ref = firebase.database().ref("tasks");
	    ref.on("value", function(snapshot) {
	    	var tasks = snapshot.val();
	    	callback({status:200, reqid: data.reqid, tasks:tasks})
	    }, function(error) {
	        console.log("Error: " + error.code);
	    });
    }
    function init() {
        firebase.auth().signInWithEmailAndPassword(config.admin.username, config.admin.password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
        });
    }

}