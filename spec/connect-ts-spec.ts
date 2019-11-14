import SSHTunnel = require('../dist/index')
var SSHConstants = require("../dist/index").Constants
var SFTP = require("../dist/index").SFTP

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
/* Promise.prototype["finally"] = function (cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
}; */
var fs = require("fs");
var sshConfigs = require('./fixture')//JSON.parse(fs.readFileSync("./spec/fixture.json"));
var util = require('util');

describe("connect to dummy server", function () {
    it("should connect directly to server with password", function (done) {
        var sshTunnel = new SSHTunnel(sshConfigs.singleWithPassword);
        
        sshTunnel.connect().then((ssh: any) => {
            expect(ssh).toBeDefined();
            sshTunnel.close();
            done();
        }, (error: any) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
            sshTunnel.close();
            done();
        });
    });

    it("read stream", function (done) {
        var sshTunnel = new SSHTunnel(sshConfigs.singleWithKey);
        sshTunnel.sftp().createReadStream("/home/ubuntu/abc").then((stream) => {
            expect(stream).toBeDefined();
            var buffer = "";
            stream.on('data', (data) => {
                buffer += data.toString();
            });
            stream.on('error', (err) => {
                console.log(err);
            });
            stream.on('close', () => {
                console.log("done - " + buffer);
                done();
            })
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
            done();
        })
    });
});