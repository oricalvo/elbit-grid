(function () {

    function InputFormController($scope) {
        $scope.ok = function () {
            $scope.onOk({ value: $scope.value });
        }
    }

    angular.module("MyApp").directive("inputForm", function () {
        return {
            restrict: "E",
            controller: InputFormController,
            templateUrl: "/app/InputForm.html",
            scope: {
                value: "<",
                onOk: "&",
            }
        };
    });

})();
