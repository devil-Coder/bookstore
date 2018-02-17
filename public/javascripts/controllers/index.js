/**
 * Created by Raj Chandra on 10/15/2017.
 */
var app = angular.module("store", ["ngRoute"]);

app.config(function($routeProvider){
    $routeProvider
        .when("/",{
            template : "There is no page available"
        })
        .otherwise({
            template:"404 - Page not found"
        });
});