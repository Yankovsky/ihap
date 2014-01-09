'use strict'

angular.module('ihapApp').controller 'MainCtrl', ($scope, $http, mapService) ->
  $http.get('/api/museums').success (museums) ->
    $scope.museums = museums
  mapService()