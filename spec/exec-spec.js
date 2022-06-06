var SSHTunnel = require("../lib/index");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
Promise.prototype.finally = function (cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
};
var fs = require("fs");
var sshConfigs = require('./fixture')//JSON.parse(fs.readFileSync("./spec/fixture.json"));

describe("exec n spawn cmd", function () {
    var sshTunnel;
    beforeAll(() => {
        sshTunnel = new SSHTunnel(sshConfigs.singleWithKey);
    })

    it("exec a command", function (done) {
        sshTunnel.exec("whoami").then((username) => {
            expect(username.trim()).toEqual("sanket");
        }, (error) => {
            expect(error).toBeUndefined();
        }).finally(() => {
            done();
        });
    });

    it("open sftp session", function (done) {
        sshTunnel.rawSFTP().then((sftp) => {
            expect(sftp).toBeDefined();
            expect(sftp.readdir).toBeDefined();
        }, (error) => {
            expect(error).toBeUndefined();
        }).finally(() => {
            done();
        });
    });

    it("open shell session", function (done) {
        sshTunnel.shell().then((socket) => {
            expect(socket).toBeDefined();
        }, (error) => {
            expect(error).toBeUndefined();
        }).finally(() => {
            done();
        });
    });

    it("open socks server", function (done) {
        sshTunnel.getSocksPort().then((port) => {
            expect(port).toBeDefined();
        }, (error) => {
            expect(error).toBeUndefined();
        }).finally(() => {
            done();
        });
    });

    it("open forward tunnel connection", function (done) {
        sshTunnel.addTunnel({ remoteAddr: "www.google.com", remotePort: "443" }).then((tunnel) => {
            expect(tunnel.localPort).toBeDefined();
        }, (error) => {
            expect(error).toBeUndefined();
        }).finally(() => {
            done();
        });
    });

    it("x11 should not get established", function (done) {
        sshTunnel.x11("xeyes").then((data) => {
            expect('1').toBe('2');
            done()
        }, (err) => {
            expect(err).toBeDefined();
            done();
        }).finally(() => {
            done();
        });
    });

    it("subsys should be established", function (done) {
        sshTunnel.subsys('sftp').then((stream) => {
            expect(stream).toBeDefined();
            expect(stream.pipe).toBeDefined();
        }, (err) => {
            expect('1').toBe('2');
        }).finally(() => {
            done()
        });
    });
    
    it("subsys should throw error", function (done) {
        sshTunnel.subsys('dummy').then((stream) => {
            expect('1').toBe('2');
        }, (err) => {
            expect(err).toBeDefined();
        }).finally(() => {
            done()
        });
    });

    it("exec a command with error", function (done) {
        sshTunnel.exec("mkdir abc && mkdir abc").then(() => {
            expect('1').toBe('2');
        }, (error) => {
            expect(error).toBeDefined();
            expect(error).toBe("mkdir: can't create directory 'abc': File exists\n")
        }).finally(() => {
            done();
        });
    });

    afterAll(() => {
        sshTunnel.close()
    })


});   