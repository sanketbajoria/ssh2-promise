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


describe("connect to dummy server", function () {
    it("should connect directly to server with password", function (done) {
        var sshTunnel = new SSHTunnel(sshConfigs.singleWithPassword);
        sshTunnel.connect().then((ssh) => {
            expect(ssh).toBeDefined();
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
        }).finally(() => {
            sshTunnel.close();
            done();
        });
    });

    it("should connect directly to server with key", function (done) {
        var sshTunnel = new SSHTunnel(sshConfigs.singleWithKey);
        sshTunnel.connect().then((ssh) => {
            expect(ssh).toBeDefined();
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
        }).finally(() => {
            sshTunnel.close();
            done();
        });
    });

    it("should not connect directly to server, with no password/pem", function (done) {
        var c = Object.assign({}, sshConfigs.singleWithPassword);
        delete c.password;
        var sshTunnel = new SSHTunnel(c);
        sshTunnel.connect().then((ssh) => {
            expect('1').toBe('2');
            expect(ssh).toBeUndefined();
        }, (error) => {
            expect(error).toBeDefined();
        }).finally(() => {
            sshTunnel.close();
            done();
        });
    });

    it("should not connect directly to server, with wrong password", function (done) {
        var c = Object.assign({}, sshConfigs.singleWithPassword);
        c.password = "asfafwerwrwsdfsfd";
        var sshTunnel = new SSHTunnel(c);
        sshTunnel.connect().then((ssh) => {
            expect(ssh).toBeUndefined();
        }, (error) => {
            expect(error).toBeDefined();
        }).finally(() => {
            sshTunnel.close();
            done();
        });
    });

    it("should connect with password prompt directly to server", function (done) {
        var c = Object.assign({}, sshConfigs.singleWithPassword);
        var temp = c.password;
        delete c.password;
        c.tryKeyboard = true;
        var sshTunnel = new SSHTunnel(c);
        var stdin = require('mock-stdin').stdin();

        function hook_stdout() {
            var old_write = process.stdout.write;
            process.stdout.write = (function (write) {
                return function (string, encoding, fd) {
                    write.apply(process.stdout, arguments);
                    if (string.toString().toLowerCase().indexOf("password") >= 0) {
                        setTimeout(function () {
                            stdin.send(temp + "\n", "ascii");
                        }, 1000);
                    }
                }
            })(process.stdout.write)
            return function () {
                process.stdout.write = old_write;
            }
        }

        var unhook = hook_stdout()


        sshTunnel.connect().then((ssh) => {
            expect(ssh).toBeDefined();
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
        }).finally(() => {
            sshTunnel.close();
            unhook();
            stdin.end();
            done();
        });
    });

    it("should connect to server with hopping", function (done) {
        var sshTunnel1 = new SSHTunnel(sshConfigs.multiple[0])
        var sshTunnel = new SSHTunnel(sshConfigs.multiple);
        sshTunnel1.connect().then(() => {
            return sshTunnel.connect().then((ssh) => {
                expect(ssh).toBeDefined();
            }, (error) => {
                expect('1').toBe('2');
                expect(error).toBeUndefined();
            }).finally(() => {
                sshTunnel.close();
                console.log("closed one")
                done();
            });
        }).finally(() => {
            sshTunnel1.close();
            done()
        })
    });

    it("should check the cache and listeners attached to server, after connect and after disconnect", function (done) {
        var sshTunnel = new SSHTunnel(sshConfigs.multiple);
        sshTunnel.connect().then((ssh) => {
            expect(ssh).toBeDefined();
            expect(Object.keys(SSHTunnel.__cache).length).toBe(2);
            Object.keys(SSHTunnel.__cache).forEach((k) => {
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.SSH)).toBe(1);
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.TUNNEL)).toBe(1);
                expect(SSHTunnel.__cache[k].listenerCount(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`)).toBe(1);
            });
        }, (error) => {
            expect(error).toBeUndefined();
        }).finally(() => {
            sshTunnel.close().then(() => {
                Object.keys(SSHTunnel.__cache).forEach((k) => {
                    expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.SSH)).toBe(0);
                    expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.TUNNEL)).toBe(0);
                    expect(SSHTunnel.__cache[k].listenerCount(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`)).toBe(0);
                });
                done();
            });

        });
    });


    it("should check the cache and listeners attached to server, with multiple tunnels, after connect and after disconnect", function (done) {
        var sshTunnel = new SSHTunnel(sshConfigs.multiple);
        var sshTunnel2 = new SSHTunnel(sshConfigs.multiple)
        sshTunnel.connect().then((ssh) => {
            expect(ssh).toBeDefined();
            expect(Object.keys(SSHTunnel.__cache).length).toBe(2);
            Object.keys(SSHTunnel.__cache).forEach((k) => {
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.SSH)).toBe(1);
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.TUNNEL)).toBe(1);
                expect(SSHTunnel.__cache[k].listenerCount(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`)).toBe(1);
            });
            return sshTunnel2.connect();
        }, (error) => {
            expect(error).toBeUndefined();
        }).then((ssh) => {
            expect(ssh).toBeDefined();
            expect(Object.keys(SSHTunnel.__cache).length).toBe(2);
            Object.keys(SSHTunnel.__cache).forEach((k) => {
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.SSH)).toBe(2);
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.TUNNEL)).toBe(2);
                expect(SSHTunnel.__cache[k].listenerCount(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`)).toBe(2);
            });
            return sshTunnel.close();
        }, (error) => {
            expect(error).toBeUndefined();
        }).then(() => {
            expect(Object.keys(SSHTunnel.__cache).length).toBe(2);
            Object.keys(SSHTunnel.__cache).forEach((k) => {
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.SSH)).toBe(1);
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.TUNNEL)).toBe(1);
                expect(SSHTunnel.__cache[k].listenerCount(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`)).toBe(1);
            });
            return sshTunnel2.close();
        }).finally(() => {
            expect(Object.keys(SSHTunnel.__cache).length).toBe(0);
            Object.keys(SSHTunnel.__cache).forEach((k) => {
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.SSH)).toBe(0);
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.TUNNEL)).toBe(0);
                expect(SSHTunnel.__cache[k].listenerCount(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`)).toBe(0);
            });
            done();
        });
    }); 

    it("should check the cache and listeners attached to server, with multiple tunnels, after connect and after disconnect", function (done) {

        var sshTunnel = new SSHTunnel(sshConfigs.couchmultiple);
        var sshTunnel2 = new SSHTunnel(sshConfigs.couchmultiple)
        sshTunnel.connect().then((ssh) => {
            expect(ssh).toBeDefined();
            expect(Object.keys(SSHTunnel.__cache).length).toBe(2);
            Object.keys(SSHTunnel.__cache).forEach((k) => {
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.SSH)).toBe(1);
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.TUNNEL)).toBe(1);
                expect(SSHTunnel.__cache[k].listenerCount(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`)).toBe(1);
            });
            return sshTunnel2.connect();
        }, (error) => {
            expect(error).toBeUndefined();
        }).then((ssh) => {
            expect(ssh).toBeDefined();
            expect(Object.keys(SSHTunnel.__cache).length).toBe(2);
            Object.keys(SSHTunnel.__cache).forEach((k) => {
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.SSH)).toBe(2);
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.TUNNEL)).toBe(2);
                expect(SSHTunnel.__cache[k].listenerCount(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`)).toBe(2);
            });
            return sshTunnel.close();
        }, (error) => {
            expect(error).toBeUndefined();
        }).then(() => {
            expect(Object.keys(SSHTunnel.__cache).length).toBe(2);
            Object.keys(SSHTunnel.__cache).forEach((k) => {
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.SSH)).toBe(1);
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.TUNNEL)).toBe(1);
                expect(SSHTunnel.__cache[k].listenerCount(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`)).toBe(1);
            });
            return sshTunnel2.close();
        }).finally(() => {
            expect(Object.keys(SSHTunnel.__cache).length).toBe(0);
            Object.keys(SSHTunnel.__cache).forEach((k) => {
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.SSH)).toBe(0);
                expect(SSHTunnel.__cache[k].listenerCount(SSHConstants.CHANNEL.TUNNEL)).toBe(0);
                expect(SSHTunnel.__cache[k].listenerCount(`${SSHConstants.CHANNEL.SSH}:${SSHConstants.STATUS.DISCONNECT}`)).toBe(0);
            });
            done();
        });
    }); 

    it("should check the cache and listeners attached to server, with multiple tunnels, after connect and after disconnect", function (done) {

        var sshTunnel = new SSHTunnel(sshConfigs.couchmultiple);
        sshTunnel.on("ssh:beforeconnect", (sshConnection, payload) => {
            console.log("adsf");
        })
        sshTunnel.connect().then((ssh) => {

        }).finally(() => {
            console.log("finish")
            done();
        })
    }); 
});   