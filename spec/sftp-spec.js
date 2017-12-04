var SSHTunnel = require("../src/index");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
Promise.prototype.finally = function(cb) {
    const res = () => this;
    const fin = () => Promise.resolve(cb()).then(res);
    return this.then(fin, fin);
};
describe("sftp cmd", function () {
  var sshTunnel;
  beforeAll(() => {
    var sshConfig = {
        username: "demo",
        host: "test.rebex.net",
        password: "password"
    }
    sshTunnel = new SSHTunnel(sshConfig);
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

  
  it("read stream", function (done) {
    sftp.createReadStream("/home/Relay-DEV-Tunnel-Service/temp/test.sh").then((stream) => {
        expect(stream).toBeDefined();
        var buffer = "";
        stream.on('data', (data) => {
            buffer += data;
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

  it("write stream", function (done) {
    sftp.createWriteStream("/home/Relay-DEV-Tunnel-Service/temp/abc").then((stream) => {
        expect(stream).toBeDefined();
        stream.end('dummy');
        done();
    }, (error) => {
        expect(error).toBeUndefined();
        done();
    })
  });

  afterAll(() => {
      sshTunnel.close()
  })

  
  


});   