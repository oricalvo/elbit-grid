angular.module("MyApp").run(function ($rootScope, $injector, perfService) {

    perfService.create("digest", "average");
    perfService.create("watchers", "number");

    var originalDigest = $rootScope.constructor.prototype.$digest;

    $rootScope.constructor.prototype.$digest = newDigest;

    function newDigest() {
        perfService.set("watchers", $rootScope.$$watchersCount);

        var before = new Date();
        var res = originalDigest.apply(this, arguments);
        var after = new Date();

        perfService.set("digest", (after - before));

        return res;
    }
});
