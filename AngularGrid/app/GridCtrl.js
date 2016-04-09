var Roles = {
    "Admin": 1,
    "User": 2,
};

var ROWS = 10000;
var CHANGES = 2000;

angular.module("MyApp").controller("GridCtrl", function ($scope, $rootScope, $interval, perfService) {
    var data = getInitialData();
    var dataById = buildIndex(data);
    var ver = 0;
    var intervalId;
    $rootScope.modifyVersion = ver;

    perfService.create("merge", "average");

    $scope.gridOptions = {
        enableFullRowSelection: true,
        multiSelect: true,
        enableFiltering: true,
    };

    $scope.gridOptions.columnDefs = [
        {
            name: 'firstName',
            enableCellEdit: true
        },
        {
            name: 'lastName',
            editableCellTemplate: "<grid-custom-edit-template class='ui-grid-cell-contents'></grid-custom-edit-template>"
        },
        { name: 'email' },
        {
            name: "birthday",
            type: "date",
            enableCellEdit: true,
            cellFilter: 'date:"yyyy-MM-dd"'
        },
        {
            name: "isAdmin",
            type: "boolean"
        },
        {
            name: "role",
            editableCellTemplate: 'ui-grid/dropdownEditor',
            editDropdownOptionsArray: enumToDropdownOptionsArray(Roles),
            cellFilter: "roleName",
        },
    ];

    $scope.gridOptions.data = data;

    $scope.editCell = function (row, field, scope) {
        console.log("%O %O %O", row, field, scope);
    }

    $scope.start = function () {
        if (intervalId) {
            return;
        }

        intervalId = $interval(function () {
            getLatest();
        }, 1000);
    }

    $scope.stop = function () {
        $interval.cancel(intervalId);
        intervalId = null;
    }

    function buildIndex(data) {
        var index = {};

        for (var i = 0; i < data.length; i++) {
            var contact = data[i];
            index[contact.id] = contact;
        }

        return index;
    }

    function getLatest() {
        $rootScope.modifyVersion = ++ver;

        var changes = getChanges(ver);

        mergeChanges(changes);
    }

    function mergeChanges(changes) {
        var before = new Date();

        for (var i = 0; i < changes.length; i++) {
            var change = changes[i];

            var contact = dataById[change.id];
            if (!contact) {
                throw new Error("Contact with id: " + change.id + " was not found");
            }

            merge(contact, change);
        }

        var after = new Date();

        perfService.set("merge", after - before);
    }

    function getRandomIds() {
        var arr = [];
        var ids = [];

        for (var i = 1; i <= ROWS; i++) {
            arr.push(i);
        }

        for (var i = 0; i < CHANGES; i++) {
            var index = Math.floor(Math.random() * 10000) % (ROWS - i);
            var id = arr[index];
            if (id === undefined) {
                throw new Error("Invalid id: " + id);
            }
            ids.push(id);

            arr[index] = arr.pop();
        }

        return ids;
    }

    function getInitialData() {
        var data = [];

        for (var i = 0; i < ROWS; i++) {
            var id = i + 1;
            var contact = {
                id: id,
                firstName: "Ori" + id,
                lastName: "Calvo" + id,
                email: "ori@gmail.com" + id,
                birthday: new Date(),
                isAdmin: true,
                role: Roles.User,
            };

            data.push(contact);
        }

        return data;
    }

    function getChanges(ver) {
        var newData = [];

        var ids = getRandomIds();

        var suffix = " (" + ver + ")";
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var contact = {
                id: id,
                firstName: "Ori" + id + suffix,
                lastName: "Calvo" + id + suffix,
                email: "ori@gmail.com" + id + suffix,
                birthday: new Date(),
                isAdmin: false,
                role: Roles.Admin,
            };

            newData.push(contact);
        }

        return newData;
    }

    function merge(contact, change) {
        contact.firstName = change.firstName;
        contact.lastName = change.lastName;
        contact.email = change.email;
        contact.isAdmin = change.isAdmin;
        contact.modifyVersion = $rootScope.modifyVersion;
    }

    function enumToDropdownOptionsArray(e) {
        var arr = [];

        for (var key in e) {
            arr.push({ id: e[key], value: key });
        }

        return arr;
    }
});

angular.module("MyApp").filter("roleName", function () {
    var map = {};
    for (var key in Roles) {
        map[Roles[key]] = key;
    }

    return function (value) {
        return map[value];
    }
});

function GridCustomEditTemplateController($scope, $uibModal, $element) {
    var button = $element.find("button");
    button.focus();

    button.bind("blur", function () {
        $scope.$emit("uiGridEventEndCellEdit");
    });

    $scope.blur = function () {
        $scope.$emit("uiGridEventEndCellEdit");
    }

    $scope.edit = function (row, col) {
        console.log("%O %O", row, col);

        var contact = row.entity;

        var modalInstance = $uibModal.open({
            template: "<input-form value='value' on-ok='onOk(value)'></input-form>",
            size: "sm",
            controller: function ($scope) {
                $scope.value = contact.lastName;

                $scope.onOk = function (value) {
                    contact[col.field] = value;

                    modalInstance.close();
                }
            }
        });

        modalInstance.result.finally(function () {
            $scope.$emit("uiGridEventEndCellEdit");
        });
    }
}

angular.module("MyApp").directive("gridCustomEditTemplate", function () {
    return {
        restrict: "E",
        controller: GridCustomEditTemplateController,
        template: "<span>{{row.entity[col.field]}}</span><button autofocus ng-click='edit(row, col)'>...</button>",
    };
});
