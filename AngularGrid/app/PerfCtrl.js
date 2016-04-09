angular.module("MyApp").controller("PerfCtrl", function ($scope, perfService) {
    $scope.perfKeys = perfService.getAll();
});
