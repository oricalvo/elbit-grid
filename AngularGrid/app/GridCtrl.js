var Roles = {
    "Admin": 1,
    "User": 2,
};

var ROWS = 10000;
var CHANGES = 0.2;

angular.module("MyApp").controller("GridCtrl", function ($scope, $rootScope, $interval, perfService) {
    var ver = 0;
    var intervalId;
    var data;
    var dataById;

    $rootScope.modifyVersion = ver;
    $scope.extraColumns = 8;
    $scope.rows = ROWS;
    $scope.mergeSize = CHANGES;
    $scope.interval = 1000;

    $scope.gridOptions = {
        enableFullRowSelection: true,
        multiSelect: true,
        enableFiltering: true,
        enableScrollbars: true,
        columnDefs: [],
    };

    var originalColumns = [
        {
            field: "firstName",
            enableCellEdit: true,
            width: 100,
        },
        {
            name: 'lastName',
            editableCellTemplate: "<grid-custom-edit-template class='ui-grid-cell-contents'></grid-custom-edit-template>",
            width: 100,
        },
        {
            name: 'email',
            width: 100,
        },
        {
            name: "birthday",
            type: "date",
            enableCellEdit: true,
            cellFilter: 'date:"yyyy-MM-dd"',
            width: 100,
        },
        {
            name: "isAdmin",
            type: "boolean",
            width: 100,
        },
        {
            name: "role",
            editableCellTemplate: 'ui-grid/dropdownEditor',
            editDropdownOptionsArray: enumToDropdownOptionsArray(Roles),
            cellFilter: "roleName",
            width: 100,
        },
    ];

    rebuildData();

    console.log(window.nativeHost);
    nativeHost.register(changesArrivedFromServer);

    function changesArrivedFromServer(json) {
        var changes = JSON.parse(json);
        mergeChanges(changes);
        //console.log(changes.length);

        $scope.$apply();
    }

    function createPerfCounters() {
        //perfService.create("columns", "number", originalColumns.length + $scope.extraColumns);
        //perfService.create("rows", "number", $scope.rows);
        //perfService.create("changes", "number", ($scope.mergeSize * $scope.rows));
        perfService.create("getInitial", "average");
        perfService.create("getChanges", "average");
        perfService.create("merge", "average");
    }

    function rebuildData() {
        buildColumns();

        data = [];
        createPerfCounters();

        getInitialData().then(function (contacts) {
            data = contacts;

            dataById = buildIndex(data);
            $scope.gridOptions.data = data;

            $scope.$apply();
        });

    }

    $scope.extraColumnsChanged = function () {
        rebuildData();
    }

    $scope.rowsChanged = function () {
        rebuildData();
    }

    $scope.mergeSizeChanged = function () {
        rebuildData();
    }

    $scope.intervalChanged = function () {
        if (intervalId) {
            $scope.stop();

            $scope.start();
        }
    }

    $scope.editCell = function (row, field, scope) {
        console.log("%O %O %O", row, field, scope);
    }

    $scope.addNewRows = function () {
        var id = "10000a";

        var contact = {
            id: id,
            firstName: "FN" + id,
            lastName: "LN" + id,
            email: "EM" + id,
            birthday: new Date(),
            isAdmin: true,
            role: Roles.User,
        };

        for (var j = 0; j < $scope.extraColumns; j++) {
            contact["ex" + (j + 1)] = "ex" + (j + 1) + "_" + id;
        }

        data.push(contact);
    }

    $scope.start = function () {
        if (intervalId) {
            return;
        }

        intervalId = $interval(function () {
            getLatest();
        }, $scope.interval);
    }

    $scope.stop = function () {
        $interval.cancel(intervalId);
        intervalId = null;
    }

    function buildColumns() {
        //$scope.gridOptions.columnDefs = originalColumns;

        var columnDefs = originalColumns.concat([]);

        for (var i = 0; i < $scope.extraColumns; i++) {
            var columnDef = {
                displayName: 'Ex(' + (i+1) + ")",
                name: "ex" + (i+1),
                width: 100,
            }

            columnDefs.push(columnDef);
        }

        $scope.gridOptions.columnDefs = columnDefs;
    }

    function buildIndex(data) {
        var index = {};

        for (var i = 0; i < data.length; i++) {
            var contact = data[i];
            index[contact.id] = contact;
        }

        return index;
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

        for (var i = 1; i <= $scope.rows; i++) {
            arr.push(i);
        }

        for (var i = 0; i < $scope.mergeSize * $scope.rows; i++) {
            var index = Math.floor(Math.random() * 10000) % ($scope.rows - i);
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

        var before = new Date();
        return nativeHost.getInitial($scope.rows, $scope.mergeSize, $scope.extraColumns).then(function (json) {
            var contacts = JSON.parse(json);

            var after = new Date();
            perfService.set("getInitial", after - before);

            return contacts;
        });

        //var data = [];

        //for (var i = 0; i < $scope.rows; i++) {
        //    var id = i + 1;
        //    var contact = {
        //        id: id,
        //        firstName: "FN" + id,
        //        lastName: "LN" + id,
        //        email: "EM" + id,
        //        birthday: new Date(),
        //        isAdmin: true,
        //        role: Roles.User,
        //    };

        //    for (var j = 0; j < $scope.extraColumns; j++) {
        //        contact["ex" + (j + 1)] = "ex" + (j + 1) + "_" + id;
        //    }

        //    data.push(contact);
        //}

        //return data;
    }

    function getLatest() {
        $rootScope.modifyVersion = ++ver;

        var before = new Date();
        nativeHost.getChanges().then(function (changes) {
            var contacts = JSON.parse(changes);

            var after = new Date();
            perfService.set("getChanges", after - before);

            mergeChanges(contacts);
            $scope.$apply();
        });
    }

    function getChanges(ver) {
        var newData = [];

        var ids = getRandomIds();

        var suffix = " (" + ver + ")";
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var contact = {
                id: id,
                firstName: "FN" + id + suffix,
                lastName: "LN" + id + suffix,
                email: "EM" + id + suffix,
                birthday: new Date(),
                isAdmin: false,
                role: Roles.Admin,
            };

            for (var j = 0; j < $scope.extraColumns; j++) {
                contact["ex" + (j + 1)] = "ex" + (j + 1) + "_" + id + suffix;
            }

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

        for (var i = 0; i < $scope.extraColumns; i++) {
            contact["ex" + (i + 1)] = change["ex" + (i + 1)];
        }
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
