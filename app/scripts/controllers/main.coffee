'use strict'

angular.module('ihapApp').controller 'MainCtrl', ($scope, $http) ->
  $http.get('/api/museums').success (museums) ->
    $scope.museums = museums