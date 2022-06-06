var SSHTunnel = require("../lib/index");
var fs = require('fs')
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
Promise.prototype.finally = function (cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
};
var fs = require("fs");
var sshConfigs = require('./fixture'); //var sshConfigs = JSON.parse(fs.readFileSync("./spec/fixture.json"));
const { Z_STREAM_END } = require("zlib");


describe("sftp cmd", function () {
    var sshTunnel;
    let path = "/home/sanket/sftp"
    beforeAll(() => {
        sshTunnel = new SSHTunnel(sshConfigs.singleWithKey);
        sftp = sshTunnel.sftp();//new SSHTunnel.SFTP(sshTunnel);//sshTunnel.sftp()
    });

    beforeEach(async () => {
        await sshTunnel.exec("rm", ["-rf", path])
        await sshTunnel.exec("mkdir", [path])
    })



    it("create/delete folder", async () => {
        await sftp.mkdir(`${path}/test1`)
        expect(await sshTunnel.exec("ls", [path])).toContain("test1");
        await sftp.rmdir(`${path}/test1`);
        expect(await sshTunnel.exec("ls", [path])).not.toContain("test1");
        expect(1).toBe(1);
    });

    it("read/write file ", async () => {
        await sftp.writeFile(`${path}/dummy`, "testing123");
        var content = await sftp.readFile(`${path}/dummy`, "utf8");
        expect(content).toBe("testing123");
    });

    it("fast get/put file", async () => {
        try {
            //mock data
            fs.writeFileSync('./test.txt', "Test module");

            //fast put
            await sftp.fastPut('./test.txt', `${path}/test2.txt`);
            let content = await sftp.readFile(`${path}/test2.txt`, "utf8");
            expect(content).toBe("Test module");

            //fast get
            await sftp.fastGet(`${path}/test2.txt`, './test2.txt');
            expect(fs.readFileSync("./test2.txt").toString()).toBe("Test module")
        } finally {
            fs.unlinkSync('./test.txt')
            fs.unlinkSync("./test2.txt");
        }
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
        sftp.createWriteStream(`${path}/abc`).then((stream) => {
            expect(stream).toBeDefined();
            stream.write("dummy");
            stream.end("test");
            stream.on("finish", async () => {
                expect(await sshTunnel.exec("cat", [`${path}/abc`])).toContain("dummytest");
                done();
            })
            stream.on("error", (data) => {
                expect('1').toBe('2');
                expect(error).toBeUndefined();
                done();
            })
        }, (error) => {
            expect('1').toBe('2');
            expect(error).toBeUndefined();
            console.log(error);
            done();
        })
    });

    it("read stream", async (done) => {
        //mock data
        await sshTunnel.exec("echo", ['dummytest', '>', `${path}/def`])

        //Test readstream
        let stream = await sftp.createReadStream(`${path}/def`)
        expect(stream).toBeDefined();
        var buffer = "";
        stream.on('data', (data) => {
            buffer += data.toString();
        });
        stream.on('error', (err) => {
            console.log(err);
            done();
        });
        stream.on('close', () => {
            expect(buffer).toContain("dummytest")
            done();
        })
    });

    it("get stats", async () => {
        //mock data
        await sshTunnel.exec("echo", ['dummytest', '>', `${path}/xyz`])

        //Test stat
        let stat = await sftp.getStat(`${path}/xyz`, "r")
        expect(stat).toBeDefined();
    });

    it("set stats", async () => {
        //mock data
        await sshTunnel.exec("echo", ['dummytest', '>', `${path}/stat1`])

        //Test set stats
        await sftp.setStat(`${path}/stat1`, { mode: 0755 })
        expect(1).toBe(1);

    });

    it("update time & access time", async () => {
        //mock data
        await sshTunnel.exec("echo", ['dummytest', '>', `${path}/testTime`])

        await sftp.changeTimestamp(`${path}/testTime`, new Date().getTime(), new Date().getTime())
        expect(1).toBe(1);
    });

    it("unable to chown to root", async () => {
        //mock data
        await sshTunnel.exec("echo", ['dummytest', '>', `${path}/testOwner`])

        //try to change ownership to root
        try {
            await sftp.changeOwner(`${path}/testOwner`, 0, 0);
            expect(1).toBe(2);
        } catch (err) {
            expect(1).toBe(1);
            expect(err.message).toContain("Permission denied")
        }
    });

    it("rename/move file", async () => {
        //mock data
        await sshTunnel.exec("echo", ['dummytest', '>', `${path}/renfile`])
        expect(await sshTunnel.exec("ls", [path])).toContain("renfile")

        //Test rename/move file
        sftp.rename(`${path}/renfile`, `${path}/updatefile`)
        expect(await sshTunnel.exec("ls", [path])).not.toContain("renfile")
        expect(await sshTunnel.exec("ls", [path])).toContain("updatefile")
    });

    afterAll(() => {
        sshTunnel.close()
    })

});