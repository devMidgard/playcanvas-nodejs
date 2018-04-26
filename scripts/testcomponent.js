var TestComponent = pc.createScript('testComponent');

TestComponent.prototype.initialize = function () {
    console.log("test component init!");
};

TestComponent.prototype.update = function (dt) {
    console.log("update");
};

TestComponent.prototype.postUpdate = function () {
};