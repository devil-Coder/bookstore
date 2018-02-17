/**
 * Created by Raj Chandra on 10/15/2017.
 */
var app = angular.module('store',["ngRoute"],function($locationProvider){
    $locationProvider.html5Mode(true);
});

app.controller('productsController',['$scope','$http','$location',function ($scope,$http,$location) {
    $scope.getUserInformation = function() {
        $http.get('/user/profile').then(successCallback, errorCallback);
        function successCallback(response) {
            $scope.user = response.data;
        }

        function errorCallback(error) {
            console.log("User could not be Obtained !" + error);
        }
    }
    $scope.searchData = function() {
        $http.get('/products/search',$scope.query).then(successCallback, errorCallback);
        function successCallback(response) {
            $scope.productData = response.data;
        }

        function errorCallback(error) {
            console.log("User could not be Obtained !" + error);
        }
    }
    $scope.getAllProducts = function () {
        $http.post('/products').then(successCallback, errorCallback);
        function successCallback(response) {
            $scope.productData = response.data;
            console.log(response.data);
        }

        function errorCallback(error) {
            console.log("Products could not be Obtained !" + error);
        }
    };
    $scope.addProduct = function () {
        console.log( $scope.productAdd);
        $http.post('/products/add', $scope.productAdd).then(successCallback, errorCallback);
        function successCallback(response) {
            $scope.postProductAddedMsg = response.data;
        }

        function errorCallback(error) {
            console.log("Products could not be Added !" + error);
        }
    };
    $scope.updateProduct = function () {
        var id = $routeParams.id;
        $http.put('/products/update/' + id, $scope.product).then(successCallback, errorCallback);
        function successCallback(response) {
            $scope.productEditedMsg = response.data;
        }

        function errorCallback(error) {
            console.log("Products could not be Edited !" + error);
        }
    };
    $scope.deleteProduct = function (id) {
        $http.delete('/products/delete/' + id).then(success, error);
        function success(response) {
            $location.path('/');
        }

        function error(error) {
            console.log("Couldn't delete the data");
        }
    };
}]);
