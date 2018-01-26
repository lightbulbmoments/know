var know = angular.module('know', []);
know.controller('knowController', ['$scope', '$http', function($scope, $http) {
    $scope.user = {};
    $scope.currentUser = "";

    $scope.taskListener = function(){
        var reqObj = getRequestObject();
        reqObj.reqid = "_" + reqObj.reqid ;
        promise = helper.getSocket(reqObj.reqid, function(data) {
            if(data.status == 200){
                $scope.tasks = data.tasks;
                $scope.$digest();
            }
        });

        promise.done(function(socket) {
            reqObj.rpc = 'fetchTasks';
            socket.emit('event', reqObj);
        });
    }
    
    if(location.pathname != "/"){
        if(!helper.getCookie("user")){
            bootbox.alert("You're not logged in. Please login.", function(){
                location.href= "/"
            })
        }else{
            $scope.currentUser = helper.getCookie("user");
            $scope.taskListener();
        }
    }

    $scope.authenticateUser = function(){
        var reqObj = getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            console.log(data);
            if(data.status == 200){
                helper.setCookie("user", data.user);
                location.href = data.href
            }
        });

        promise.done(function(socket) {
            reqObj.data = $scope.user;
            reqObj.rpc = 'authenticateUser';
            socket.emit('event', reqObj);
        });
    }


    $scope.createUser = function(){
        var reqObj = getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            $("#myModal").toggle()
            if(data.status == 200){
                bootbox.alert("User created.")
            }
        });

        promise.done(function(socket) {
            reqObj.data = $scope.user;
            reqObj.rpc = 'createUser';
            socket.emit('event', reqObj);
        });    
    }

    $scope.createTask = function(){
        var reqObj = getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            $("#taskModal").toggle()
            if(data.status == 200){
                bootbox.alert("Task created.")
            }
        });

        promise.done(function(socket) {
            reqObj.data = $scope.task;
            reqObj.rpc = 'createTask';
            socket.emit('event', reqObj);
        }); 
    }

    $scope.fetchTasks = function(type){
        var reqObj = getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            console.log(data);
            if(data.status == 200){
                $scope.tasks = data.tasks;
                $scope.$digest();
            }else{
                bootbox.alert("No new tasks");
            }
        });

        promise.done(function(socket) {
            if(type == "user"){
                reqObj.data.user = helper.getCookie("user");
            }else{
                reqObj.data.user = "admin";
            }
            reqObj.rpc = 'fetchTasks';
            socket.emit('event', reqObj);
        });
    }

    $scope.checkIn = function(task){
        
        var reqObj = getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            console.log(data);
            if(data.status == 200){
                $scope.$digest();
            }else{
                bootbox.alert("No new tasks");
            }
        });

        promise.done(function(socket) {
            reqObj.data = task;
            reqObj.data.user = helper.getCookie("user");
            reqObj.rpc = 'checkIn';
            socket.emit('event', reqObj);
        });  
    }

    $scope.assignTask = function(task){
        bootbox.prompt("Enter username", function(result){
            console.log(result);
            var reqObj = getRequestObject();
            promise = helper.getSocket(reqObj.reqid, function(data) {
                console.log(data);
                if(data.status == 200){
                    $scope.$digest();
                }else{
                    bootbox.alert("No new tasks");
                }
            });

            promise.done(function(socket) {
                delete task['$$hashKey']; //for timebeing, use inbuilt fns to remove all these attributes
                reqObj.data = task;
                reqObj.data.user = result;
                reqObj.rpc = 'checkIn';
                socket.emit('event', reqObj);
            });  
        });
           
    }
}]);

function getRequestObject() {
    return { reqid: helper.generateUUID(), data: {} };
}