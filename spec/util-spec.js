var SSHUtils = require("../lib/index").Utils;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
Promise.prototype.finally = function(cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
};


describe("utils", function () {
  
  it("resolve deferred promise, with success", function (done) {
    var deferred = SSHUtils.createDeferredPromise();
    deferred.promise.then((data) => {
        expect(data).toBe("success");
    }, (error) => {
        expect(error).toBeUndefined();
    }).finally(done);
    deferred.resolve("success");
  }); 

  it("reject deferred promise, with error", function (done) {
    var deferred = SSHUtils.createDeferredPromise();
    deferred.promise.then((data) => {
        expect(data).toBeUndefined();
    }, (error) => {
        expect(error).toBe("error");
    }).finally(done);
    deferred.reject("error");
  }); 
  


});   