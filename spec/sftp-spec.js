var SSHTunnel = require("../lib/index");
var fs = require('fs')
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
Promise.prototype.finally = function (cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
};
var fs = require("fs");
var sshConfigs = require('./fixture') //var sshConfigs = JSON.parse(fs.readFileSync("./spec/fixture.json"));


describe("sftp cmd", function () {
    var sshTunnel;
    beforeAll(() => {
        sshTunnel = new SSHTunnel(sshConfigs.singleWithKey);
        sftp = sshTunnel.sftp();//new SSHTunnel.SFTP(sshTunnel);//sshTunnel.sftp()
    });


    it("read/write file", function (done) {
        (async function(){
            try{
                await sftp.mkdir('/home/sanket/dummy')
                await sftp.rmdir('/home/sanket/dummy');
                expect(1).toBe(1);
            }catch(err){
                expect(1).toBe(0);
            }finally{
                done();
            }
        })();
    });

   it("read/write file", function (done) {
        (async function(){
            try{
                await sshTunnel.exec("rm", ["-rf", "/home/sanket/dummy"])
                await sftp.writeFile('/home/sanket/dummy', "testing123");
                var content = await sftp.readFile('/home/sanket/dummy', "utf8");
                expect(content).toBe("testing123");
            }catch(err){
                expect(1).toBe(0);
            }finally{
                sshTunnel.exec("rm", ["-rf", "/home/sanket/dummy"])
                done();
            }
        })();
    }); 

    it("fast put file", function (done) {
        (async function(){
            try{
                fs.writeFileSync('./test.txt', "Test module");
                await sftp.fastPut('./test.txt', "/home/sanket/test2.txt");
                expect(1).toBe(1);
                await sftp.fastGet("/home/sanket/test2.txt", './test2.txt');
                fs.unlinkSync("./test2.txt");
                var content = await sftp.readFile('/home/sanket/test2.txt', "utf8");
                expect(content).toBe("Test module");
            }catch(err){
                console.log(err);
                expect(1).toBe(0);
            }finally{
                fs.unlinkSync('./test.txt')
                done();
            }
        })();
    });

    it("read dir", function (done) {
        sftp.readdir("/").then((data) => {
            expect(data).toBeDefined();
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
        }).finally(() => {
            done();
        });
    });

    it("write stream", function (done) {
        sftp.createWriteStream("/home/sanket/abc").then((stream) => {
            expect(stream).toBeDefined();
            stream.write('dummy\n\n\nasdfjsdaf\n', () => {
                stream.end(() => {
                    done();
                });
            });
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
            done();
        })
    });

    it("read stream", function (done) {
        sftp.createReadStream("/home/sanket/abc").then((stream) => {
            expect(stream).toBeDefined();
            var buffer = "";
            stream.on('data', (data) => {
                buffer += data.toString();
            });
            stream.on('error', (err) => {
                console.log(err);
            });
            stream.on('close', () => {
                console.log(buffer);
                done();
            })
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
            done();
        })
    });

    it("get stats", function (done) {
        sftp.getStat("/home/sanket/abc", "r").then((stat) => {
            expect(stat).toBeDefined();
            done();
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
            done();
        })
    });

    it("set stats", function (done) {
        sftp.setStat("/home/sanket/abc", { mode: 0755 }).then(() => {
            expect(1).toBe(1);
        }, (err) => {
            expect(err).toBeUndefined();
        }).finally(() => {
            done();
        });
    });

    it("update time & access time", function (done) {
        sftp.changeTimestamp("/home/sanket/abc", new Date().getTime(), new Date().getTime()).then(() => {
            expect(1).toBe(1);
        }, (err) => {
            expect(err).toBeUndefined();
        }).finally(() => {
            done();
        });
    });

    it("unable to chown to root", function (done) {
        sftp.changeOwner("/home/sanket/abc", 0, 0).then((handle) => {
            expect('1').toBe('2');
        }, (err) => {
            expect(1).toBe(1);
            expect(err).toBeDefined();
        }).finally(() => {
            done();
        });
    }); 

    it("rename file", async function (done) {
        await sshTunnel.exec("rm", ["-rf", "/home/sanket/*"])
        sftp.createWriteStream("/home/sanket/abc").then((stream) => {
            expect(stream).toBeDefined();
            stream.write('dummy\n\n\nasdfjsdaf\n', () => {
                stream.end(() => {
                    expect('1').toBe('1');
                    sftp.rename("/home/sanket/abc", "/home/sanket/newabc").then(() => {
                        expect('1').toBe('1')
                    }).catch((err) => {
                        console.log(err.message);
                        expect('1').toBe('2')
                    }).finally(() => {
                        done();
                    })
                });
            });
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
            done();
        })
    });

    it("move file to different location", function (done) {
        sftp.changeOwner("/home/sanket/abc", 0, 0).then((handle) => {
            expect('1').toBe('2');
        }, (err) => {
            expect(1).toBe(1);
            expect(err).toBeDefined();
        }).finally(() => {
            done();
        });
    });
   
    afterAll(() => {
        sshTunnel.close()
    })

});   