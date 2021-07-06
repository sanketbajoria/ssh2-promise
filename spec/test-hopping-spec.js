var SSHTunnel = require("../lib/index");
var SSHConstants = require("../lib/index").Constants;


jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
Promise.prototype.finally = function (cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
};
var fs = require("fs");
var sshConfigs = require('./fixture')//JSON.parse(fs.readFileSync("./spec/fixture.json"));
var util = require('util');


describe("connect to dummy server via hopping", function () {
    it("should connect to server with hopping with default nc", function (done) {
        var sshTunnel = new SSHTunnel(sshConfigs.multiple);
        var sshTunnel1 = new SSHTunnel(sshConfigs.multiple);
        return sshTunnel.connect().then((ssh) => {
            expect(ssh).toBeDefined();
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
        }).finally(() => {
            return sshTunnel1.connect();
        }).finally(() => {
            sshTunnel.close();
            sshTunnel1.close();
            console.log("closed one")
            done();
        });
        
    });
 
});   