angular.module("MyApp").factory("perfService", function () {
    var perfKeys = {};

    return {
        create: function (name, type) {
            perfKeys[name] = {
                type: type,
                name: name,
                count: 0,
                sum: 0,
                average: 0,
                value: 0,
            };
        },

        set: function (name, ms) {
            var perfKey = perfKeys[name];
            if (!perfKey) {
                throw new Error("perfKey: " + name + " was not found");
            }

            if (perfKey.type == "average") {
                perfKey.count++;
                perfKey.sum += ms;
                perfKey.average = perfKey.sum / perfKey.count;
            }
            else if (perfKey.type == "number") {
                perfKey.value = ms;
            }
        },

        getAll: function () {
            return perfKeys;
        }
    };
});

