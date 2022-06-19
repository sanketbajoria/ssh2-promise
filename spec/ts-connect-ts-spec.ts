import SSHTunnel from '../lib/index'
import SFTP from "../lib/sftp"

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

    it("read stream", async function (done) {
        var sshTunnel = new SSHTunnel(sshConfigs.singleWithKey);
        let sftp: SFTP = sshTunnel.sftp()
        fs.writeFileSync('./test.txt', "Test module");
        try{
            await sftp.fastPut('./test.txt', "/home/sanket/test2.txt");
            expect(1).toBe(1);
            let stream = await sftp.createReadStream("/home/sanket/test2.txt")
            expect(stream).toBeDefined();
            var buffer = "";
            stream.on('data', (data:any) => {
                buffer += data.toString();
            });
            stream.on('error', (err:any) => {
                console.log(err);
            });
            stream.on('close', () => {
                console.log("done - " + buffer);
                done();
            })
        }catch(error){
            expect('1').toBe('2');
            expect(error).toBeUndefined();
            done();
        }finally{
            fs.unlinkSync('./test.txt')
        }
    });
});