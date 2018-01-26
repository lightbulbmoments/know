var know = angular.module('know', []);
know.controller('knowController', ['$scope', '$http', function($scope, $http) {
    $scope.user = {};
    
    $scope.authenticateUser = function(){
        var reqObj = $scope.getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            console.log(data);
            if(data.status == 200){
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
        var reqObj = $scope.getRequestObject();
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
        var reqObj = $scope.getRequestObject();
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

    $scope.fetchTasks = function(){
        var reqObj = $scope.getRequestObject();
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
            reqObj.data = $scope.task;
            reqObj.rpc = 'fetchTasks';
            socket.emit('event', reqObj);
        });
    }
    $scope.getRequestObject = function() {
        return { reqid: helper.generateUUID(), data: {} };
    }

}]);

