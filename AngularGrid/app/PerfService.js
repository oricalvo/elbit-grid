angular.module("MyApp").factory("perfService", function () {
    var perfKeys = {};

    return {
        create: function (name, type, value) {
            perfKeys[name] = {
                type: type,
                name: name,
                count: 0,
                sum: 0,
                average: 0,
                value: (value === undefined ? 0 : value),
                values: [],
            };
        },

        set: function (name, ms) {
            var perfKey = perfKeys[name];
            if (!perfKey) {
                throw new Error("perfKey: " + name + " was not found");
            }

            if (perfKey.type == "average") {
                perfKey.values.push(ms);
                perfKey.count++;
                perfKey.sum += ms;

                if (perfKey.count > 10) {
                    var old = perfKey.values.shift();
                    perfKey.count--;
                    perfKey.sum -= old;
                }

                perfKey.average = perfKey.sum / perfKey.count;
            }
            else if (perfKey.type == "number") {
                perfKey.value = ms;
            }
        },

        reset: function (name) {
            var perfKey = perfKeys[name];
            if (perfKey) {
                if (perfKey.type == "number") {
                    perfKey.value = undefined;
                }
                else if (perfKey.type == "average") {
                    perfKey.value = 0;
                    perfKey.average = 0;
                    perfKey.sum = 0;
                    perfKey.count = 0;
                }
            }
        },

        getAll: function () {
            return perfKeys;
        }
    };
});

