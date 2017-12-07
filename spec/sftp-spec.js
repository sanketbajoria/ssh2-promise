var SSHTunnel = require("../src/index");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
Promise.prototype.finally = function(cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
};
var fs = require("fs");
var sshConfigs = JSON.parse(fs.readFileSync("./spec/fixture.json"));


describe("sftp cmd", function () {
  var sshTunnel;
  beforeAll(() => {
    sshTunnel = new SSHTunnel(sshConfigs.singleWithKey);
    sftp = new SSHTunnel.SFTP(sshTunnel);
  })
  
  it("read dir", function (done) {
    sftp.readdir("/").then((data) => {
        expect(data).toBeDefined();
    }, (error) => {
        expect(error).toBeUndefined();
    }).finally(() => {
        done();
    });
  }); 

  it("write stream", function (done) {
    sftp.createWriteStream("/home/ubuntu/abc").then((stream) => {
        expect(stream).toBeDefined();
        stream.write('dummy\n\n\nasdfjsdaf\n', () => {
            stream.end();
            done();
        });
    }, (error) => {
        expect(error).toBeUndefined();
        done();
    })
  });
  
  it("read stream", function (done) {
    sftp.createReadStream("/home/ubuntu/abc").then((stream) => {
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
        expect(error).toBeUndefined();
        done();
    })
  });

  afterAll(() => {
      sshTunnel.close()
  })

  
  


});   