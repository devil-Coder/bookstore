/**
 * Created by Raj Chandra on 10/15/2017.
 */
var app = angular.module('vbookstore',["ngRoute"],function($locationProvider){
    $locationProvider.html5Mode(true);
});

app.controller('authController',['$scope','$http','$location',function ($scope,$http,$location) {
    console.log("Loaded auth controller");
    $scope.getRegistered = function () {
        $scope.msgReg = '...';
            $http.post('/auth/save', $scope.customer).then(successCallback, errorCallback);
        function successCallback(response) {
            $scope.regData = response.data;
            switch (parseInt($scope.regData.code)) {
                case 1:
                    $scope.msgReg = "Please verify your email to complete the registration. Check spam if not found.";
                    break;
                case 0:
                    $scope.msgReg = $scope.regData.message;
                    break;
            }
        }

        function errorCallback(error) {
            console.log("Message could not be Obtained !" + error);
        }
    };

    // $scope.verifyLogin = function(){
    //     function getCookie(cname) {
    //         var name = cname + "=";
    //         var decodedCookie = decodeURIComponent(document.cookie);
    //         var ca = decodedCookie.split(';');
    //         for(var i = 0; i < ca.length; i++) {
    //             var c = ca[i];
    //             while (c.charAt(0) === ' ') {
    //                 c = c.substring(1);
    //             }
    //             if (c.indexOf(name) === 0) {
    //                 return c.substring(name.length, c.length);
    //             }
    //         }
    //         return "";
    //     }
    //
    //     function checkCookie() {
    //         var user=getCookie("point-access-token");
    //         if (user) {
    //             window.location.href = '/'; //redirect to home page with logged in message
    //             }
    //         }
    //     }
    //     checkCookie();
    // }

    $scope.getLogin = function () {
        $scope.msgLogin = '...';
        $http.post('/auth/verifyCustomer', $scope.customer).then(successCallback, errorCallback);

        function successCallback(response) {
            $scope.resData = response.data;
            switch (parseInt($scope.resData.code)) {
                case 0:
                    $scope.msgLogin = $scope.resData.message;
                    break;
                case 1:
                    $scope.msgLogin = "Success ! We are redirecting you to homepage.";
                    window.location.href='/users/feeds';
                    break;
            }
        }
        function errorCallback(error) {
            console.log("Message could not be Obtained !" + error);
        }
    };
    $scope.forgotEmailGen = function () {
        $scope.msg = '...';
        $http.post('/auth/forgot', $scope.customer).then(successCallback, errorCallback);

        function successCallback(response) {
            $scope.resData = response.data;
            switch (parseInt($scope.resData.code)) {
                case 1:
                    $scope.msg = $scope.resData.message;
                    break;
                case 0:
                    $scope.msg = $scope.resData.message;
                    break;
            }
        }

        function errorCallback(error) {
            console.log("Message could not be Obtained !" + error);
        }
    };

    $scope.emailGen = function () {
        $scope.msg = '...';
        $http.post('/auth/resend', $scope.customer).then(successCallback, errorCallback);

        function successCallback(response) {
            $scope.resData = response.data;
            switch (parseInt($scope.resData.code)) {
                case 1:
                    $scope.msg = $scope.resData.message;
                    break;
                case 0:
                    $scope.msg = $scope.resData.message;
                    break
            }
        }

        function errorCallback(error) {
            console.log("Message could not be Obtained !" + error);
        }
    };
    $scope.resetPassword = function () {
        $scope.msg = '...';
        if($scope.customer.password){
            var par = window.location.pathname.split("/");
            var token = par[3];

            $http.post('/auth/reset/'+token,$scope.customer).then(successCallback,errorCallback);
            function successCallback(response) {
                $scope.resData = response.data; //getting response
                switch (parseInt($scope.resData.code)) {
                    case 1:
                        $scope.msg = $scope.resData.message;
                        setTimeout(function(){
                            window.location.href='/auth';
                        },3000);
                        break;
                    case 0:
                        $scope.msg = $scope.resData.message;
                        break;
                }
            }

            function errorCallback(error) {
                console.log("Message could not be Obtained !" + error);
            }
        }
        else{
            $scope.msg = "Passwords can't be empty !";
        }
    };
}]);

angular.module('vbookstore').directive('loader', loader);

/**
 * Defines loading spinner behaviour
 *
 * @param {obj} $http
 * @returns {{restrict: string, link: Function}}
 */
function loader($http) {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            scope.$watch(function () {
                return $http.pendingRequests.length;
            }, function (isLoading) {
                if (isLoading) {
                    $(element).show();
                } else {
                    $(element).hide();
                }
            });
        }
    };
}