var know = angular.module('know', []);
var locations = [{ lat: 13.0610734, lng: 80.2343035 },
    { lat: 28.6472799, lng:76.8130629 },
    { lat: 22.6763858, lng: 88.0495259 },
    { lat: 26.8876385, lng: 75.6527823 },
    { lat: 12.9558368, lng: 77.5371157 },
    { lat: 16.7528121, lng: 79.061408 },
    { lat: 18.7801033, lng: 87.6237804 },
    { lat: 20.5761571, lng: 77.9099719 },
    { lat: 21.9139961, lng: 103.7041599 }
];
know.controller('knowController', ['$scope', '$http', function($scope, $http) {
    $scope.user = {};
    $scope.currentUser = "";

    $scope.taskListener = function() {
        console.log("listening to tasks");
        var ref = firebase.database().ref("tasks");
        var mappedLocations = [];
        ref.on("value", function(snapshot) {
            var allTasks = snapshot.val();
            $scope.tasks = allTasks;
            $scope.notification = "task updated";
            
            // small hack to show when a task is updated to admin.
            setTimeout(function(){
                $scope.notification = "";
                $scope.$digest();
            }, 1000)
            $scope.$digest();
            var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var labelIndex = 0;
            for (var key in allTasks) {
                if ($("#map").length && allTasks[key].location && mappedLocations.indexOf(allTasks[key].id) == -1) {
                    mappedLocations.push(allTasks[key].id);
                    // var lat = parseFloat(allTasks[key].location.split(",")[0]);
                    // var lng = -parseFloat(allTasks[key].location.split(",")[1]);
                    // var point = new google.maps.LatLng(lat, long);
                    // heatmap.getData().push(point);   
                    if(typeof allTasks[key].location == "object")
                    var marker = new google.maps.Marker({
                      position: allTasks[key].location,
                      label: labels[labelIndex++ % labels.length],
                      map: map
                    });
                }
            }
        }, function(error) {
            console.log("Error: " + error.code);
        });
    }

    if (location.pathname != "/") {
        if (!helper.getCookie("user")) {
            bootbox.alert("You're not logged in. Please login.", function() {
                location.href = "/"
            })
        } else {
            $scope.currentUser = helper.getCookie("user");
            $scope.taskListener();
        }
    }

    $scope.authenticateUser = function() {
        var reqObj = getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            console.log(data);
            if (data.status == 200) {
                helper.setCookie("user", data.user);
                location.href = data.href
            } else {
                alert("invalid credentials");
            }
        });

        promise.done(function(socket) {
            reqObj.data = $scope.user;
            reqObj.rpc = 'authenticateUser';
            socket.emit('event', reqObj);
        });
    }

    $scope.updateStatus = function(task) {
        bootbox.prompt("Enter status", function(result) {
          var ref = firebase.database().ref("tasks");
            ref.once("value", function(snapshot) {
                var tasks = snapshot.val();
                for (var key in tasks) {
                    if (tasks[key].id == task.id) {
                        tasks[key].status = result;
                        tasks[key].location = locations[Math.floor(Math.random()*(10)+0)];
                    }
                }
                ref.set(tasks);
            }, function(error) {
                console.log("Error: " + error.code);
            });
        });
    }

    $scope.createUser = function() {
        var reqObj = getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            $("#userModal").toggle()
            if (data.status == 200) {
                bootbox.alert("User created.")
            }
        });

        promise.done(function(socket) {
            reqObj.data = $scope.user;
            reqObj.rpc = 'createUser';
            socket.emit('event', reqObj);
        });
    }

    $scope.createTask = function() {
        var reqObj = getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            $("#taskModal").toggle()
            if (data.status == 200) {
                bootbox.alert("Task created.")
            }
        });

        promise.done(function(socket) {
            reqObj.data = $scope.task;
            reqObj.rpc = 'createTask';
            socket.emit('event', reqObj);
        });
    }

    $scope.fetchTasks = function(type) {
        var reqObj = getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            console.log(data);
            if (data.status == 200) {
                $scope.tasks = data.tasks;
                $scope.$digest();
            } else {
                bootbox.alert("No new tasks");
            }
        });

        promise.done(function(socket) {
            if (type == "user") {
                reqObj.data.user = helper.getCookie("user");
            } else {
                reqObj.data.user = "admin";
            }
            reqObj.rpc = 'fetchTasks';
            socket.emit('event', reqObj);
        });
    }

    $scope.checkIn = function(task) {

        var reqObj = getRequestObject();
        promise = helper.getSocket(reqObj.reqid, function(data) {
            console.log(data);
            if (data.status == 200) {
                $scope.$digest();
            } else {
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

    $scope.assignTask = function(task) {
        bootbox.prompt("Enter username", function(result) {
            console.log(result);
            var reqObj = getRequestObject();
            promise = helper.getSocket(reqObj.reqid, function(data) {
                console.log(data);
                if (data.status == 200) {
                    $scope.$digest();
                } else {
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

    $scope.showMap = function() {
        if (firebase.auth().currentUser) {
            $scope.popuplateMap();
        } else {
            login($scope.popuplateMap);
        }
    }

    $scope.popuplateMap = function() {
        // var point = new google.maps.LatLng('51.5033640', '-0.1276250');
        // heatmap.getData().push(point);
        $("#map").toggle();
    }

    // Uses socketio to listen tasks on server side
    // $scope.taskListener = function() {
    //     var reqObj = getRequestObject();
    //     reqObj.reqid = "_" + reqObj.reqid;
    //     promise = helper.getSocket(reqObj.reqid, function(data) {
    //         if (data.status == 200) {
    //             $scope.tasks = data.tasks;
    //             $scope.$digest();
    //         }
    //     });

    //     promise.done(function(socket) {
    //         reqObj.rpc = 'fetchTasks';
    //         socket.emit('event', reqObj);
    //     });
    // }




}]);

function getRequestObject() {
    return { reqid: helper.generateUUID(), data: {} };
}

var map;
// https://developers.google.com/maps/documentation/javascript/firebase
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: { lat: 13.0610734, lng: 80.2343035 }
    });
}

// INIT Firebase
var config = {
    apiKey: "AIzaSyCzWurmHuNeNRWJJc3hWhdMpYsXEfNaepY",
    authDomain: "gae-file-manager.firebaseapp.com",
    databaseURL: "https://gae-file-manager.firebaseio.com",
    projectId: "gae-file-manager",
    storageBucket: "gae-file-manager.appspot.com",
    messagingSenderId: "853183834927"
};
firebase.initializeApp(config);
var database = firebase.database();


var provider = new firebase.auth.GoogleAuthProvider();

function login(callback) {
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        taskListner();
        callback()
        // ...
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
}